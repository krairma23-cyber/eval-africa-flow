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

const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(Math.round(n)) + " FCFA";
const fmtDate = (d: string) => new Date(d).toLocaleDateString("fr-FR");

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

export function generateReceiptPdf(data: ReceiptData, receiptNumber?: string) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const number = receiptNumber ?? buildReceiptNumber(data.studentName, data.payments[0]?.reference ?? undefined);

  doc.setFillColor(16, 185, 129);
  doc.rect(0, 0, pageWidth, 26, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text(data.schoolName || "Établissement scolaire", 14, 12);
  doc.setFontSize(10);
  doc.text("Reçu de paiement de frais de scolarité", 14, 20);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text(`N° ${number}`, pageWidth - 14, 34, { align: "right" });
  doc.text(`Émis le ${new Date().toLocaleDateString("fr-FR")}`, pageWidth - 14, 40, { align: "right" });

  doc.setFontSize(11);
  doc.text(`Élève : ${data.studentName}`, 14, 34);
  if (data.className) doc.text(`Classe : ${data.className}`, 14, 40);
  if (data.parentName) doc.text(`Parent : ${data.parentName}`, 14, data.className ? 46 : 40);

  autoTable(doc, {
    startY: 56,
    head: [["Date", "Mode de règlement", "Référence", "Montant"]],
    body: data.payments.map((p) => [
      fmtDate(p.date),
      methodLabel(p.method),
      p.reference ?? "—",
      fmt(p.amount),
    ]),
    headStyles: { fillColor: [16, 185, 129] },
    styles: { fontSize: 10 },
    columnStyles: { 3: { halign: "right" } },
  });

  const total = data.payments.reduce((s, p) => s + p.amount, 0);
  // @ts-expect-error lastAutoTable is injected by jspdf-autotable
  let y = (doc.lastAutoTable?.finalY ?? 70) + 10;

  doc.setFontSize(12);
  doc.text(`Total encaissé : ${fmt(total)}`, pageWidth - 14, y, { align: "right" });

  if (typeof data.tuitionFee === "number" && data.tuitionFee > 0) {
    const paid = typeof data.amountPaid === "number" ? data.amountPaid : total;
    const remaining = Math.max(0, data.tuitionFee - paid);
    y += 7;
    doc.setFontSize(10);
    doc.text(`Frais de scolarité : ${fmt(data.tuitionFee)}`, pageWidth - 14, y, { align: "right" });
    y += 6;
    doc.text(`Cumul payé : ${fmt(paid)}`, pageWidth - 14, y, { align: "right" });
    y += 6;
    doc.text(`Reste à payer : ${fmt(remaining)}`, pageWidth - 14, y, { align: "right" });
    y += 8;
    doc.setFontSize(11);
    doc.text(remaining === 0 ? "Statut : SOLDÉ" : "Statut : PAIEMENT PARTIEL", 14, y);
  }

  y += 20;
  doc.setFontSize(10);
  doc.text("Signature et cachet de l'établissement", pageWidth - 14, y, { align: "right" });
  doc.line(pageWidth - 80, y + 18, pageWidth - 14, y + 18);

  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(
    "Reçu généré automatiquement par EvalScol Africa — document valable sans signature manuscrite.",
    14,
    doc.internal.pageSize.getHeight() - 12
  );

  doc.save(`recu-${data.studentName.replace(/\s+/g, "-").toLowerCase()}-${number}.pdf`);
}
