import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { ArrowRight, Bus, Calendar, Clock, DollarSign, Edit, Loader2, Plane, Plus, Ship, Train, Trash2 } from "lucide-react";
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

type TransportType = "flight" | "train" | "bus" | "ferry" | "other";

export default function TransportationTab({ tripId }: TransportationTabProps) {
  const { t, language, isRTL } = useLanguage();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Form fields as individual state
  const [formType, setFormType] = useState<TransportType>("flight");
  const [formOrigin, setFormOrigin] = useState("");
  const [formDestination, setFormDestination] = useState("");
  const [formDepartureDate, setFormDepartureDate] = useState("");
  const [formDepartureTime, setFormDepartureTime] = useState("");
  const [formArrivalDate, setFormArrivalDate] = useState("");
  const [formArrivalTime, setFormArrivalTime] = useState("");
  const [formConfirmation, setFormConfirmation] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formCurrency, setFormCurrency] = useState("USD");
  const [formNotes, setFormNotes] = useState("");

  const utils = trpc.useUtils();
  const { data: transports, isLoading } = trpc.transportation.list.useQuery({ tripId });

  const resetForm = () => {
    setFormType("flight");
    setFormOrigin("");
    setFormDestination("");
    setFormDepartureDate("");
    setFormDepartureTime("");
    setFormArrivalDate("");
    setFormArrivalTime("");
    setFormConfirmation("");
    setFormPrice("");
    setFormCurrency("USD");
    setFormNotes("");
  };

  const createMutation = trpc.transportation.create.useMutation({
    onSuccess: () => {
      utils.transportation.list.invalidate({ tripId });
      utils.budget.get.invalidate({ tripId });
      setIsCreateOpen(false);
      resetForm();
      toast.success(language === "he" ? "ההסעה נוספה בהצלחה" : "Transportation added successfully");
    },
    onError: (error) => {
      toast.error(language === "he" ? "שגיאה בהוספת הסעה" : "Error adding transportation");
      console.error(error);
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
    onError: (error) => {
      toast.error(language === "he" ? "שגיאה בעדכון הסעה" : "Error updating transportation");
      console.error(error);
    },
  });

  const deleteMutation = trpc.transportation.delete.useMutation({
    onSuccess: () => {
      utils.transportation.list.invalidate({ tripId });
      utils.budget.get.invalidate({ tripId });
      toast.success(language === "he" ? "ההסעה נמחקה בהצלחה" : "Transportation deleted successfully");
    },
  });

  const combineDateAndTime = (date: string, time: string): number | undefined => {
    if (!date) return undefined;
    const dateTimeStr = time ? `${date}T${time}` : `${date}T00:00`;
    return new Date(dateTimeStr).getTime();
  };

  const handleCreate = () => {
    if (!formOrigin.trim() || !formDestination.trim() || !formDepartureDate) {
      toast.error(language === "he" ? "נא למלא: מוצא, יעד ותאריך יציאה" : "Please fill: origin, destination and departure date");
      return;
    }
    
    const departureTimestamp = combineDateAndTime(formDepartureDate, formDepartureTime);
    const arrivalTimestamp = combineDateAndTime(formArrivalDate, formArrivalTime);
    
    createMutation.mutate({
      tripId,
      type: formType,
      origin: formOrigin.trim(),
      destination: formDestination.trim(),
      departureDate: departureTimestamp!,
      arrivalDate: arrivalTimestamp,
      confirmationNumber: formConfirmation.trim() || undefined,
      price: formPrice || undefined,
      currency: formCurrency || undefined,
      notes: formNotes.trim() || undefined,
    });
  };

  const handleUpdate = () => {
    if (!editingId || !formOrigin.trim() || !formDestination.trim() || !formDepartureDate) {
      toast.error(language === "he" ? "נא למלא: מוצא, יעד ותאריך יציאה" : "Please fill: origin, destination and departure date");
      return;
    }
    
    const departureTimestamp = combineDateAndTime(formDepartureDate, formDepartureTime);
    const arrivalTimestamp = combineDateAndTime(formArrivalDate, formArrivalTime);
    
    updateMutation.mutate({
      id: editingId,
      type: formType,
      origin: formOrigin.trim(),
      destination: formDestination.trim(),
      departureDate: departureTimestamp!,
      arrivalDate: arrivalTimestamp,
      confirmationNumber: formConfirmation.trim() || undefined,
      price: formPrice || undefined,
      currency: formCurrency || undefined,
      notes: formNotes.trim() || undefined,
    });
  };

  const openEdit = (transport: NonNullable<typeof transports>[0]) => {
    const depDate = new Date(transport.departureDate);
    const arrDate = transport.arrivalDate ? new Date(transport.arrivalDate) : null;
    
    setFormType(transport.type);
    setFormOrigin(transport.origin);
    setFormDestination(transport.destination);
    setFormDepartureDate(format(depDate, "yyyy-MM-dd"));
    setFormDepartureTime(format(depDate, "HH:mm"));
    setFormArrivalDate(arrDate ? format(arrDate, "yyyy-MM-dd") : "");
    setFormArrivalTime(arrDate ? format(arrDate, "HH:mm") : "");
    setFormConfirmation(transport.confirmationNumber || "");
    setFormPrice(transport.price || "");
    setFormCurrency(transport.currency || "USD");
    setFormNotes(transport.notes || "");
    setEditingId(transport.id);
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
        <h2 className="text-xl font-semibold">{t("transportation")}</h2>
        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="btn-elegant" onClick={resetForm}>
              <Plus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t("newTransportation")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("newTransportation")}</DialogTitle>
              <DialogDescription>
                {language === "he" ? "הוסף פרטי הסעה חדשה" : "Add new transportation details"}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>{t("transportType")} *</Label>
                <Select value={formType} onValueChange={(v) => setFormType(v as TransportType)}>
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
                    value={formOrigin}
                    onChange={(e) => setFormOrigin(e.target.value)}
                    placeholder={language === "he" ? "תל אביב" : "Tel Aviv"}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{t("destination")} *</Label>
                  <Input
                    value={formDestination}
                    onChange={(e) => setFormDestination(e.target.value)}
                    placeholder={language === "he" ? "פריז" : "Paris"}
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {language === "he" ? "תאריך ושעת יציאה" : "Departure Date & Time"} *
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    value={formDepartureDate}
                    onChange={(e) => setFormDepartureDate(e.target.value)}
                  />
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                      type="time"
                      value={formDepartureTime}
                      onChange={(e) => setFormDepartureTime(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {language === "he" ? "תאריך ושעת הגעה" : "Arrival Date & Time"}
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    value={formArrivalDate}
                    onChange={(e) => setFormArrivalDate(e.target.value)}
                  />
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                      type="time"
                      value={formArrivalTime}
                      onChange={(e) => setFormArrivalTime(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label>{t("confirmationNumber")}</Label>
                <Input
                  value={formConfirmation}
                  onChange={(e) => setFormConfirmation(e.target.value)}
                  placeholder={language === "he" ? "מספר אישור" : "Confirmation #"}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>{t("price")}</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{t("currency")}</Label>
                  <Select value={formCurrency} onValueChange={setFormCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="ILS">ILS (₪)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label>{t("notes")}</Label>
                <Textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={2}
                  placeholder={language === "he" ? "הערות נוספות..." : "Additional notes..."}
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

      {/* Edit Dialog */}
      <Dialog open={editingId !== null} onOpenChange={(open) => {
        if (!open) {
          setEditingId(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{language === "he" ? "עריכת הסעה" : "Edit Transportation"}</DialogTitle>
            <DialogDescription>
              {language === "he" ? "ערוך את פרטי ההסעה" : "Edit transportation details"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t("transportType")} *</Label>
              <Select value={formType} onValueChange={(v) => setFormType(v as TransportType)}>
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
                  value={formOrigin}
                  onChange={(e) => setFormOrigin(e.target.value)}
                  placeholder={language === "he" ? "תל אביב" : "Tel Aviv"}
                />
              </div>
              <div className="grid gap-2">
                <Label>{t("destination")} *</Label>
                <Input
                  value={formDestination}
                  onChange={(e) => setFormDestination(e.target.value)}
                  placeholder={language === "he" ? "פריז" : "Paris"}
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {language === "he" ? "תאריך ושעת יציאה" : "Departure Date & Time"} *
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  value={formDepartureDate}
                  onChange={(e) => setFormDepartureDate(e.target.value)}
                />
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="time"
                    value={formDepartureTime}
                    onChange={(e) => setFormDepartureTime(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {language === "he" ? "תאריך ושעת הגעה" : "Arrival Date & Time"}
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  value={formArrivalDate}
                  onChange={(e) => setFormArrivalDate(e.target.value)}
                />
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="time"
                    value={formArrivalTime}
                    onChange={(e) => setFormArrivalTime(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label>{t("confirmationNumber")}</Label>
              <Input
                value={formConfirmation}
                onChange={(e) => setFormConfirmation(e.target.value)}
                placeholder={language === "he" ? "מספר אישור" : "Confirmation #"}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t("price")}</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label>{t("currency")}</Label>
                <Select value={formCurrency} onValueChange={setFormCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="ILS">ILS (₪)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label>{t("notes")}</Label>
              <Textarea
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                rows={2}
                placeholder={language === "he" ? "הערות נוספות..." : "Additional notes..."}
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

      {transports && transports.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {transports.map((transport) => {
            const Icon = transportIcons[transport.type];
            const colorClass = transportColors[transport.type];
            const depDate = new Date(transport.departureDate);
            const arrDate = transport.arrivalDate ? new Date(transport.arrivalDate) : null;
            
            return (
              <Card key={transport.id} className="hover:shadow-lg transition-shadow">
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
                <CardContent className="pt-2">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{format(depDate, "MMM d, yyyy")}</span>
                      <Clock className="w-4 h-4 ml-2" />
                      <span>{format(depDate, "HH:mm")}</span>
                    </div>
                    {arrDate && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="text-xs">{language === "he" ? "הגעה:" : "Arrival:"}</span>
                        <span>{format(arrDate, "MMM d, yyyy HH:mm")}</span>
                      </div>
                    )}
                    {transport.confirmationNumber && (
                      <div className="text-xs text-muted-foreground">
                        #{transport.confirmationNumber}
                      </div>
                    )}
                    {transport.price && (
                      <div className="flex items-center gap-1 font-medium text-primary">
                        <DollarSign className="w-4 h-4" />
                        {transport.price} {transport.currency}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border bg-card p-12 text-center">
          <Plane className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">
            {language === "he" ? "לא נוספו הסעות עדיין" : "No transportation added yet"}
          </p>
        </div>
      )}
    </div>
  );
}
