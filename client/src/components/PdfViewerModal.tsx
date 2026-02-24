import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface PdfViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pdfUrl: string;
  documentName?: string;
  documentId?: number;
}

export function PdfViewerModal({ open, onOpenChange, pdfUrl, documentName, documentId }: PdfViewerModalProps) {
  const [displayUrl, setDisplayUrl] = useState(pdfUrl);
  const [isConverting, setIsConverting] = useState(false);
  
  // Detect if it's a PDF or other document type
  const isPdf = pdfUrl.toLowerCase().endsWith('.pdf') || documentName?.toLowerCase().endsWith('.pdf');
  const isDocx = pdfUrl.toLowerCase().endsWith('.docx') || pdfUrl.toLowerCase().endsWith('.doc') ||
                 documentName?.toLowerCase().endsWith('.docx') || documentName?.toLowerCase().endsWith('.doc');
  
  const convertMutation = trpc.documents.convertToPdf.useMutation();
  
  // Auto-convert .docx files when modal opens
  useEffect(() => {
    if (open && isDocx && documentId) {
      setIsConverting(true);
      convertMutation.mutate(
        { documentId },
        {
          onSuccess: (result) => {
            setDisplayUrl(result.url);
            setIsConverting(false);
          },
          onError: (error) => {
            console.error('Conversion failed:', error);
            toast.error('Failed to convert document. You can download it instead.');
            setIsConverting(false);
          },
        }
      );
    } else {
      setDisplayUrl(pdfUrl);
    }
  }, [open, isDocx, documentId, pdfUrl]);
  
  const handleDownload = () => {
    // Use fetch to download the file properly on iOS
    fetch(displayUrl)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = documentName || 'document.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch(error => {
        console.error('Download failed:', error);
        // Fallback: open in new tab if fetch fails
        window.open(displayUrl, '_blank');
      });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle>{documentName || 'Document Viewer'}</DialogTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownload}
                disabled={isConverting}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          {isConverting ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Converting to PDF...</h3>
                <p className="text-muted-foreground">This may take a few seconds</p>
              </div>
            </div>
          ) : (
            <iframe
              src={displayUrl}
              className="w-full h-full border-0"
              title={documentName || 'PDF Viewer'}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
