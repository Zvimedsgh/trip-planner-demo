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
import { Edit, ExternalLink, File, FileText, Loader2, Plus, Shield, Ticket, Trash2, Upload, Hotel, Utensils } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface DocumentsTabProps {
  tripId: number;
}

const categoryIcons = {
  passport: Shield,
  visa: FileText,
  insurance: Shield,
  booking: File,
  ticket: Ticket,
  restaurant: Utensils,
  hotel: Hotel,
  flights: Ticket,
  other: File,
};

const categoryColors = {
  passport: "from-blue-500 to-indigo-600",
  visa: "from-green-500 to-emerald-600",
  insurance: "from-amber-500 to-orange-600",
  booking: "from-purple-500 to-violet-600",
  ticket: "from-rose-500 to-pink-600",
  restaurant: "from-orange-500 to-red-600",
  hotel: "from-cyan-500 to-blue-600",
  flights: "from-sky-500 to-blue-600",
  other: "from-gray-500 to-slate-600",
};

const categoryPastelBg = {
  passport: "bg-blue-50",
  visa: "bg-green-50",
  insurance: "bg-amber-50",
  booking: "bg-purple-50",
  ticket: "bg-rose-50",
  restaurant: "bg-orange-50",
  hotel: "bg-cyan-50",
  flights: "bg-sky-50",
  other: "bg-gray-50",
};

type CategoryType = "passport" | "visa" | "insurance" | "booking" | "ticket" | "restaurant" | "hotel" | "flights" | "other";

