import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface ReceiptPayment {
  date: string;
  amount: number;
  method?: string | null;
  reference?: string | null;
}

export interface ReceiptData {
  schoolName: string;
  schoolLogoUrl?: string | null;
  studentName: string;
  className?: string | null;
  parentName?: string | null;
  payments: ReceiptPayment[];
  tuitionFee?: number;
  amountPaid?: number;
}

const METHOD_LABELS: Record<string, string> = {
  mobile_money: "Mobile Money",
  orange_money: "Orange Money",
  mtn_money: "MTN Mobile Money",
  moov_money: "Moov Money",
  bank_card: "Carte bancaire",
  cash: "Espèces",
  bank_transfer: "Virement bancaire",
  cheque: "Chèque",
  other: "Autre",
};

// Espaces normales uniquement : jsPDF ne gère pas les espaces insécables étroites (U+202F)
const fmt = (n: number) =>
  Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " FCFA";

const fmtDate = (d: string) => {
  const dt = new Date(d);
  const p = (v: number) => String(v).padStart(2, "0");
  return `${p(dt.getDate())}/${p(dt.getMonth() + 1)}/${dt.getFullYear()}`;
};

export const methodLabel = (v?: string | null) => (v ? METHOD_LABELS[v] ?? v : "—");

export function buildReceiptNumber(studentName: string, seed?: string) {
  const now = new Date();
  const base = seed ? seed.replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase() : String(now.getTime()).slice(-6);
  const initials = studentName
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 3);
  return `REC-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}-${initials || "ELV"}-${base}`;
}

async function loadImage(url: string): Promise<{ dataUrl: string; width: number; height: number } | null> {
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) return null;
    const blob = await res.blob();
    const dataUrl: string = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    const dims = await new Promise<{ width: number; height: number }>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = reject;
      img.src = dataUrl;
    });
    return { dataUrl, ...dims };
  } catch {
    return null;
  }
}

export async function generateReceiptPdf(data: ReceiptData, receiptNumber?: string) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const M = 14; // marge
  const right = pageWidth - M;
  const number = receiptNumber ?? buildReceiptNumber(data.studentName, data.payments[0]?.reference ?? undefined);

  const logo = data.schoolLogoUrl ? await loadImage(data.schoolLogoUrl) : null;

  // ---- En-tête ----
  const headerH = 32;
  doc.setFillColor(16, 185, 129);
  doc.rect(0, 0, pageWidth, headerH, "F");

  let textX = M;
  if (logo) {
    const boxH = 18;
    const boxW = Math.min(28, (logo.width / logo.height) * boxH);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(M - 2, 7, boxW + 4, boxH + 4, 2, 2, "F");
    try {
      doc.addImage(logo.dataUrl, M, 9, boxW, boxH);
    } catch {
      /* format image non supporté */
    }
    textX = M + boxW + 8;
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  const nameLines = doc.splitTextToSize(data.schoolName || "Établissement scolaire", pageWidth - textX - M);
  doc.text(nameLines.slice(0, 1), textX, 15);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Reçu de paiement de frais de scolarité", textX, 23);

  // ---- Bloc informations ----
  let y = headerH + 12;
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(10);

  const infoLeft: string[] = [`Élève : ${data.studentName}`];
  if (data.className) infoLeft.push(`Classe : ${data.className}`);
  if (data.parentName) infoLeft.push(`Parent / Tuteur : ${data.parentName}`);
  const infoRight = [`N° ${number}`, `Émis le ${fmtDate(new Date().toISOString())}`];

  const rows = Math.max(infoLeft.length, infoRight.length);
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(M, y - 6, pageWidth - M * 2, rows * 6 + 8, 2, 2, "FD");

  infoLeft.forEach((t, i) => doc.text(t, M + 4, y + i * 6));
  infoRight.forEach((t, i) => doc.text(t, right - 4, y + i * 6, { align: "right" }));

  y += rows * 6 + 12;

  // ---- Détail des paiements ----
  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M },
    head: [["Date", "Mode de règlement", "Référence", "Montant"]],
    body: data.payments.map((p) => [fmtDate(p.date), methodLabel(p.method), p.reference ?? "—", fmt(p.amount)]),
    headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 9, cellPadding: 2.5, overflow: "linebreak" },
    columnStyles: {
      0: { cellWidth: 26 },
      1: { cellWidth: 40 },
      2: { cellWidth: "auto" },
      3: { cellWidth: 38, halign: "right" },
    },
  });

  const total = data.payments.reduce((s, p) => s + p.amount, 0);
  // @ts-expect-error lastAutoTable est injecté par jspdf-autotable
  y = (doc.lastAutoTable?.finalY ?? y) + 10;

  // ---- Récapitulatif ----
  const summary: [string, string][] = [["Total encaissé", fmt(total)]];
  if (typeof data.tuitionFee === "number" && data.tuitionFee > 0) {
    const paid = typeof data.amountPaid === "number" ? data.amountPaid : total;
    const remaining = Math.max(0, data.tuitionFee - paid);
    summary.push(["Frais de scolarité", fmt(data.tuitionFee)]);
    summary.push(["Cumul payé", fmt(paid)]);
    summary.push(["Reste à payer", fmt(remaining)]);
    summary.push(["Statut", remaining === 0 ? "SOLDÉ" : "PAIEMENT PARTIEL"]);
  }

  const boxW = 90;
  const boxX = right - boxW;
  const boxH = summary.length * 7 + 6;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(boxX, y, boxW, boxH, 2, 2, "FD");

  doc.setFontSize(10);
  summary.forEach(([label, value], i) => {
    const ly = y + 8 + i * 7;
    const isTotal = i === 0 || label === "Statut";
    doc.setFont("helvetica", isTotal ? "bold" : "normal");
    doc.setTextColor(isTotal ? 16 : 71, isTotal ? 120 : 85, isTotal ? 90 : 105);
    doc.text(label, boxX + 4, ly);
    doc.setTextColor(30, 30, 30);
    doc.text(value, boxX + boxW - 4, ly, { align: "right" });
  });
  doc.setFont("helvetica", "normal");

  // ---- Signature ----
  const sigY = Math.min(y + boxH + 30, pageHeight - 30);
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(9);
  doc.line(right - 66, sigY, right, sigY);
  doc.text("Signature et cachet de l'établissement", right, sigY + 5, { align: "right" });

  doc.setFontSize(7.5);
  doc.setTextColor(120, 120, 120);
  doc.text(
    "Reçu généré automatiquement par EvalScol Africa — document valable sans signature manuscrite.",
    M,
    pageHeight - 10
  );

  doc.save(`recu-${data.studentName.replace(/\s+/g, "-").toLowerCase()}-${number}.pdf`);
}
