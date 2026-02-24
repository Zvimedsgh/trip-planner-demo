import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X, FileText } from "lucide-react";

interface PdfViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pdfUrl: string;
  documentName?: string;
}

export function PdfViewerModal({ open, onOpenChange, pdfUrl, documentName }: PdfViewerModalProps) {
  // Detect if it's a PDF or other document type
  const isPdf = pdfUrl.toLowerCase().endsWith('.pdf') || documentName?.toLowerCase().endsWith('.pdf');
  const isDocx = pdfUrl.toLowerCase().endsWith('.docx') || pdfUrl.toLowerCase().endsWith('.doc') ||
                 documentName?.toLowerCase().endsWith('.docx') || documentName?.toLowerCase().endsWith('.doc');
  
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = documentName || 'document.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          {isPdf ? (
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0"
              title={documentName || 'PDF Viewer'}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
              <FileText className="w-16 h-16 text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  {isDocx ? 'Word Document' : 'Document'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  This {isDocx ? 'Word document' : 'file'} cannot be previewed in the browser.
                  Click the Download button above to save and open it.
                </p>
                <Button onClick={handleDownload} size="lg">
                  <Download className="w-4 h-4 mr-2" />
                  Download {isDocx ? 'Word Document' : 'File'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
