import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { Calendar, Edit, Loader2, MapPin, Plus, Trash2, Users, Utensils } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface RestaurantsTabProps {
  tripId: number;
}

export default function RestaurantsTab({ tripId }: RestaurantsTabProps) {
  const { t, language, isRTL } = useLanguage();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    cuisineType: "",
    reservationDate: "",
    numberOfDiners: "",
    notes: "",
  });

  const utils = trpc.useUtils();
  const { data: restaurants, isLoading } = trpc.restaurants.list.useQuery({ tripId });

  const createMutation = trpc.restaurants.create.useMutation({
    onSuccess: () => {
      utils.restaurants.list.invalidate({ tripId });
      setIsCreateOpen(false);
      resetForm();
      toast.success(language === "he" ? "המסעדה נוספה בהצלחה" : "Restaurant added successfully");
    },
  });

  const updateMutation = trpc.restaurants.update.useMutation({
    onSuccess: () => {
      utils.restaurants.list.invalidate({ tripId });
      setEditingId(null);
      resetForm();
      toast.success(language === "he" ? "המסעדה עודכנה בהצלחה" : "Restaurant updated successfully");
    },
  });

  const deleteMutation = trpc.restaurants.delete.useMutation({
    onSuccess: () => {
      utils.restaurants.list.invalidate({ tripId });
      toast.success(language === "he" ? "המסעדה נמחקה בהצלחה" : "Restaurant deleted successfully");
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      cuisineType: "",
      reservationDate: "",
      numberOfDiners: "",
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
      cuisineType: formData.cuisineType || undefined,
      reservationDate: formData.reservationDate ? new Date(formData.reservationDate).getTime() : undefined,
      numberOfDiners: formData.numberOfDiners ? parseInt(formData.numberOfDiners) : undefined,
      notes: formData.notes || undefined,
    });
  };

  const handleUpdate = () => {
    if (!editingId || !formData.name) return;
    updateMutation.mutate({
      id: editingId,
      name: formData.name,
      address: formData.address || undefined,
      cuisineType: formData.cuisineType || undefined,
      reservationDate: formData.reservationDate ? new Date(formData.reservationDate).getTime() : undefined,
      numberOfDiners: formData.numberOfDiners ? parseInt(formData.numberOfDiners) : undefined,
      notes: formData.notes || undefined,
    });
  };

  const openEdit = (restaurant: NonNullable<typeof restaurants>[0]) => {
    setFormData({
      name: restaurant.name,
      address: restaurant.address || "",
      cuisineType: restaurant.cuisineType || "",
      reservationDate: restaurant.reservationDate ? format(new Date(restaurant.reservationDate), "yyyy-MM-dd'T'HH:mm") : "",
      numberOfDiners: restaurant.numberOfDiners?.toString() || "",
      notes: restaurant.notes || "",
    });
    setEditingId(restaurant.id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const FormFields = () => (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label>{t("restaurantName")} *</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder={language === "he" ? "לה פטיט ביסטרו" : "Le Petit Bistro"}
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
        <Label>{t("cuisineType")}</Label>
        <Input
          value={formData.cuisineType}
          onChange={(e) => setFormData({ ...formData, cuisineType: e.target.value })}
          placeholder={language === "he" ? "צרפתית, איטלקית..." : "French, Italian..."}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>{t("reservationDate")}</Label>
          <Input
            type="datetime-local"
            value={formData.reservationDate}
            onChange={(e) => setFormData({ ...formData, reservationDate: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label>{t("numberOfDiners")}</Label>
          <Input
            type="number"
            min="1"
            value={formData.numberOfDiners}
            onChange={(e) => setFormData({ ...formData, numberOfDiners: e.target.value })}
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
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">{t("restaurants")}</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="btn-elegant" onClick={resetForm}>
              <Plus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t("newRestaurant")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("newRestaurant")}</DialogTitle>
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

      {restaurants && restaurants.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {restaurants.map((restaurant) => (
            <Card key={restaurant.id} className="elegant-card-hover">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
                      <Utensils className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{restaurant.name}</CardTitle>
                      {restaurant.cuisineType && (
                        <CardDescription className="text-xs">{restaurant.cuisineType}</CardDescription>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(restaurant)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 text-destructive"
                      onClick={() => deleteMutation.mutate({ id: restaurant.id })}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {restaurant.address && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                    <MapPin className="w-3 h-3" />
                    <span className="line-clamp-1">{restaurant.address}</span>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 text-xs">
                  {restaurant.reservationDate && (
                    <span className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(restaurant.reservationDate), "MMM d, HH:mm")}
                    </span>
                  )}
                  {restaurant.numberOfDiners && (
                    <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
                      <Users className="w-3 h-3" />
                      {restaurant.numberOfDiners}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="elegant-card p-12 text-center">
          <Utensils className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">{t("noRestaurants")}</p>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editingId !== null} onOpenChange={(open) => !open && setEditingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("edit")}</DialogTitle>
          </DialogHeader>
          <FormFields />
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
