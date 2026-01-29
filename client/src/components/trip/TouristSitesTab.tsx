import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { Calendar, Clock, Edit, ExternalLink, FileText, Image, Loader2, MapPin, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { DocumentLinkDialog } from "@/components/DocumentLinkDialog";
import { ImageUploadDialog } from "@/components/ImageUploadDialog";

interface TouristSitesTabProps {
  tripId: number;
  highlightedId?: number | null;
}

export default function TouristSitesTab({ tripId, highlightedId }: TouristSitesTabProps) {
  const { t, language, isRTL } = useLanguage();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const [linkingSiteId, setLinkingSiteId] = useState<number | null>(null);
  const [documentLinkDialogOpen, setDocumentLinkDialogOpen] = useState(false);
  const [uploadingImageForSiteId, setUploadingImageForSiteId] = useState<number | null>(null);
  const [imageUploadDialogOpen, setImageUploadDialogOpen] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const longPressTriggered = useRef(false);

  const utils = trpc.useUtils();
  const { data: sites, isLoading } = trpc.touristSites.list.useQuery({ tripId });
  const { data: documents } = trpc.documents.list.useQuery({ tripId });

  // Scroll to highlighted site
  useEffect(() => {
    if (highlightedId) {
      const element = document.getElementById(`site-${highlightedId}`);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  }, [highlightedId]);

  const createMutation = trpc.touristSites.create.useMutation({
    onSuccess: () => {
      utils.touristSites.list.invalidate({ tripId });
      setIsCreateOpen(false);
      toast.success(language === "he" ? "האתר נוסף בהצלחה" : "Site added successfully");
    },
  });

  const updateMutation = trpc.touristSites.update.useMutation({
    onSuccess: () => {
      utils.touristSites.list.invalidate({ tripId });
      setEditingId(null);
      toast.success(language === "he" ? "האתר עודכן בהצלחה" : "Site updated successfully");
    },
  });

  const deleteMutation = trpc.touristSites.delete.useMutation({
    onSuccess: () => {
      utils.touristSites.list.invalidate({ tripId });
      toast.success(language === "he" ? "האתר נמחק בהצלחה" : "Site deleted successfully");
    },
  });

  const handleDocumentLink = (siteId: number) => {
    setLinkingSiteId(siteId);
    setDocumentLinkDialogOpen(true);
  };

  const handleDocumentSelect = (documentId: number | null) => {
    if (linkingSiteId) {
      updateMutation.mutate({
        id: linkingSiteId,
        linkedDocumentId: documentId === null ? null : documentId,
      });
      setLinkingSiteId(null);
    }
    setDocumentLinkDialogOpen(false);
  };

  const getFormValues = () => {
    if (!formRef.current) return null;
    const getValue = (name: string) => {
      const el = formRef.current?.querySelector(`[name="${name}"]`) as HTMLInputElement | HTMLTextAreaElement | null;
      return el?.value || "";
    };
    return {
      name: getValue("name"),
      address: getValue("address"),
      description: getValue("description"),
      openingHours: getValue("openingHours"),
      plannedVisitDate: getValue("plannedVisitDate"),
      plannedVisitTime: getValue("plannedVisitTime"),
      website: getValue("website"),
      notes: getValue("notes"),
    };
  };

  const handleCreate = () => {
    const values = getFormValues();
    if (!values) return;
    
    if (!values.name) {
      toast.error(language === "he" ? "נא להזין שם" : "Please enter a name");
      return;
    }
    createMutation.mutate({
      tripId,
      name: values.name,
      address: values.address || undefined,
      description: values.description || undefined,
      openingHours: values.openingHours || undefined,
      plannedVisitDate: values.plannedVisitDate ? new Date(values.plannedVisitDate).getTime() : undefined,
      plannedVisitTime: values.plannedVisitTime || undefined,
      website: values.website || undefined,
      notes: values.notes || undefined,
    });
  };

  const handleUpdate = () => {
    const values = getFormValues();
    if (!values || !editingId) return;
    
    if (!values.name) {
      toast.error(language === "he" ? "נא להזין שם" : "Please enter a name");
      return;
    }
    updateMutation.mutate({
      id: editingId,
      name: values.name,
      address: values.address || undefined,
      description: values.description || undefined,
      openingHours: values.openingHours || undefined,
      plannedVisitDate: values.plannedVisitDate ? new Date(values.plannedVisitDate).getTime() : undefined,
      plannedVisitTime: values.plannedVisitTime || undefined,
      website: values.website || undefined,
      notes: values.notes || undefined,
    });
  };

  const [editDefaults, setEditDefaults] = useState({
    name: "",
    address: "",
    description: "",
    openingHours: "",
    plannedVisitDate: "",
    plannedVisitTime: "",
    website: "",
    notes: "",
  });

  const openEdit = (site: NonNullable<typeof sites>[0]) => {
    setEditDefaults({
      name: site.name,
      address: site.address || "",
      description: site.description || "",
      openingHours: site.openingHours || "",
      plannedVisitDate: site.plannedVisitDate ? format(new Date(site.plannedVisitDate), "yyyy-MM-dd") : "",
      plannedVisitTime: site.plannedVisitTime || "",
      website: site.website || "",
      notes: site.notes || "",
    });
    setEditingId(site.id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const FormFields = ({ defaults }: { defaults?: typeof editDefaults }) => (
    <div className="grid gap-4 py-4" ref={formRef}>
      <div className="grid gap-2">
        <Label>{t("siteName")} *</Label>
        <Input
          name="name"
          defaultValue={defaults?.name || ""}
          placeholder={language === "he" ? "מגדל אייפל" : "Eiffel Tower"}
        />
      </div>
      <div className="grid gap-2">
        <Label>{t("address")}</Label>
        <Input
          name="address"
          defaultValue={defaults?.address || ""}
        />
      </div>
      <div className="grid gap-2">
        <Label>{t("description")}</Label>
        <Textarea
          name="description"
          defaultValue={defaults?.description || ""}
          rows={2}
        />
      </div>
      <div className="grid gap-2">
        <Label>{t("openingHours")}</Label>
        <Input
          name="openingHours"
          defaultValue={defaults?.openingHours || ""}
          placeholder="9:00 - 18:00"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>{t("plannedVisitDate")}</Label>
          <Input
            name="plannedVisitDate"
            type="date"
            defaultValue={defaults?.plannedVisitDate || ""}
          />
        </div>
        <div className="grid gap-2">
          <Label>{language === "he" ? "שעת ביקור" : "Visit Time"}</Label>
          <Input
            name="plannedVisitTime"
            type="time"
            defaultValue={defaults?.plannedVisitTime || ""}
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label>{language === "he" ? "אתר אינטרנט" : "Website"}</Label>
        <Input
          name="website"
          type="url"
          defaultValue={defaults?.website || ""}
          placeholder="https://"
        />
      </div>
      <div className="grid gap-2">
        <Label>{t("notes")}</Label>
        <Textarea
          name="notes"
          defaultValue={defaults?.notes || ""}
          rows={2}
        />
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">{t("touristSites")}</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="btn-elegant">
              <Plus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t("newSite")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("newSite")}</DialogTitle>
            </DialogHeader>
            <FormFields />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>{t("cancel")}</Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {t("add")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {sites && sites.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sites.map((site, index) => {
            // Determine background image based on site name/address
            const getBackgroundImage = () => {
              const name = (site.name + " " + (site.address || "")).toLowerCase();
              if (name.includes("castle") || name.includes("טירה") || name.includes("hrad")) {
                return "/images/site-castle.jpg";
              }
              if (name.includes("bratislava") || name.includes("ברטיסלבה")) {
                return "/images/site-bratislava.jpg";
              }
              if (name.includes("tatra") || name.includes("mountain") || name.includes("הר") || name.includes("hory")) {
                return "/images/site-mountains.jpg";
              }
              return null;
            };
            
            const bgImage = getBackgroundImage();
            const gradients = [
              "from-rose-500 to-pink-600",
              "from-violet-500 to-purple-600",
              "from-blue-500 to-indigo-600",
              "from-emerald-500 to-teal-600",
              "from-amber-500 to-orange-600",
            ];
            const gradient = gradients[index % gradients.length];
            
            return (
              <Card 
                key={site.id} 
                id={`site-${site.id}`}
                className={`elegant-card-hover overflow-hidden ${
                  highlightedId === site.id ? 'ring-4 ring-yellow-400 animate-pulse' : ''
                }`}
              >
                {/* Header with image or gradient */}
                <div 
                  className={`h-24 relative ${!bgImage ? `bg-gradient-to-r ${gradient}` : ''}`}
                  style={bgImage ? {
                    backgroundImage: `url(${bgImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  } : {}}
                >
                  <div className="absolute inset-0 bg-black/30" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-shadow line-clamp-1">{site.name}</h3>
                        {site.address && (
                          <p className="text-xs text-white/80 line-clamp-1">{site.address}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {/* Document link button */}
                      {(() => {
                        // Only use explicitly linked documents
                        const linkedDoc = site.linkedDocumentId 
                          ? documents?.find(doc => doc.id === site.linkedDocumentId)
                          : null;
                        
                        return (
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-7 w-7 text-white bg-blue-500/80 hover:bg-blue-600"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (linkedDoc) {
                                window.open(linkedDoc.fileUrl, '_blank');
                              } else {
                                // Open dialog to manually select document
                                handleDocumentLink(site.id);
                              }
                            }}
                            onContextMenu={(e) => {
                              // Right-click opens dialog
                              e.preventDefault();
                              e.stopPropagation();
                              handleDocumentLink(site.id);
                            }}
                            onTouchStart={(e) => {
                              // Long press on mobile
                              e.stopPropagation();
                              longPressTriggered.current = false;
                              longPressTimer.current = setTimeout(() => {
                                longPressTriggered.current = true;
                                handleDocumentLink(site.id);
                              }, 500);
                            }}
                            onTouchEnd={(e) => {
                              e.stopPropagation();
                              if (longPressTimer.current) {
                                clearTimeout(longPressTimer.current);
                                longPressTimer.current = null;
                              }
                              // Prevent click if long press was triggered
                              if (longPressTriggered.current) {
                                e.preventDefault();
                                longPressTriggered.current = false;
                              }
                            }}
                            onTouchMove={(e) => {
                              e.stopPropagation();
                              if (longPressTimer.current) {
                                clearTimeout(longPressTimer.current);
                                longPressTimer.current = null;
                              }
                            }}
                            title={linkedDoc
                              ? (language === 'he' ? 'פתיחת מסמך (לחץ ארוך לשינוי)' : 'Open document (long press to change)')
                              : (language === 'he' ? 'קישור מסמך' : 'Link document')
                            }
                          >
                            <FileText className="w-3 h-3" />
                          </Button>
                        );
                      })()}
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 text-white bg-green-500/80 hover:bg-green-600"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (site.coverImage) {
                            window.open(site.coverImage, '_blank');
                          } else {
                            setUploadingImageForSiteId(site.id);
                            setImageUploadDialogOpen(true);
                          }
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setUploadingImageForSiteId(site.id);
                          setImageUploadDialogOpen(true);
                        }}
                        title={site.coverImage
                          ? (language === 'he' ? 'פתיחת תמונה' : 'Open image')
                          : (language === 'he' ? 'אין תמונה' : 'No image')
                        }
                      >
                        <Image className="w-3 h-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-white bg-amber-500/80 hover:bg-amber-600" onClick={() => openEdit(site)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-7 w-7 text-white bg-red-500/80 hover:bg-red-600"
                        onClick={() => {
                        if (window.confirm(language === "he" ? "האם אתה בטוח שברצונך למחוק את האתר?" : "Are you sure you want to delete this site?")) {
                          deleteMutation.mutate({ id: site.id });
                        }
                      }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                <CardContent className="pt-3">
                  {site.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{site.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 text-xs">
                    {site.openingHours && (
                      <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
                        <Clock className="w-3 h-3" />
                        {site.openingHours}
                      </span>
                    )}
                    {site.plannedVisitDate && (
                      <span className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(site.plannedVisitDate), "MMM d")}
                      </span>
                    )}
                    {site.website && (
                      <a 
                        href={site.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 bg-blue-500/80 hover:bg-blue-600 text-white px-2 py-1 rounded transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-3 h-3" />
                        {language === 'he' ? 'אתר' : 'Website'}
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="elegant-card p-12 text-center">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">{t("noSites")}</p>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editingId !== null} onOpenChange={(open) => !open && setEditingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("edit")}</DialogTitle>
          </DialogHeader>
          <FormFields defaults={editDefaults} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingId(null)}>{t("cancel")}</Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Link Dialog */}
      <DocumentLinkDialog
        open={documentLinkDialogOpen}
        onOpenChange={setDocumentLinkDialogOpen}
        tripId={tripId}
        currentDocumentId={linkingSiteId ? sites?.find(s => s.id === linkingSiteId)?.linkedDocumentId : null}
        onSelectDocument={handleDocumentSelect}
      />

      {/* Image Upload Dialog */}
      <ImageUploadDialog
        open={imageUploadDialogOpen}
        onOpenChange={setImageUploadDialogOpen}
        title={language === 'he' ? 'העלאת תמונת אתר' : 'Upload Site Image'}
        onUpload={async (imageUrl) => {
          if (uploadingImageForSiteId) {
            await updateMutation.mutateAsync({
              id: uploadingImageForSiteId,
              coverImage: imageUrl,
            });
            toast.success(language === 'he' ? 'התמונה הועלתה בהצלחה' : 'Image uploaded successfully');
            setImageUploadDialogOpen(false);
            setUploadingImageForSiteId(null);
          }
        }}
      />
    </div>
  );
}
