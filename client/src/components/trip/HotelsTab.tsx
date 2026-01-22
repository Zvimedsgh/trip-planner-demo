import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { Calendar, DollarSign, Edit, Hotel, Loader2, MapPin, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface HotelsTabProps {
  tripId: number;
}

export default function HotelsTab({ tripId }: HotelsTabProps) {
  const { t, language, isRTL } = useLanguage();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    checkInDate: "",
    checkOutDate: "",
    confirmationNumber: "",
    price: "",
    currency: "USD",
    notes: "",
  });

  const utils = trpc.useUtils();
  const { data: hotels, isLoading } = trpc.hotels.list.useQuery({ tripId });

  const createMutation = trpc.hotels.create.useMutation({
    onSuccess: () => {
      utils.hotels.list.invalidate({ tripId });
      utils.budget.get.invalidate({ tripId });
      setIsCreateOpen(false);
      resetForm();
      toast.success(language === "he" ? "המלון נוסף בהצלחה" : "Hotel added successfully");
    },
  });

  const updateMutation = trpc.hotels.update.useMutation({
    onSuccess: () => {
      utils.hotels.list.invalidate({ tripId });
      utils.budget.get.invalidate({ tripId });
      setEditingId(null);
      resetForm();
      toast.success(language === "he" ? "המלון עודכן בהצלחה" : "Hotel updated successfully");
    },
  });

  const deleteMutation = trpc.hotels.delete.useMutation({
    onSuccess: () => {
      utils.hotels.list.invalidate({ tripId });
      utils.budget.get.invalidate({ tripId });
      toast.success(language === "he" ? "המלון נמחק בהצלחה" : "Hotel deleted successfully");
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      checkInDate: "",
      checkOutDate: "",
      confirmationNumber: "",
      price: "",
      currency: "USD",
      notes: "",
    });
  };

  const handleCreate = () => {
    if (!formData.name || !formData.checkInDate || !formData.checkOutDate) {
      toast.error(language === "he" ? "נא למלא שדות חובה" : "Please fill required fields");
      return;
    }
    createMutation.mutate({
      tripId,
      name: formData.name,
      address: formData.address || undefined,
      checkInDate: new Date(formData.checkInDate).getTime(),
      checkOutDate: new Date(formData.checkOutDate).getTime(),
      confirmationNumber: formData.confirmationNumber || undefined,
      price: formData.price || undefined,
      currency: formData.currency || undefined,
      notes: formData.notes || undefined,
    });
  };

  const handleUpdate = () => {
    if (!editingId || !formData.name || !formData.checkInDate || !formData.checkOutDate) return;
    updateMutation.mutate({
      id: editingId,
      name: formData.name,
      address: formData.address || undefined,
      checkInDate: new Date(formData.checkInDate).getTime(),
      checkOutDate: new Date(formData.checkOutDate).getTime(),
      confirmationNumber: formData.confirmationNumber || undefined,
      price: formData.price || undefined,
      currency: formData.currency || undefined,
      notes: formData.notes || undefined,
    });
  };

  const openEdit = (hotel: NonNullable<typeof hotels>[0]) => {
    setFormData({
      name: hotel.name,
      address: hotel.address || "",
      checkInDate: format(new Date(hotel.checkInDate), "yyyy-MM-dd"),
      checkOutDate: format(new Date(hotel.checkOutDate), "yyyy-MM-dd"),
      confirmationNumber: hotel.confirmationNumber || "",
      price: hotel.price || "",
      currency: hotel.currency || "USD",
      notes: hotel.notes || "",
    });
    setEditingId(hotel.id);
  };

  const getNights = (checkIn: number, checkOut: number) => {
    return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
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
        <Label>{t("hotelName")} *</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder={language === "he" ? "מלון הילטון" : "Hilton Hotel"}
        />
      </div>
      <div className="grid gap-2">
        <Label>{t("address")}</Label>
        <Input
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>{t("checkIn")} *</Label>
          <Input
            type="date"
            value={formData.checkInDate}
            onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label>{t("checkOut")} *</Label>
          <Input
            type="date"
            value={formData.checkOutDate}
            onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })}
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label>{t("confirmationNumber")}</Label>
        <Input
          value={formData.confirmationNumber}
          onChange={(e) => setFormData({ ...formData, confirmationNumber: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>{t("price")}</Label>
          <Input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label>{t("currency")}</Label>
          <Input
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
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
        <h2 className="text-xl font-semibold">{t("hotels")}</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="btn-elegant" onClick={resetForm}>
              <Plus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t("newHotel")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("newHotel")}</DialogTitle>
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

      {hotels && hotels.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {hotels.map((hotel) => (
            <Card key={hotel.id} className="elegant-card-hover">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                      <Hotel className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{hotel.name}</CardTitle>
                      {hotel.address && (
                        <CardDescription className="flex items-center gap-1 text-xs">
                          <MapPin className="w-3 h-3" />
                          {hotel.address}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(hotel)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 text-destructive"
                      onClick={() => deleteMutation.mutate({ id: hotel.id })}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {format(new Date(hotel.checkInDate), "MMM d")} - {format(new Date(hotel.checkOutDate), "MMM d")}
                  </span>
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">
                    {getNights(hotel.checkInDate, hotel.checkOutDate)} nights
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {hotel.confirmationNumber && (
                    <span className="bg-muted px-2 py-1 rounded">
                      #{hotel.confirmationNumber}
                    </span>
                  )}
                  {hotel.price && (
                    <span className="flex items-center gap-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded">
                      <DollarSign className="w-3 h-3" />
                      {hotel.price} {hotel.currency}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="elegant-card p-12 text-center">
          <Hotel className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">{t("noHotels")}</p>
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
