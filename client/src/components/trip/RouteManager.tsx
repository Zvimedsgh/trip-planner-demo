import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Navigation, Clock, MapPin, ExternalLink } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";

interface RouteManagerProps {
  tripId: number;
}

export default function RouteManager({ tripId }: RouteManagerProps) {
  const { language } = useLanguage();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<any>(null);
  
  const { data: routes, refetch } = trpc.routes.list.useQuery({ tripId });
  
  const [formData, setFormData] = useState({
    name: "",
    nameHe: "",
    description: "",
    descriptionHe: "",
    date: Date.now(),
    time: "09:00",
    distanceKm: "",
    estimatedDuration: "",
    roadType: "highway",
  });

  const createMutation = trpc.routes.create.useMutation({
    onSuccess: () => {
      toast.success(language === "he" ? "מסלול נוסף בהצלחה" : "Route added successfully");
      refetch();
      setDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = trpc.routes.update.useMutation({
    onSuccess: () => {
      toast.success(language === "he" ? "מסלול עודכן בהצלחה" : "Route updated successfully");
      refetch();
      setDialogOpen(false);
      resetForm();
      setEditingRoute(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.routes.delete.useMutation({
    onSuccess: () => {
      toast.success(language === "he" ? "מסלול נמחק בהצלחה" : "Route deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      nameHe: "",
      description: "",
      descriptionHe: "",
      date: Date.now(),
      time: "09:00",
      distanceKm: "",
      estimatedDuration: "",
      roadType: "highway",
    });
  };

  const handleEdit = (route: any) => {
    setEditingRoute(route);
    setFormData({
      name: route.name || "",
      nameHe: route.nameHe || "",
      description: route.description || "",
      descriptionHe: route.descriptionHe || "",
      date: route.date,
      time: route.time || "09:00",
      distanceKm: route.distanceKm?.toString() || "",
      estimatedDuration: route.estimatedDuration?.toString() || "",
      roadType: route.roadType || "highway",
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      tripId,
      name: formData.name,
      nameHe: formData.nameHe || undefined,
      description: formData.description || undefined,
      descriptionHe: formData.descriptionHe || undefined,
      date: formData.date,
      time: formData.time && formData.time.trim() !== "" ? formData.time : undefined,
      distanceKm: formData.distanceKm ? parseFloat(formData.distanceKm) : undefined,
      estimatedDuration: formData.estimatedDuration ? parseInt(formData.estimatedDuration) : undefined,
      roadType: formData.roadType || undefined,
    };

    if (editingRoute) {
      updateMutation.mutate({ id: editingRoute.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm(language === "he" ? "האם אתה בטוח שברצונך למחוק מסלול זה?" : "Are you sure you want to delete this route?")) {
      deleteMutation.mutate({ id });
    }
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}${language === "he" ? " דק'" : " min"}`;
    if (mins === 0) return `${hours}${language === "he" ? " שע'" : " hr"}`;
    return `${hours}${language === "he" ? " שע' " : "h "}${mins}${language === "he" ? " דק'" : "m"}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {language === "he" ? "ניהול מסלולים" : "Route Management"}
        </h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            resetForm();
            setEditingRoute(null);
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {language === "he" ? "הוסף מסלול" : "Add Route"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingRoute
                  ? (language === "he" ? "ערוך מסלול" : "Edit Route")
                  : (language === "he" ? "הוסף מסלול חדש" : "Add New Route")}
              </DialogTitle>
              <DialogDescription>
                {language === "he"
                  ? "הזן את פרטי המסלול כולל מרחק וזמן נסיעה משוער"
                  : "Enter route details including distance and estimated travel time"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">{language === "he" ? "שם (אנגלית)" : "Name (English)"}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Route 1: Bratislava → Liptovský Mikuláš"
                  />
                </div>
                <div>
                  <Label htmlFor="nameHe">{language === "he" ? "שם (עברית)" : "Name (Hebrew)"}</Label>
                  <Input
                    id="nameHe"
                    value={formData.nameHe}
                    onChange={(e) => setFormData({ ...formData, nameHe: e.target.value })}
                    placeholder="מסלול 1: ברטיסלבה → ליפטובסקי מיקולאש"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="description">{language === "he" ? "תיאור (אנגלית)" : "Description (English)"}</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Day 2: Drive to mountain accommodation"
                  />
                </div>
                <div>
                  <Label htmlFor="descriptionHe">{language === "he" ? "תיאור (עברית)" : "Description (Hebrew)"}</Label>
                  <Textarea
                    id="descriptionHe"
                    value={formData.descriptionHe}
                    onChange={(e) => setFormData({ ...formData, descriptionHe: e.target.value })}
                    placeholder="יום 2: נסיעה למלון בהרים"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">{language === "he" ? "תאריך" : "Date"}</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date ? format(new Date(formData.date), "yyyy-MM-dd") : ""}
                    onChange={(e) => {
                      const dateValue = e.target.value;
                      if (dateValue) {
                        const timestamp = new Date(dateValue).getTime();
                        if (!isNaN(timestamp)) {
                          setFormData({ ...formData, date: timestamp });
                        }
                      }
                    }}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="time">{language === "he" ? "שעה" : "Time"}</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="distanceKm">{language === "he" ? "מרחק (ק\"מ)" : "Distance (km)"}</Label>
                  <Input
                    id="distanceKm"
                    type="number"
                    step="0.1"
                    value={formData.distanceKm}
                    onChange={(e) => setFormData({ ...formData, distanceKm: e.target.value })}
                    placeholder="150"
                  />
                </div>
                <div>
                  <Label htmlFor="estimatedDuration">{language === "he" ? "זמן נסיעה (דקות)" : "Duration (minutes)"}</Label>
                  <Input
                    id="estimatedDuration"
                    type="number"
                    value={formData.estimatedDuration}
                    onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                    placeholder="120"
                  />
                </div>
                <div>
                  <Label htmlFor="roadType">{language === "he" ? "סוג כביש" : "Road Type"}</Label>
                  <Select
                    value={formData.roadType}
                    onValueChange={(value) => setFormData({ ...formData, roadType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="highway">{language === "he" ? "כביש מהיר" : "Highway"}</SelectItem>
                      <SelectItem value="scenic">{language === "he" ? "כביש נופי" : "Scenic"}</SelectItem>
                      <SelectItem value="mountain">{language === "he" ? "כביש הרים" : "Mountain"}</SelectItem>
                      <SelectItem value="urban">{language === "he" ? "עירוני" : "Urban"}</SelectItem>
                      <SelectItem value="rural">{language === "he" ? "כפרי" : "Rural"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    resetForm();
                    setEditingRoute(null);
                  }}
                >
                  {language === "he" ? "ביטול" : "Cancel"}
                </Button>
                <Button type="submit">
                  {editingRoute
                    ? (language === "he" ? "עדכן" : "Update")
                    : (language === "he" ? "הוסף" : "Add")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {routes?.map((route) => (
          <Card key={route.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    {language === "he" && route.nameHe ? route.nameHe : route.name}
                  </CardTitle>
                  <CardDescription>
                    {language === "he" && route.descriptionHe ? route.descriptionHe : route.description}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(route)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(route.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{format(new Date(route.date), "MMM d, yyyy")} • {route.time}</span>
                </div>
                {route.distanceKm && (
                  <div className="flex items-center gap-1">
                    <Navigation className="w-4 h-4" />
                    <span>{route.distanceKm} {language === "he" ? "ק\"מ" : "km"}</span>
                  </div>
                )}
                {route.estimatedDuration && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatDuration(route.estimatedDuration)}</span>
                  </div>
                )}
                {route.roadType && (
                  <div className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
                    {route.roadType}
                  </div>
                )}
              </div>
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    const routeName = language === "he" && route.nameHe ? route.nameHe : route.name;
                    // Remove "Route X: " prefix for better Google Maps search
                    const cleanRouteName = routeName.replace(/^Route \d+:\s*/i, '');
                    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanRouteName)}`;
                    window.open(googleMapsUrl, "_blank");
                  }}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {language === "he" ? "פתח במפה" : "Open in Map"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {routes?.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Navigation className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {language === "he"
                  ? "אין מסלולים עדיין. לחץ על 'הוסף מסלול' כדי להתחיל."
                  : "No routes yet. Click 'Add Route' to get started."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
