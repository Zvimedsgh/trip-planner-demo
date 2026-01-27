import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { Calendar, Globe, MapPin, Plane, Plus, Trash2, Edit, ArrowRight, Loader2, Camera } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

export default function Trips() {
  const { user, loading: authLoading } = useAuth();
  const { t, language, setLanguage, isRTL } = useLanguage();
  const [, navigate] = useLocation();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    destination: "",
    startDate: "",
    endDate: "",
    description: "",
  });
  const [uploadingImage, setUploadingImage] = useState<number | null>(null);

  const utils = trpc.useUtils();
  const { data: trips, isLoading } = trpc.trips.list.useQuery();
  
  const createMutation = trpc.trips.create.useMutation({
    onSuccess: () => {
      utils.trips.list.invalidate();
      setIsCreateOpen(false);
      resetForm();
      toast.success(language === "he" ? "הטיול נוצר בהצלחה" : "Trip created successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = trpc.trips.update.useMutation({
    onSuccess: () => {
      utils.trips.list.invalidate();
      setEditingTrip(null);
      resetForm();
      toast.success(language === "he" ? "הטיול עודכן בהצלחה" : "Trip updated successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.trips.delete.useMutation({
    onSuccess: () => {
      utils.trips.list.invalidate();
      toast.success(language === "he" ? "הטיול נמחק בהצלחה" : "Trip deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      destination: "",
      startDate: "",
      endDate: "",
      description: "",
    });
  };

  const handleCreate = () => {
    if (!formData.name || !formData.destination || !formData.startDate || !formData.endDate) {
      toast.error(language === "he" ? "נא למלא את כל השדות החובה" : "Please fill in all required fields");
      return;
    }
    
    createMutation.mutate({
      name: formData.name,
      destination: formData.destination,
      startDate: new Date(formData.startDate).getTime(),
      endDate: new Date(formData.endDate).getTime(),
      description: formData.description || undefined,
    });
  };

  const handleUpdate = () => {
    if (!editingTrip || !formData.name || !formData.destination || !formData.startDate || !formData.endDate) {
      toast.error(language === "he" ? "נא למלא את כל השדות החובה" : "Please fill in all required fields");
      return;
    }
    
    updateMutation.mutate({
      id: editingTrip,
      name: formData.name,
      destination: formData.destination,
      startDate: new Date(formData.startDate).getTime(),
      endDate: new Date(formData.endDate).getTime(),
      description: formData.description || undefined,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm(t("confirmDelete"))) {
      if (window.confirm(language === "he" ? "האם אתה בטוח שברצונך למחוק את הטיול? פעולה זו תמחק את כל המידע הקשור לטיול." : "Are you sure you want to delete this trip? This will delete all related information.")) {
      deleteMutation.mutate({ id });
    }
    }
  };

  const openEditDialog = (trip: NonNullable<typeof trips>[0]) => {
    setFormData({
      name: trip.name,
      destination: trip.destination,
      startDate: format(new Date(trip.startDate), "yyyy-MM-dd"),
      endDate: format(new Date(trip.endDate), "yyyy-MM-dd"),
      description: trip.description || "",
    });
    setEditingTrip(trip.id);
  };

  const getDaysCount = (start: number, end: number) => {
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };

  const uploadImageMutation = trpc.trips.uploadCoverImage.useMutation({
    onSuccess: () => {
      utils.trips.list.invalidate();
      setUploadingImage(null);
      toast.success(language === "he" ? "התמונה הועלתה בהצלחה" : "Image uploaded successfully");
    },
    onError: (error) => {
      setUploadingImage(null);
      toast.error(error.message);
    },
  });

  const handleImageUpload = (tripId: number, file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error(language === "he" ? "הקובץ גדול מדי (max 5MB)" : "File too large (max 5MB)");
      return;
    }
    setUploadingImage(tripId);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      uploadImageMutation.mutate({
        tripId,
        imageData: base64,
        mimeType: file.type,
      });
    };
    reader.readAsDataURL(file);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/10">
        <div className="container flex items-center justify-between h-16">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                <Plane className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">{t("appName")}</span>
            </div>
          </Link>
          
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(language === "en" ? "he" : "en")}
              className="flex items-center gap-2"
            >
              <Globe className="w-4 h-4" />
              <span>{language === "en" ? "עברית" : "English"}</span>
            </Button>
            
            <span className="text-sm text-muted-foreground">
              {t("welcome")}, {user?.name || "Traveler"}
            </span>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t("myTrips")}</h1>
            <p className="text-muted-foreground">
              {trips?.length || 0} {language === "he" ? "טיולים" : "trips"}
            </p>
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="btn-elegant" onClick={resetForm}>
                <Plus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t("newTrip")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{t("newTrip")}</DialogTitle>
                <DialogDescription>
                  {language === "he" ? "צור טיול חדש ותתחיל לתכנן את ההרפתקה שלך" : "Create a new trip and start planning your adventure"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">{t("tripName")} *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={language === "he" ? "הרפתקה בפריז" : "Paris Adventure"}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="destination">{t("destination")} *</Label>
                  <Input
                    id="destination"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    placeholder={language === "he" ? "פריז, צרפת" : "Paris, France"}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startDate">{t("startDate")} *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endDate">{t("endDate")} *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">{t("description")}</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={language === "he" ? "תיאור קצר של הטיול..." : "Brief description of your trip..."}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  {t("cancel")}
                </Button>
                <Button onClick={handleCreate} disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {t("create")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Trips Grid */}
        {trips && trips.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => {
              // Get background image based on destination
              const getDestinationImage = (destination: string) => {
                const dest = destination.toLowerCase();
                if (dest.includes('slovakia') || dest.includes('bratislava') || dest.includes('kosice') || dest.includes('tatra') || dest.includes('סלובקיה')) {
                  return '/slovakia.jpg';
                }
                if (dest.includes('paris') || dest.includes('france') || dest.includes('פריז') || dest.includes('צרפת')) {
                  return '/images/dest-paris.jpg';
                }
                if (dest.includes('rome') || dest.includes('italy') || dest.includes('roma') || dest.includes('רומא') || dest.includes('איטליה')) {
                  return '/images/dest-rome.jpg';
                }
                if (dest.includes('new york') || dest.includes('nyc') || dest.includes('manhattan') || dest.includes('ניו יורק')) {
                  return '/images/dest-newyork.jpg';
                }
                if (dest.includes('vienna') || dest.includes('wien') || dest.includes('austria') || dest.includes('וינה') || dest.includes('אוסטריה')) {
                  return '/images/site-bratislava.jpg'; // Using Bratislava castle as fallback for Vienna area
                }
                // Default gradient for other destinations
                return null;
              };
              const bgImage = trip.coverImage || getDestinationImage(trip.destination);
              
              return (
              <Card key={trip.id} className="elegant-card-hover overflow-hidden group relative h-64">
                {/* Full background image */}
                {bgImage ? (
                  <>
                    <img 
                      src={bgImage} 
                      alt={trip.destination}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  </>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/20 to-pink-500/20">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <MapPin className="w-12 h-12 text-primary/30" />
                    </div>
                  </div>
                )}
                
                {/* Content overlay */}
                <div className="relative h-full flex flex-col justify-between p-6">
                  {uploadingImage === trip.id && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-white" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          e.preventDefault();
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(trip.id, file);
                        }}
                      />
                      <div className="h-8 w-8 rounded-md bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
                        <Camera className="w-4 h-4" />
                      </div>
                    </label>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.preventDefault();
                        openEditDialog(trip);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete(trip.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Top section - Title and destination */}
                  <div className="text-white">
                    <h3 className="text-xl font-bold mb-1">{trip.name}</h3>
                    <div className="flex items-center gap-1 text-white/90 text-sm">
                      <MapPin className="w-4 h-4" />
                      {trip.destination}
                    </div>
                  </div>
                  
                  {/* Bottom section - Date and button */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-white/90">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {format(new Date(trip.startDate), "MMM d")} - {format(new Date(trip.endDate), "MMM d, yyyy")}
                      </span>
                      <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">
                        {getDaysCount(trip.startDate, trip.endDate)} {t("days")}
                      </span>
                    </div>
                    <Link href={`/trip/${trip.id}`}>
                      <Button className="w-full group/btn bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all text-base font-semibold">
                        {t("tripDetails")}
                        <ArrowRight className={`w-4 h-4 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'} group-hover/btn:translate-x-1 transition-transform`} />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );})}
          </div>
        ) : (
          <div className="elegant-card p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Plane className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{t("noTrips")}</h3>
            <p className="text-muted-foreground mb-6">
              {language === "he" ? "התחל לתכנן את ההרפתקה הבאה שלך" : "Start planning your next adventure"}
            </p>
            <Button className="btn-elegant" onClick={() => setIsCreateOpen(true)}>
              <Plus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t("newTrip")}
            </Button>
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={editingTrip !== null} onOpenChange={(open) => !open && setEditingTrip(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{t("editTrip")}</DialogTitle>
              <DialogDescription>
                {language === "he" ? "עדכן את פרטי הטיול" : "Update your trip details"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">{t("tripName")} *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-destination">{t("destination")} *</Label>
                <Input
                  id="edit-destination"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-startDate">{t("startDate")} *</Label>
                  <Input
                    id="edit-startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-endDate">{t("endDate")} *</Label>
                  <Input
                    id="edit-endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">{t("description")}</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingTrip(null)}>
                {t("cancel")}
              </Button>
              <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
                {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {t("save")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Floating Action Button with Quick Actions */}
        <div className="fixed bottom-8 right-8 z-50">
          <div className="relative group">
            {/* Quick Action Buttons */}
            <div className="absolute bottom-16 right-0 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto">
              <Button
                size="lg"
                className="rounded-full shadow-lg bg-emerald-500 hover:bg-emerald-600 text-white"
                onClick={() => {
                  setIsCreateOpen(true);
                }}
              >
                <Plane className="w-5 h-5 mr-2" />
                {language === 'he' ? 'טיול חדש' : 'New Trip'}
              </Button>
            </div>
            
            {/* Main FAB */}
            <Button
              size="lg"
              className="rounded-full w-16 h-16 shadow-2xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 transition-all group-hover:rotate-45"
            >
              <Plus className="w-8 h-8" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
