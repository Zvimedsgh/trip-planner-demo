import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Link2, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";

interface Document {
  id: number;
  name: string;
  category: string;
  fileUrl: string;
}

interface DocumentLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: number;
  currentDocumentId?: number | null;
  onSelectDocument: (documentId: number | null) => void;
}

const CATEGORY_LABELS: Record<string, { en: string; he: string }> = {
  passport: { en: "Passport", he: "דרכון" },
  visa: { en: "Visa", he: "ויזה" },
  insurance: { en: "Insurance", he: "ביטוח" },
  booking: { en: "Booking", he: "הזמנה" },
  ticket: { en: "Ticket", he: "כרטיס" },
  voucher: { en: "Voucher", he: "שובר" },
  map: { en: "Map", he: "מפה" },
  itinerary: { en: "Itinerary", he: "מסלול" },
  other: { en: "Other", he: "אחר" },
};

export function DocumentLinkDialog({
  open,
  onOpenChange,
  tripId,
  currentDocumentId,
  onSelectDocument,
}: DocumentLinkDialogProps) {
  const { language } = useLanguage();
  const [selectedId, setSelectedId] = useState<number | null>(currentDocumentId || null);

  const { data: documents = [], isLoading } = trpc.documents.list.useQuery(
    { tripId },
    { enabled: open }
  );

  const handleConfirm = () => {
    onSelectDocument(selectedId);
    onOpenChange(false);
  };

  const handleRemoveLink = () => {
    onSelectDocument(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            {language === "he" ? "קישור מסמך" : "Link Document"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Instructions */}
          <p className="text-sm text-gray-600">
            {language === "he"
              ? "בחר מסמך לקישור לפריט זה. המסמך יהיה זמין בלחיצה על האייקון הכחול."
              : "Select a document to link to this item. The document will be accessible by clicking the blue icon."}
          </p>

          {/* Loading state */}
          {isLoading && (
            <div className="text-center py-8 text-gray-500">
              {language === "he" ? "טוען מסמכים..." : "Loading documents..."}
            </div>
          )}

          {/* No documents */}
          {!isLoading && documents.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {language === "he"
                ? "אין מסמכים זמינים. העלה מסמכים בלשונית 'מסמכים'."
                : "No documents available. Upload documents in the 'Documents' tab."}
            </div>
          )}

          {/* Document list */}
          {!isLoading && documents.length > 0 && (
            <div className="space-y-2">
              {/* None option to remove link */}
              <button
                onClick={() => setSelectedId(null)}
                className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                  selectedId === null
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <X
                    className={`w-5 h-5 mt-0.5 ${
                      selectedId === null ? "text-red-600" : "text-gray-400"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900">
                      {language === "he" ? "ללא מסמך" : "No Document"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {language === "he" ? "הסר את הקישור למסמך" : "Remove document link"}
                    </div>
                  </div>
                  {selectedId === null && (
                    <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  )}
                </div>
              </button>

              {documents.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => setSelectedId(doc.id)}
                  className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                    selectedId === doc.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <FileText
                      className={`w-5 h-5 mt-0.5 ${
                        selectedId === doc.id ? "text-blue-600" : "text-gray-400"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 break-words">{doc.name}</div>
                      <div className="text-sm text-gray-500">
                        {CATEGORY_LABELS[doc.category]?.[language] || doc.category}
                      </div>
                    </div>
                    {selectedId === doc.id && (
                      <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            {currentDocumentId && (
              <Button
                variant="outline"
                onClick={handleRemoveLink}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                {language === "he" ? "הסר קישור" : "Remove Link"}
              </Button>
            )}
            <div className="flex-1" />
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {language === "he" ? "ביטול" : "Cancel"}
            </Button>
            <Button onClick={handleConfirm}>
              {language === "he" ? "אישור" : "Confirm"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
