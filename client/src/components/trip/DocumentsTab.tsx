import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { Download, Edit, ExternalLink, File, FileText, Loader2, Plus, Shield, Ticket, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface DocumentsTabProps {
  tripId: number;
}

const categoryIcons = {
  passport: Shield,
  visa: FileText,
  insurance: Shield,
  booking: File,
  ticket: Ticket,
  other: File,
};

const categoryColors = {
  passport: "from-blue-500 to-indigo-600",
  visa: "from-green-500 to-emerald-600",
  insurance: "from-amber-500 to-orange-600",
  booking: "from-purple-500 to-violet-600",
  ticket: "from-rose-500 to-pink-600",
  other: "from-gray-500 to-slate-600",
};

export default function DocumentsTab({ tripId }: DocumentsTabProps) {
  const { t, language, isRTL } = useLanguage();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    category: "other" as "passport" | "visa" | "insurance" | "booking" | "ticket" | "other",
    tags: "",
    notes: "",
    file: null as File | null,
  });

  const [editFormData, setEditFormData] = useState({
    name: "",
    category: "other" as "passport" | "visa" | "insurance" | "booking" | "ticket" | "other",
    tags: "",
    notes: "",
  });

  const utils = trpc.useUtils();
  const { data: documents, isLoading } = trpc.documents.list.useQuery({ tripId });

  const uploadMutation = trpc.documents.upload.useMutation({
    onSuccess: () => {
      utils.documents.list.invalidate({ tripId });
      setIsCreateOpen(false);
      resetForm();
      setIsUploading(false);
      toast.success(language === "he" ? "המסמך הועלה בהצלחה" : "Document uploaded successfully");
    },
    onError: (error) => {
      setIsUploading(false);
      toast.error(error.message);
    },
  });

  const updateMutation = trpc.documents.update.useMutation({
    onSuccess: () => {
      utils.documents.list.invalidate({ tripId });
      setEditingId(null);
      toast.success(language === "he" ? "המסמך עודכן בהצלחה" : "Document updated successfully");
    },
  });

  const deleteMutation = trpc.documents.delete.useMutation({
    onSuccess: () => {
      utils.documents.list.invalidate({ tripId });
      toast.success(language === "he" ? "המסמך נמחק בהצלחה" : "Document deleted successfully");
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      category: "other",
      tags: "",
      notes: "",
      file: null,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, file, name: formData.name || file.name });
    }
  };

  const handleUpload = async () => {
    if (!formData.file || !formData.name) {
      toast.error(language === "he" ? "נא לבחור קובץ ולהזין שם" : "Please select a file and enter a name");
      return;
    }

    setIsUploading(true);
    
    // Convert file to base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      uploadMutation.mutate({
        tripId,
        fileName: formData.name,
        fileData: base64,
        mimeType: formData.file!.type,
        category: formData.category,
        tags: formData.tags || undefined,
        notes: formData.notes || undefined,
      });
    };
    reader.readAsDataURL(formData.file);
  };

  const handleUpdate = () => {
    if (!editingId || !editFormData.name) return;
    updateMutation.mutate({
      id: editingId,
      name: editFormData.name,
      category: editFormData.category,
      tags: editFormData.tags || undefined,
      notes: editFormData.notes || undefined,
    });
  };

  const openEdit = (doc: NonNullable<typeof documents>[0]) => {
    setEditFormData({
      name: doc.name,
      category: doc.category,
      tags: doc.tags || "",
      notes: doc.notes || "",
    });
    setEditingId(doc.id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">{t("documents")}</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="btn-elegant" onClick={resetForm}>
              <Upload className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t("uploadDocument")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("uploadDocument")}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>{language === "he" ? "קובץ" : "File"} *</Label>
                <Input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
              </div>
              <div className="grid gap-2">
                <Label>{t("documentName")} *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>{t("category")} *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(v: typeof formData.category) => setFormData({ ...formData, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="passport">{t("passport")}</SelectItem>
                    <SelectItem value="visa">{t("visa")}</SelectItem>
                    <SelectItem value="insurance">{t("insurance")}</SelectItem>
                    <SelectItem value="booking">{t("booking")}</SelectItem>
                    <SelectItem value="ticket">{t("ticket")}</SelectItem>
                    <SelectItem value="other">{t("other")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>{t("tags")}</Label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder={language === "he" ? "תג1, תג2, תג3" : "tag1, tag2, tag3"}
                />
              </div>
              <div className="grid gap-2">
                <Label>{t("notes")}</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>{t("cancel")}</Button>
              <Button onClick={handleUpload} disabled={isUploading || uploadMutation.isPending}>
                {(isUploading || uploadMutation.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {t("add")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {documents && documents.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => {
            const Icon = categoryIcons[doc.category];
            const colorClass = categoryColors[doc.category];
            return (
              <Card key={doc.id} className="elegant-card-hover">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorClass} flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-medium line-clamp-1">{doc.name}</CardTitle>
                        <CardDescription className="text-xs capitalize">{t(doc.category)}</CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(doc)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 text-destructive"
                        onClick={() => deleteMutation.mutate({ id: doc.id })}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {doc.tags && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {doc.tags.split(",").map((tag, i) => (
                        <span key={i} className="text-xs bg-muted px-2 py-0.5 rounded">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    {format(new Date(doc.createdAt), "MMM d, yyyy")}
                  </div>
                  <a 
                    href={doc.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {language === "he" ? "פתח קובץ" : "Open file"}
                  </a>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="elegant-card p-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">{t("noDocuments")}</p>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editingId !== null} onOpenChange={(open) => !open && setEditingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("edit")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t("documentName")} *</Label>
              <Input
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t("category")} *</Label>
              <Select 
                value={editFormData.category} 
                onValueChange={(v: typeof editFormData.category) => setEditFormData({ ...editFormData, category: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="passport">{t("passport")}</SelectItem>
                  <SelectItem value="visa">{t("visa")}</SelectItem>
                  <SelectItem value="insurance">{t("insurance")}</SelectItem>
                  <SelectItem value="booking">{t("booking")}</SelectItem>
                  <SelectItem value="ticket">{t("ticket")}</SelectItem>
                  <SelectItem value="other">{t("other")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>{t("tags")}</Label>
              <Input
                value={editFormData.tags}
                onChange={(e) => setEditFormData({ ...editFormData, tags: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t("notes")}</Label>
              <Textarea
                value={editFormData.notes}
                onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingId(null)}>{t("cancel")}</Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
