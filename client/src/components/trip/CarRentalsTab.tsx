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
import { useRef, useState } from "react";
import { toast } from "sonner";

interface CarRentalsTabProps {
  tripId: number;
}

export default function CarRentalsTab({ tripId }: CarRentalsTabProps) {
  const { t, language, isRTL } = useLanguage();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const utils = trpc.useUtils();
  const { data: rentals, isLoading } = trpc.carRentals.list.useQuery({ tripId });

  const createMutation = trpc.carRentals.create.useMutation({
    onSuccess: () => {
      utils.carRentals.list.invalidate({ tripId });
      utils.budget.get.invalidate({ tripId });
      setIsCreateOpen(false);
      toast.success(language === "he" ? "השכרת הרכב נוספה בהצלחה" : "Car rental added successfully");
    },
  });

  const updateMutation = trpc.carRentals.update.useMutation({
    onSuccess: () => {
      utils.carRentals.list.invalidate({ tripId });
      utils.budget.get.invalidate({ tripId });
      setEditingId(null);
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

  const getFormValues = () => {
    if (!formRef.current) return null;
    const getValue = (name: string) => {
      const el = formRef.current?.querySelector(`[name="${name}"]`) as HTMLInputElement | HTMLTextAreaElement | null;
      return el?.value || "";
    };
    return {
      company: getValue("company"),
      carModel: getValue("carModel"),
      pickupDate: getValue("pickupDate"),
      returnDate: getValue("returnDate"),
      pickupLocation: getValue("pickupLocation"),
      returnLocation: getValue("returnLocation"),
      confirmationNumber: getValue("confirmationNumber"),
      price: getValue("price"),
      currency: getValue("currency"),
      notes: getValue("notes"),
    };
  };

  const handleCreate = () => {
    const values = getFormValues();
    if (!values) return;
    
    if (!values.company || !values.pickupDate || !values.returnDate) {
      toast.error(language === "he" ? "נא למלא שדות חובה" : "Please fill required fields");
      return;
    }
    createMutation.mutate({
      tripId,
      company: values.company,
      carModel: values.carModel || undefined,
      pickupDate: new Date(values.pickupDate).getTime(),
      returnDate: new Date(values.returnDate).getTime(),
      pickupLocation: values.pickupLocation || undefined,
      returnLocation: values.returnLocation || undefined,
      confirmationNumber: values.confirmationNumber || undefined,
      price: values.price || undefined,
      currency: values.currency || undefined,
      notes: values.notes || undefined,
    });
  };

  const handleUpdate = () => {
    const values = getFormValues();
    if (!values || !editingId) return;
    
    if (!values.company || !values.pickupDate || !values.returnDate) {
      toast.error(language === "he" ? "נא למלא שדות חובה" : "Please fill required fields");
      return;
    }
    updateMutation.mutate({
      id: editingId,
      company: values.company,
      carModel: values.carModel || undefined,
      pickupDate: new Date(values.pickupDate).getTime(),
      returnDate: new Date(values.returnDate).getTime(),
      pickupLocation: values.pickupLocation || undefined,
      returnLocation: values.returnLocation || undefined,
      confirmationNumber: values.confirmationNumber || undefined,
      price: values.price || undefined,
      currency: values.currency || undefined,
      notes: values.notes || undefined,
    });
  };

  const [editDefaults, setEditDefaults] = useState({
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

  const openEdit = (rental: NonNullable<typeof rentals>[0]) => {
    setEditDefaults({
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

  const FormFields = ({ defaults }: { defaults?: typeof editDefaults }) => (
    <div className="grid gap-4 py-4" ref={formRef}>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>{t("company")} *</Label>
          <Input
            name="company"
            defaultValue={defaults?.company || ""}
            placeholder="Hertz, Avis..."
          />
        </div>
        <div className="grid gap-2">
          <Label>{t("carModel")}</Label>
          <Input
            name="carModel"
            defaultValue={defaults?.carModel || ""}
            placeholder="Toyota Corolla"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>{t("pickupDate")} *</Label>
          <Input
            name="pickupDate"
            type="date"
            defaultValue={defaults?.pickupDate || ""}
          />
        </div>
        <div className="grid gap-2">
          <Label>{t("returnDate")} *</Label>
          <Input
            name="returnDate"
            type="date"
            defaultValue={defaults?.returnDate || ""}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>{t("pickupLocation")}</Label>
          <Input
            name="pickupLocation"
            defaultValue={defaults?.pickupLocation || ""}
          />
        </div>
        <div className="grid gap-2">
          <Label>{t("returnLocation")}</Label>
          <Input
            name="returnLocation"
            defaultValue={defaults?.returnLocation || ""}
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label>{t("confirmationNumber")}</Label>
        <Input
          name="confirmationNumber"
          defaultValue={defaults?.confirmationNumber || ""}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>{t("price")}</Label>
          <Input
            name="price"
            type="number"
            defaultValue={defaults?.price || ""}
          />
        </div>
        <div className="grid gap-2">
          <Label>{t("currency")}</Label>
          <Input
            name="currency"
            defaultValue={defaults?.currency || "USD"}
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
        <h2 className="text-xl font-semibold">{t("carRentals")}</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="btn-elegant">
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
