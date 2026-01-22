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
import { ArrowRight, Bus, Calendar, DollarSign, Edit, Loader2, Plane, Plus, Ship, Train, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface TransportationTabProps {
  tripId: number;
}

const transportIcons = {
  flight: Plane,
  train: Train,
  bus: Bus,
  ferry: Ship,
  other: ArrowRight,
};

const transportColors = {
  flight: "from-blue-500 to-indigo-600",
  train: "from-green-500 to-emerald-600",
  bus: "from-orange-500 to-amber-600",
  ferry: "from-cyan-500 to-blue-600",
  other: "from-gray-500 to-slate-600",
};

export default function TransportationTab({ tripId }: TransportationTabProps) {
  const { t, language, isRTL } = useLanguage();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    type: "flight" as "flight" | "train" | "bus" | "ferry" | "other",
    origin: "",
    destination: "",
    departureDate: "",
    arrivalDate: "",
    confirmationNumber: "",
    price: "",
    currency: "USD",
    notes: "",
  });

  const utils = trpc.useUtils();
  const { data: transports, isLoading } = trpc.transportation.list.useQuery({ tripId });

  const createMutation = trpc.transportation.create.useMutation({
    onSuccess: () => {
      utils.transportation.list.invalidate({ tripId });
      utils.budget.get.invalidate({ tripId });
      setIsCreateOpen(false);
      resetForm();
      toast.success(language === "he" ? "ההסעה נוספה בהצלחה" : "Transportation added successfully");
    },
  });

  const updateMutation = trpc.transportation.update.useMutation({
    onSuccess: () => {
      utils.transportation.list.invalidate({ tripId });
      utils.budget.get.invalidate({ tripId });
      setEditingId(null);
      resetForm();
      toast.success(language === "he" ? "ההסעה עודכנה בהצלחה" : "Transportation updated successfully");
    },
  });

  const deleteMutation = trpc.transportation.delete.useMutation({
    onSuccess: () => {
      utils.transportation.list.invalidate({ tripId });
      utils.budget.get.invalidate({ tripId });
      toast.success(language === "he" ? "ההסעה נמחקה בהצלחה" : "Transportation deleted successfully");
    },
  });

  const resetForm = () => {
    setFormData({
      type: "flight",
      origin: "",
      destination: "",
      departureDate: "",
      arrivalDate: "",
      confirmationNumber: "",
      price: "",
      currency: "USD",
      notes: "",
    });
  };

  const handleCreate = () => {
    if (!formData.origin || !formData.destination || !formData.departureDate) {
      toast.error(language === "he" ? "נא למלא שדות חובה" : "Please fill required fields");
      return;
    }
    createMutation.mutate({
      tripId,
      type: formData.type,
      origin: formData.origin,
      destination: formData.destination,
      departureDate: new Date(formData.departureDate).getTime(),
      arrivalDate: formData.arrivalDate ? new Date(formData.arrivalDate).getTime() : undefined,
      confirmationNumber: formData.confirmationNumber || undefined,
      price: formData.price || undefined,
      currency: formData.currency || undefined,
      notes: formData.notes || undefined,
    });
  };

  const handleUpdate = () => {
    if (!editingId || !formData.origin || !formData.destination || !formData.departureDate) return;
    updateMutation.mutate({
      id: editingId,
      type: formData.type,
      origin: formData.origin,
      destination: formData.destination,
      departureDate: new Date(formData.departureDate).getTime(),
      arrivalDate: formData.arrivalDate ? new Date(formData.arrivalDate).getTime() : undefined,
      confirmationNumber: formData.confirmationNumber || undefined,
      price: formData.price || undefined,
      currency: formData.currency || undefined,
      notes: formData.notes || undefined,
    });
  };

  const openEdit = (transport: NonNullable<typeof transports>[0]) => {
    setFormData({
      type: transport.type,
      origin: transport.origin,
      destination: transport.destination,
      departureDate: format(new Date(transport.departureDate), "yyyy-MM-dd'T'HH:mm"),
      arrivalDate: transport.arrivalDate ? format(new Date(transport.arrivalDate), "yyyy-MM-dd'T'HH:mm") : "",
      confirmationNumber: transport.confirmationNumber || "",
      price: transport.price || "",
      currency: transport.currency || "USD",
      notes: transport.notes || "",
    });
    setEditingId(transport.id);
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
        <Label>{t("transportType")} *</Label>
        <Select value={formData.type} onValueChange={(v: typeof formData.type) => setFormData({ ...formData, type: v })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="flight">{t("flight")}</SelectItem>
            <SelectItem value="train">{t("train")}</SelectItem>
            <SelectItem value="bus">{t("bus")}</SelectItem>
            <SelectItem value="ferry">{t("ferry")}</SelectItem>
            <SelectItem value="other">{t("other")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>{t("origin")} *</Label>
          <Input
            value={formData.origin}
            onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
            placeholder={language === "he" ? "תל אביב" : "Tel Aviv"}
          />
        </div>
        <div className="grid gap-2">
          <Label>{t("destination")} *</Label>
          <Input
            value={formData.destination}
            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
            placeholder={language === "he" ? "פריז" : "Paris"}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>{t("departureDate")} *</Label>
          <Input
            type="datetime-local"
            value={formData.departureDate}
            onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label>{t("arrivalDate")}</Label>
          <Input
            type="datetime-local"
            value={formData.arrivalDate}
            onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })}
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
        <h2 className="text-xl font-semibold">{t("transportation")}</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="btn-elegant" onClick={resetForm}>
              <Plus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t("newTransportation")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("newTransportation")}</DialogTitle>
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

      {transports && transports.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {transports.map((transport) => {
            const Icon = transportIcons[transport.type];
            const colorClass = transportColors[transport.type];
            return (
              <Card key={transport.id} className="elegant-card-hover">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorClass} flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-medium capitalize">{t(transport.type)}</CardTitle>
                        <CardDescription className="flex items-center gap-1 text-xs">
                          {transport.origin} → {transport.destination}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(transport)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 text-destructive"
                        onClick={() => deleteMutation.mutate({ id: transport.id })}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(transport.departureDate), "MMM d, HH:mm")}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {transport.confirmationNumber && (
                      <span className="bg-muted px-2 py-1 rounded">
                        #{transport.confirmationNumber}
                      </span>
                    )}
                    {transport.price && (
                      <span className="flex items-center gap-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded">
                        <DollarSign className="w-3 h-3" />
                        {transport.price} {transport.currency}
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
          <Plane className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">{t("noTransportation")}</p>
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
