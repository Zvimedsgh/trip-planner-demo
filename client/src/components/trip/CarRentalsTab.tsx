import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { Calendar, Car, DollarSign, Edit, Loader2, MapPin, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CarRentalsTabProps {
  tripId: number;
}

export default function CarRentalsTab({ tripId }: CarRentalsTabProps) {
  const { t, language, isRTL } = useLanguage();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    company: "",
    carModel: "",
    pickupDate: "",
    returnDate: "",
    pickupLocation: "",
    returnLocation: "",
    confirmationNumber: "",
    price: "",
    currency: "USD",
    notes: "",
  });

  const utils = trpc.useUtils();
  const { data: rentals, isLoading } = trpc.carRentals.list.useQuery({ tripId });

  const createMutation = trpc.carRentals.create.useMutation({
    onSuccess: () => {
      utils.carRentals.list.invalidate({ tripId });
      utils.budget.get.invalidate({ tripId });
      setIsCreateOpen(false);
      resetForm();
      toast.success(language === "he" ? "השכרת הרכב נוספה בהצלחה" : "Car rental added successfully");
    },
  });

  const updateMutation = trpc.carRentals.update.useMutation({
    onSuccess: () => {
      utils.carRentals.list.invalidate({ tripId });
      utils.budget.get.invalidate({ tripId });
      setEditingId(null);
      resetForm();
      toast.success(language === "he" ? "השכרת הרכב עודכנה בהצלחה" : "Car rental updated successfully");
    },
  });

  const deleteMutation = trpc.carRentals.delete.useMutation({
    onSuccess: () => {
      utils.carRentals.list.invalidate({ tripId });
      utils.budget.get.invalidate({ tripId });
      toast.success(language === "he" ? "השכרת הרכב נמחקה בהצלחה" : "Car rental deleted successfully");
    },
  });

  const resetForm = () => {
    setFormData({
      company: "",
      carModel: "",
      pickupDate: "",
      returnDate: "",
      pickupLocation: "",
      returnLocation: "",
      confirmationNumber: "",
      price: "",
      currency: "USD",
      notes: "",
    });
  };

  const handleCreate = () => {
    if (!formData.company || !formData.pickupDate || !formData.returnDate) {
      toast.error(language === "he" ? "נא למלא שדות חובה" : "Please fill required fields");
      return;
    }
    createMutation.mutate({
      tripId,
      company: formData.company,
      carModel: formData.carModel || undefined,
      pickupDate: new Date(formData.pickupDate).getTime(),
      returnDate: new Date(formData.returnDate).getTime(),
      pickupLocation: formData.pickupLocation || undefined,
      returnLocation: formData.returnLocation || undefined,
      confirmationNumber: formData.confirmationNumber || undefined,
      price: formData.price || undefined,
      currency: formData.currency || undefined,
      notes: formData.notes || undefined,
    });
  };

  const handleUpdate = () => {
    if (!editingId || !formData.company || !formData.pickupDate || !formData.returnDate) return;
    updateMutation.mutate({
      id: editingId,
      company: formData.company,
      carModel: formData.carModel || undefined,
      pickupDate: new Date(formData.pickupDate).getTime(),
      returnDate: new Date(formData.returnDate).getTime(),
      pickupLocation: formData.pickupLocation || undefined,
      returnLocation: formData.returnLocation || undefined,
      confirmationNumber: formData.confirmationNumber || undefined,
      price: formData.price || undefined,
      currency: formData.currency || undefined,
      notes: formData.notes || undefined,
    });
  };

  const openEdit = (rental: NonNullable<typeof rentals>[0]) => {
    setFormData({
      company: rental.company,
      carModel: rental.carModel || "",
      pickupDate: format(new Date(rental.pickupDate), "yyyy-MM-dd"),
      returnDate: format(new Date(rental.returnDate), "yyyy-MM-dd"),
      pickupLocation: rental.pickupLocation || "",
      returnLocation: rental.returnLocation || "",
      confirmationNumber: rental.confirmationNumber || "",
      price: rental.price || "",
      currency: rental.currency || "USD",
      notes: rental.notes || "",
    });
    setEditingId(rental.id);
  };

  const getDays = (pickup: number, returnDate: number) => {
    return Math.ceil((returnDate - pickup) / (1000 * 60 * 60 * 24));
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
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>{t("company")} *</Label>
          <Input
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            placeholder="Hertz, Avis..."
          />
        </div>
        <div className="grid gap-2">
          <Label>{t("carModel")}</Label>
          <Input
            value={formData.carModel}
            onChange={(e) => setFormData({ ...formData, carModel: e.target.value })}
            placeholder="Toyota Corolla"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>{t("pickupDate")} *</Label>
          <Input
            type="date"
            value={formData.pickupDate}
            onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label>{t("returnDate")} *</Label>
          <Input
            type="date"
            value={formData.returnDate}
            onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>{t("pickupLocation")}</Label>
          <Input
            value={formData.pickupLocation}
            onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label>{t("returnLocation")}</Label>
          <Input
            value={formData.returnLocation}
            onChange={(e) => setFormData({ ...formData, returnLocation: e.target.value })}
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
        <h2 className="text-xl font-semibold">{t("carRentals")}</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="btn-elegant" onClick={resetForm}>
              <Plus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t("newCarRental")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("newCarRental")}</DialogTitle>
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

      {rentals && rentals.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rentals.map((rental) => (
            <Card key={rental.id} className="elegant-card-hover">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                      <Car className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{rental.company}</CardTitle>
                      {rental.carModel && (
                        <CardDescription className="text-xs">{rental.carModel}</CardDescription>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(rental)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 text-destructive"
                      onClick={() => deleteMutation.mutate({ id: rental.id })}
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
                    {format(new Date(rental.pickupDate), "MMM d")} - {format(new Date(rental.returnDate), "MMM d")}
                  </span>
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">
                    {getDays(rental.pickupDate, rental.returnDate)} {t("days")}
                  </span>
                </div>
                {(rental.pickupLocation || rental.returnLocation) && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                    <MapPin className="w-3 h-3" />
                    <span>{rental.pickupLocation || rental.returnLocation}</span>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 text-xs">
                  {rental.confirmationNumber && (
                    <span className="bg-muted px-2 py-1 rounded">
                      #{rental.confirmationNumber}
                    </span>
                  )}
                  {rental.price && (
                    <span className="flex items-center gap-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded">
                      <DollarSign className="w-3 h-3" />
                      {rental.price} {rental.currency}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="elegant-card p-12 text-center">
          <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">{t("noCarRentals")}</p>
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
