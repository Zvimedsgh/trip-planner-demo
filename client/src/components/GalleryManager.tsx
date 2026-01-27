import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Image as ImageIcon, Loader2, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface GalleryManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hotelId: number;
  currentGallery: string[]; // Array of image URLs
  onUpdate: (gallery: string[]) => Promise<void>;
}

export function GalleryManager({
  open,
  onOpenChange,
  hotelId,
  currentGallery,
  onUpdate,
}: GalleryManagerProps) {
  const { language } = useLanguage();
  const [gallery, setGallery] = useState<string[]>(currentGallery);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const uploadMutation = trpc.storage.uploadImage.useMutation();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(language === 'he' ? 'נא לבחור קובץ תמונה' : 'Please select an image file');
      return;
    }

    if (file.size > 16 * 1024 * 1024) {
      toast.error(language === 'he' ? 'גודל הקובץ חורג מ-16MB' : 'File size exceeds 16MB');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const result = await uploadMutation.mutateAsync({
          fileName: selectedFile.name,
          fileData: base64,
          contentType: selectedFile.type,
        });

        const newGallery = [...gallery, result.url];
        setGallery(newGallery);
        await onUpdate(newGallery);
        
        toast.success(language === 'he' ? 'התמונה הועלתה בהצלחה' : 'Image uploaded successfully');
        setSelectedFile(null);
        setPreviewUrl(null);
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה בהעלאת התמונה' : 'Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async (index: number) => {
    const newGallery = gallery.filter((_, i) => i !== index);
    setGallery(newGallery);
    await onUpdate(newGallery);
    toast.success(language === 'he' ? 'התמונה הוסרה' : 'Image removed');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {language === 'he' ? 'ניהול גלריית תמונות' : 'Manage Image Gallery'}
          </DialogTitle>
        </DialogHeader>

        {/* Current Gallery */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {gallery.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Gallery ${index + 1}`}
                className="w-full h-40 object-cover rounded-lg"
              />
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemove(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => window.open(url, '_blank')}
              >
                <ImageIcon className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Upload New Image */}
        <div className="border-2 border-dashed rounded-lg p-6 mt-4">
          <div className="flex flex-col items-center gap-4">
            {previewUrl ? (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full max-h-60 rounded-lg"
                />
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {language === 'he' ? 'בחר תמונה להעלאה' : 'Select an image to upload'}
                </p>
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id={`gallery-upload-${hotelId}`}
            />
            <label htmlFor={`gallery-upload-${hotelId}`}>
              <Button variant="outline" asChild>
                <span>
                  <Plus className="w-4 h-4 mr-2" />
                  {language === 'he' ? 'בחר תמונה' : 'Select Image'}
                </span>
              </Button>
            </label>

            {selectedFile && (
              <Button onClick={handleUpload} disabled={uploading}>
                {uploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {language === 'he' ? 'העלה' : 'Upload'}
              </Button>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {language === 'he' ? 'סגור' : 'Close'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
