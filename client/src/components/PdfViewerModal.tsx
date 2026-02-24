import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

interface PdfViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pdfUrl: string;
  documentName?: string;
}

export function PdfViewerModal({ open, onOpenChange, pdfUrl, documentName }: PdfViewerModalProps) {
  // All documents are now PDFs or images - display them inline
  const isImage = pdfUrl.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/i);
  
  const handleDownload = () => {
    // Use fetch to download the file properly on iOS
    fetch(pdfUrl)
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
        window.open(pdfUrl, '_blank');
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
          {isImage ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 p-4">
              <img 
                src={pdfUrl} 
                alt={documentName || 'Document'} 
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ) : (
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0"
              title={documentName || 'PDF Viewer'}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
