import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const TestModeBanner = () => {
  return (
    <Alert variant="destructive" className="rounded-none border-x-0 border-t-0 flex items-center justify-center py-3">
      <AlertTriangle className="h-5 w-5" />
      <AlertDescription className="ml-2 font-semibold">
        ⚠️ URGENCE : Ce SaaS est actuellement en mode test. Les données peuvent être réinitialisées à tout moment.
      </AlertDescription>
    </Alert>
  );
};
