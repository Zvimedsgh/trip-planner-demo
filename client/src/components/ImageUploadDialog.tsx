import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";

interface ImageUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (imageUrl: string) => Promise<void>;
  title?: string;
  currentImageUrl?: string | null;
}

export function ImageUploadDialog({
  open,
  onOpenChange,
  onUpload,
  title,
  currentImageUrl,
}: ImageUploadDialogProps) {
  const { language } = useLanguage();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert(language === 'he' ? 'אנא בחר קובץ תמונה' : 'Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert(language === 'he' ? 'הקובץ גדול מדי. מקסימום 5MB' : 'File too large. Maximum 5MB');
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadMutation = trpc.storage.uploadImage.useMutation();

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        
        // Upload to S3 via tRPC
        const result = await uploadMutation.mutateAsync({
          fileName: selectedFile.name,
          fileData: base64,
          contentType: selectedFile.type,
        });

        // Call parent callback with the URL
        await onUpload(result.url);

        // Reset state
        setSelectedFile(null);
        setPreviewUrl(null);
        onOpenChange(false);
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error('Upload error:', error);
      alert(language === 'he' ? 'שגיאה בהעלאת התמונה' : 'Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    handleRemove();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {title || (language === 'he' ? 'העלאת תמונה' : 'Upload Image')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current image preview */}
          {currentImageUrl && !previewUrl && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {language === 'he' ? 'תמונה נוכחית:' : 'Current image:'}
              </p>
              <img
                src={currentImageUrl}
                alt="Current"
                className="w-full h-48 object-cover rounded-lg border"
              />
            </div>
          )}

          {/* File input */}
          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="image-upload-input"
            />
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              {language === 'he' ? 'בחר תמונה' : 'Select Image'}
            </Button>
          </div>

          {/* Preview */}
          {previewUrl && (
            <div className="relative">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg border"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={handleRemove}
                disabled={uploading}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {selectedFile && (
            <p className="text-sm text-muted-foreground">
              {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={uploading}
          >
            {language === 'he' ? 'ביטול' : 'Cancel'}
          </Button>
          <Button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {language === 'he' ? 'מעלה...' : 'Uploading...'}
              </>
            ) : (
              language === 'he' ? 'העלה' : 'Upload'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
