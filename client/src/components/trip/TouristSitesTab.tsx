import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { Calendar, Clock, Edit, Loader2, MapPin, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface TouristSitesTabProps {
  tripId: number;
}

export default function TouristSitesTab({ tripId }: TouristSitesTabProps) {
  const { t, language, isRTL } = useLanguage();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    description: "",
    openingHours: "",
    plannedVisitDate: "",
    notes: "",
  });

  const utils = trpc.useUtils();
  const { data: sites, isLoading } = trpc.touristSites.list.useQuery({ tripId });

  const createMutation = trpc.touristSites.create.useMutation({
    onSuccess: () => {
      utils.touristSites.list.invalidate({ tripId });
      setIsCreateOpen(false);
      resetForm();
      toast.success(language === "he" ? "האתר נוסף בהצלחה" : "Site added successfully");
    },
  });

  const updateMutation = trpc.touristSites.update.useMutation({
    onSuccess: () => {
      utils.touristSites.list.invalidate({ tripId });
      setEditingId(null);
      resetForm();
      toast.success(language === "he" ? "האתר עודכן בהצלחה" : "Site updated successfully");
    },
  });

  const deleteMutation = trpc.touristSites.delete.useMutation({
    onSuccess: () => {
      utils.touristSites.list.invalidate({ tripId });
      toast.success(language === "he" ? "האתר נמחק בהצלחה" : "Site deleted successfully");
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      description: "",
      openingHours: "",
      plannedVisitDate: "",
      notes: "",
    });
  };

  const handleCreate = () => {
    if (!formData.name) {
      toast.error(language === "he" ? "נא להזין שם" : "Please enter a name");
      return;
    }
    createMutation.mutate({
      tripId,
      name: formData.name,
      address: formData.address || undefined,
      description: formData.description || undefined,
      openingHours: formData.openingHours || undefined,
      plannedVisitDate: formData.plannedVisitDate ? new Date(formData.plannedVisitDate).getTime() : undefined,
      notes: formData.notes || undefined,
    });
  };

  const handleUpdate = () => {
    if (!editingId || !formData.name) return;
    updateMutation.mutate({
      id: editingId,
      name: formData.name,
      address: formData.address || undefined,
      description: formData.description || undefined,
      openingHours: formData.openingHours || undefined,
      plannedVisitDate: formData.plannedVisitDate ? new Date(formData.plannedVisitDate).getTime() : undefined,
      notes: formData.notes || undefined,
    });
  };

  const openEdit = (site: NonNullable<typeof sites>[0]) => {
    setFormData({
      name: site.name,
      address: site.address || "",
      description: site.description || "",
      openingHours: site.openingHours || "",
      plannedVisitDate: site.plannedVisitDate ? format(new Date(site.plannedVisitDate), "yyyy-MM-dd") : "",
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">{t("touristSites")}</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="btn-elegant" onClick={resetForm}>
              <Plus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t("newSite")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("newSite")}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>{t("siteName")} *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={language === "he" ? "מגדל אייפל" : "Eiffel Tower"}
                />
              </div>
              <div className="grid gap-2">
                <Label>{t("address")}</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>{t("description")}</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>{t("openingHours")}</Label>
                  <Input
                    value={formData.openingHours}
                    onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                    placeholder="9:00 - 18:00"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{t("plannedVisitDate")}</Label>
                  <Input
                    type="date"
                    value={formData.plannedVisitDate}
                    onChange={(e) => setFormData({ ...formData, plannedVisitDate: e.target.value })}
                  />
                </div>
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
          {sites.map((site) => (
            <Card key={site.id} className="elegant-card-hover">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{site.name}</CardTitle>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(site)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 text-destructive"
                      onClick={() => deleteMutation.mutate({ id: site.id })}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {site.address && (
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {site.address}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
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
          ))}
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
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t("siteName")} *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t("address")}</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t("description")}</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t("openingHours")}</Label>
                <Input
                  value={formData.openingHours}
                  onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>{t("plannedVisitDate")}</Label>
                <Input
                  type="date"
                  value={formData.plannedVisitDate}
                  onChange={(e) => setFormData({ ...formData, plannedVisitDate: e.target.value })}
                />
              </div>
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