export default function DocumentsTab({ tripId }: DocumentsTabProps) {
  const { t, language, isRTL } = useLanguage();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [createCategory, setCreateCategory] = useState<CategoryType>("other");
  const [editCategory, setEditCategory] = useState<CategoryType>("other");

  const [editDefaults, setEditDefaults] = useState({
    name: "",
    tags: "",
    notes: "",
  });

  const utils = trpc.useUtils();
  const { data: documents, isLoading } = trpc.documents.list.useQuery({ tripId });

  // Track which folders are open (all open by default)
  const [openFolders, setOpenFolders] = useState<Set<CategoryType>>(new Set<CategoryType>(["passport", "visa", "insurance", "booking", "ticket", "restaurant", "hotel", "flights", "other"]));

  const toggleFolder = (category: CategoryType) => {
    setOpenFolders(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  // Group documents by category
  const documentsByCategory = documents?.reduce((acc, doc) => {
    if (!acc[doc.category]) acc[doc.category] = [];
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<CategoryType, typeof documents>);

  const uploadMutation = trpc.documents.upload.useMutation({
    onSuccess: () => {
      utils.documents.list.invalidate({ tripId });
      setIsCreateOpen(false);
      setSelectedFile(null);
      setCreateCategory("other");
      if (fileInputRef.current) fileInputRef.current.value = "";
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-fill name if empty
      const nameInput = formRef.current?.querySelector('[name="name"]') as HTMLInputElement;
      if (nameInput && !nameInput.value) {
        nameInput.value = file.name;
      }
    }
  };

  const getFormValue = (name: string) => {
    const el = formRef.current?.querySelector(`[name="${name}"]`) as HTMLInputElement | HTMLTextAreaElement | null;
    return el?.value || "";
  };

  const handleUpload = async () => {
    const name = getFormValue("name");
    
    if (!selectedFile || !name) {
      toast.error(language === "he" ? "נא לבחור קובץ ולהזין שם" : "Please select a file and enter a name");
      return;
    }

    setIsUploading(true);
    
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      uploadMutation.mutate({
        tripId,
        fileName: name,
        fileData: base64,
        mimeType: selectedFile.type,
        category: createCategory,
        tags: getFormValue("tags") || undefined,
        notes: getFormValue("notes") || undefined,
      });
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleUpdate = () => {
    const name = getFormValue("editName");
    
    if (!editingId || !name) {
      toast.error(language === "he" ? "נא להזין שם" : "Please enter a name");
      return;
    }
    updateMutation.mutate({
      id: editingId,
      name: name,
      category: editCategory,
      tags: getFormValue("editTags") || undefined,
      notes: getFormValue("editNotes") || undefined,
    });
  };

  const openEdit = (doc: NonNullable<typeof documents>[0]) => {
    setEditDefaults({
      name: doc.name,
      tags: doc.tags || "",
      notes: doc.notes || "",
    });
    setEditCategory(doc.category);
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
    <div className="relative min-h-screen">
      {/* Gradient background with decorative pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 -z-10" />
      <div 
        className="absolute inset-0 -z-10 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}
      />
      <div className="relative">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">{t("documents")}</h2>
        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) {
            setSelectedFile(null);
            setCreateCategory("other");
            if (fileInputRef.current) fileInputRef.current.value = "";
          }
        }}>
          <DialogTrigger asChild>
            <Button className="btn-elegant">
              <Upload className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t("uploadDocument")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("uploadDocument")}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4" ref={formRef}>
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
                  name="name"
                  defaultValue=""
                />
              </div>
              <div className="grid gap-2">
                <Label>{t("category")} *</Label>
                <Select 
                  value={createCategory} 
                  onValueChange={(v: CategoryType) => setCreateCategory(v)}
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
                    <SelectItem value="restaurant">{t("restaurant")}</SelectItem>
                    <SelectItem value="hotel">{t("hotel")}</SelectItem>
                    <SelectItem value="flights">{t("flights" as any)}</SelectItem>
                    <SelectItem value="other">{t("other")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>{t("tags")}</Label>
                <Input
                  name="tags"
                  defaultValue=""
                  placeholder={language === "he" ? "תג1, תג2, תג3" : "tag1, tag2, tag3"}
                />
              </div>
              <div className="grid gap-2">
                <Label>{t("notes")}</Label>
                <Textarea
                  name="notes"
                  defaultValue=""
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
        <div className="space-y-4">
          {(Object.keys(categoryIcons) as CategoryType[]).map((category) => {
            const docsInCategory = documentsByCategory?.[category] || [];
            if (docsInCategory.length === 0) return null;
            
            const Icon = categoryIcons[category];
            const colorClass = categoryColors[category];
            const isOpen = openFolders.has(category);
            
            return (
              <div key={category} className="elegant-card">
                <button
                  onClick={() => toggleFolder(category)}
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorClass} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold capitalize">{t(category as any)}</h3>
                      <p className="text-sm text-muted-foreground">
                        {docsInCategory.length} {language === "he" ? "מסמכים" : "documents"}
                      </p>
                    </div>
                  </div>
                  <svg
                    className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isOpen && (
                  <div className="p-4 pt-0 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {docsInCategory.map((doc) => {
                      const pastelBg = categoryPastelBg[doc.category];
                      return (
                        <Card key={doc.id} data-document-id={doc.id} className={`elegant-card-hover relative overflow-hidden ${pastelBg}`}>
                          {/* Background Image */}
                          {doc.coverImage && (
                            <div 
                              className="absolute inset-0 bg-cover bg-center opacity-20"
                              style={{ backgroundImage: `url(${doc.coverImage})` }}
                            />
                          )}
                          <CardHeader className="pb-2 relative z-10">
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-sm font-medium line-clamp-1">{doc.name}</CardTitle>
                                <CardDescription className="text-xs">
                                  {format(new Date(doc.createdAt), "MMM d, yyyy")}
                                </CardDescription>
                              </div>
                              <div className="flex gap-1">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(doc)}>
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{language === 'he' ? 'ערוך מסמך' : 'Edit document'}</p>
                                  </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      className="h-8 w-8 text-destructive hover:text-destructive"
                                      onClick={() => {
                                        if (window.confirm(language === "he" ? "האם אתה בטוח שברצונך למחוק את המסמך?" : "Are you sure you want to delete this document?")) {
                                          deleteMutation.mutate({ id: doc.id });
                                        }
                                      }}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{language === 'he' ? 'מחק מסמך' : 'Delete document'}</p>
                                  </TooltipContent>
                                </Tooltip>
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
                            <button
                              onClick={() => {
                                // Open file URL directly - same as other tabs (HotelsTab, etc.)
                                window.open(doc.fileUrl, '_blank');
                              }}
                              className="inline-flex items-center gap-1 text-sm text-primary hover:underline cursor-pointer bg-transparent border-none p-0"
                            >
                              <ExternalLink className="w-3 h-3" />
                              {language === "he" ? "פתח קובץ" : "Open file"}
                            </button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
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
          <div className="grid gap-4 py-4" ref={formRef}>
            <div className="grid gap-2">
              <Label>{t("documentName")} *</Label>
              <Input
                name="editName"
                key={`edit-name-${editingId}`}
                defaultValue={editDefaults.name}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t("category")} *</Label>
              <Select 
                value={editCategory} 
                onValueChange={(v: CategoryType) => setEditCategory(v)}
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
                  <SelectItem value="restaurant">{t("restaurant")}</SelectItem>
                  <SelectItem value="hotel">{t("hotel")}</SelectItem>
                  <SelectItem value="flights">{t("flights" as any)}</SelectItem>
                  <SelectItem value="other">{t("other")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>{t("tags")}</Label>
              <Input
                name="editTags"
                key={`edit-tags-${editingId}`}
                defaultValue={editDefaults.tags}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t("notes")}</Label>
              <Textarea
                name="editNotes"
                key={`edit-notes-${editingId}`}
                defaultValue={editDefaults.notes}
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
    </div>
  );
}
