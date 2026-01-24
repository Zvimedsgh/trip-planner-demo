import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { Calendar, Clock, Edit, Loader2, MapPin, Plus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface TouristSitesTabProps {
  tripId: number;
}

export default function TouristSitesTab({ tripId }: TouristSitesTabProps) {
  const { t, language, isRTL } = useLanguage();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const utils = trpc.useUtils();
  const { data: sites, isLoading } = trpc.touristSites.list.useQuery({ tripId });

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
              <Card key={site.id} className="elegant-card-hover overflow-hidden">
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
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-white hover:bg-white/20" onClick={() => openEdit(site)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-7 w-7 text-white hover:bg-white/20"
                        onClick={() => deleteMutation.mutate({ id: site.id })}
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
    </div>
  );
}
