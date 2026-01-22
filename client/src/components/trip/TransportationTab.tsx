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
import { ArrowRight, Bus, Calendar, Clock, DollarSign, Edit, Loader2, Plane, Plus, RotateCcw, Ship, Train, Trash2 } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";

interface TransportationTabProps {
  tripId: number;
  tripEndDate?: number;
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

export default function TransportationTab({ tripId, tripEndDate }: TransportationTabProps) {
  const { t, language, isRTL } = useLanguage();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Use refs to store form values to avoid re-render issues on mobile
  const formRefs = {
    type: useRef<TransportType>("flight"),
    origin: useRef<string>(""),
    destination: useRef<string>(""),
    departureDate: useRef<string>(""),
    departureTime: useRef<string>(""),
    arrivalDate: useRef<string>(""),
    arrivalTime: useRef<string>(""),
    flightNumber: useRef<string>(""),
    confirmation: useRef<string>(""),
    price: useRef<string>(""),
    currency: useRef<string>("USD"),
    notes: useRef<string>(""),
  };
  
  // State for controlled selects only (they need re-render)
  const [formType, setFormType] = useState<TransportType>("flight");
  const [formCurrency, setFormCurrency] = useState("USD");
  
  // Force re-render trigger
  const [formKey, setFormKey] = useState(0);

  const utils = trpc.useUtils();
  const { data: transports, isLoading } = trpc.transportation.list.useQuery({ tripId });
  const { data: trip } = trpc.trips.get.useQuery({ id: tripId });

  const resetForm = () => {
    formRefs.type.current = "flight";
    formRefs.origin.current = "";
    formRefs.destination.current = "";
    formRefs.departureDate.current = "";
    formRefs.departureTime.current = "";
    formRefs.arrivalDate.current = "";
    formRefs.arrivalTime.current = "";
    formRefs.flightNumber.current = "";
    formRefs.confirmation.current = "";
    formRefs.price.current = "";
    formRefs.currency.current = "USD";
    formRefs.notes.current = "";
    setFormType("flight");
    setFormCurrency("USD");
    setFormKey(k => k + 1);
  };

  // Function to suggest return flight based on last outbound flight
  const suggestReturnFlight = () => {
    // Find the last flight (outbound) to get origin/destination
    const lastFlight = transports?.find(t => t.type === "flight");
    
    if (lastFlight) {
      // Reverse origin and destination
      formRefs.origin.current = lastFlight.destination;
      formRefs.destination.current = lastFlight.origin;
    }
    
    // Set departure date to trip end date
    if (trip?.endDate) {
      formRefs.departureDate.current = format(new Date(trip.endDate), "yyyy-MM-dd");
    }
    
    formRefs.type.current = "flight";
    setFormType("flight");
    setFormKey(k => k + 1);
    setIsCreateOpen(true);
    
    toast.info(
      language === "he" 
        ? "פרטי טיסת החזור הוזנו - ניתן לערוך לפני השמירה" 
        : "Return flight details filled - you can edit before saving"
    );
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

  const getFormValues = () => {
    // Get values directly from DOM inputs to ensure we have the latest values
    const getInputValue = (name: string): string => {
      const input = document.querySelector(`[data-field="${name}"]`) as HTMLInputElement | HTMLTextAreaElement;
      return input?.value || "";
    };
    
    return {
      type: formType,
      origin: getInputValue("origin") || formRefs.origin.current,
      destination: getInputValue("destination") || formRefs.destination.current,
      departureDate: getInputValue("departureDate") || formRefs.departureDate.current,
      departureTime: getInputValue("departureTime") || formRefs.departureTime.current,
      arrivalDate: getInputValue("arrivalDate") || formRefs.arrivalDate.current,
      arrivalTime: getInputValue("arrivalTime") || formRefs.arrivalTime.current,
      flightNumber: getInputValue("flightNumber") || formRefs.flightNumber.current,
      confirmation: getInputValue("confirmation") || formRefs.confirmation.current,
      price: getInputValue("price") || formRefs.price.current,
      currency: formCurrency,
      notes: getInputValue("notes") || formRefs.notes.current,
    };
  };

  const handleCreate = () => {
    const values = getFormValues();
    
    if (!values.origin.trim() || !values.destination.trim() || !values.departureDate) {
      toast.error(language === "he" ? "נא למלא: מוצא, יעד ותאריך יציאה" : "Please fill: origin, destination and departure date");
      return;
    }
    
    const departureTimestamp = combineDateAndTime(values.departureDate, values.departureTime);
    const arrivalTimestamp = combineDateAndTime(values.arrivalDate, values.arrivalTime);
    
    createMutation.mutate({
      tripId,
      type: values.type,
      origin: values.origin.trim(),
      destination: values.destination.trim(),
      departureDate: departureTimestamp!,
      arrivalDate: arrivalTimestamp,
      flightNumber: values.flightNumber.trim() || undefined,
      confirmationNumber: values.confirmation.trim() || undefined,
      price: values.price || undefined,
      currency: values.currency || undefined,
      notes: values.notes.trim() || undefined,
    });
  };

  const handleUpdate = () => {
    const values = getFormValues();
    
    if (!editingId || !values.origin.trim() || !values.destination.trim() || !values.departureDate) {
      toast.error(language === "he" ? "נא למלא: מוצא, יעד ותאריך יציאה" : "Please fill: origin, destination and departure date");
      return;
    }
    
    const departureTimestamp = combineDateAndTime(values.departureDate, values.departureTime);
    const arrivalTimestamp = combineDateAndTime(values.arrivalDate, values.arrivalTime);
    
    updateMutation.mutate({
      id: editingId,
      type: values.type,
      origin: values.origin.trim(),
      destination: values.destination.trim(),
      departureDate: departureTimestamp!,
      arrivalDate: arrivalTimestamp,
      flightNumber: values.flightNumber.trim() || undefined,
      confirmationNumber: values.confirmation.trim() || undefined,
      price: values.price || undefined,
      currency: values.currency || undefined,
      notes: values.notes.trim() || undefined,
    });
  };

  const openEdit = (transport: NonNullable<typeof transports>[0]) => {
    const depDate = new Date(transport.departureDate);
    const arrDate = transport.arrivalDate ? new Date(transport.arrivalDate) : null;
    
    formRefs.type.current = transport.type;
    formRefs.origin.current = transport.origin;
    formRefs.destination.current = transport.destination;
    formRefs.departureDate.current = format(depDate, "yyyy-MM-dd");
    formRefs.departureTime.current = format(depDate, "HH:mm");
    formRefs.arrivalDate.current = arrDate ? format(arrDate, "yyyy-MM-dd") : "";
    formRefs.arrivalTime.current = arrDate ? format(arrDate, "HH:mm") : "";
    formRefs.flightNumber.current = transport.flightNumber || "";
    formRefs.confirmation.current = transport.confirmationNumber || "";
    formRefs.price.current = transport.price || "";
    formRefs.currency.current = transport.currency || "USD";
    formRefs.notes.current = transport.notes || "";
    
    setFormType(transport.type);
    setFormCurrency(transport.currency || "USD");
    setFormKey(k => k + 1);
    setEditingId(transport.id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check if there's an outbound flight to show return flight button
  const hasOutboundFlight = transports?.some(t => t.type === "flight");

  const FormFields = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="grid gap-4 py-4" key={formKey}>
      <div className="grid gap-2">
        <Label>{t("transportType")} *</Label>
        <Select value={formType} onValueChange={(v) => {
          setFormType(v as TransportType);
          formRefs.type.current = v as TransportType;
        }}>
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
            data-field="origin"
            tabIndex={2}
            defaultValue={formRefs.origin.current}
            onChange={(e) => { formRefs.origin.current = e.target.value; }}
          />
        </div>
        <div className="grid gap-2">
          <Label>{t("destination")} *</Label>
          <Input
            data-field="destination"
            tabIndex={3}
            defaultValue={formRefs.destination.current}
            onChange={(e) => { formRefs.destination.current = e.target.value; }}
          />
        </div>
      </div>
      
      {formType === "flight" && (
        <div className="grid gap-2">
          <Label>{language === "he" ? "מספר טיסה" : "Flight Number"}</Label>
          <Input
            data-field="flightNumber"
            tabIndex={4}
            defaultValue={formRefs.flightNumber.current}
            onChange={(e) => { formRefs.flightNumber.current = e.target.value; }}
            placeholder="LY001"
          />
        </div>
      )}
      
      <div className="grid gap-2">
        <Label className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          {language === "he" ? "תאריך ושעת יציאה" : "Departure Date & Time"} *
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="date"
            tabIndex={5}
            data-field="departureDate"
            defaultValue={formRefs.departureDate.current}
            onChange={(e) => { formRefs.departureDate.current = e.target.value; }}
          />
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="time"
              tabIndex={6}
              data-field="departureTime"
              defaultValue={formRefs.departureTime.current}
              onChange={(e) => { formRefs.departureTime.current = e.target.value; }}
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
            tabIndex={7}
            data-field="arrivalDate"
            defaultValue={formRefs.arrivalDate.current}
            onChange={(e) => { formRefs.arrivalDate.current = e.target.value; }}
          />
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="time"
              tabIndex={8}
              data-field="arrivalTime"
              defaultValue={formRefs.arrivalTime.current}
              onChange={(e) => { formRefs.arrivalTime.current = e.target.value; }}
              className="pl-10"
            />
          </div>
        </div>
      </div>
      
      <div className="grid gap-2">
        <Label>{t("confirmationNumber")}</Label>
        <Input
          data-field="confirmation"
          tabIndex={9}
          defaultValue={formRefs.confirmation.current}
          onChange={(e) => { formRefs.confirmation.current = e.target.value; }}
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
            tabIndex={10}
            data-field="price"
            defaultValue={formRefs.price.current}
            onChange={(e) => { formRefs.price.current = e.target.value; }}
            placeholder="0.00"
          />
        </div>
        <div className="grid gap-2">
          <Label>{t("currency")}</Label>
          <Select value={formCurrency} onValueChange={(v) => {
            setFormCurrency(v);
            formRefs.currency.current = v;
          }}>
            <SelectTrigger tabIndex={11}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">$ USD</SelectItem>
              <SelectItem value="EUR">€ EUR</SelectItem>
              <SelectItem value="GBP">£ GBP</SelectItem>
              <SelectItem value="ILS">₪ ILS</SelectItem>
              <SelectItem value="JPY">¥ JPY</SelectItem>
              <SelectItem value="CHF">Fr CHF</SelectItem>
              <SelectItem value="CAD">C$ CAD</SelectItem>
              <SelectItem value="AUD">A$ AUD</SelectItem>
              <SelectItem value="CNY">¥ CNY</SelectItem>
              <SelectItem value="INR">₹ INR</SelectItem>
              <SelectItem value="THB">฿ THB</SelectItem>
              <SelectItem value="TRY">₺ TRY</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid gap-2">
        <Label>{t("notes")}</Label>
        <Textarea
          data-field="notes"
          defaultValue={formRefs.notes.current}
          onChange={(e) => { formRefs.notes.current = e.target.value; }}
          rows={2}
          placeholder={language === "he" ? "הערות נוספות..." : "Additional notes..."}
        />
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="text-xl font-semibold">{t("transportation")}</h2>
        <div className="flex gap-2 flex-wrap">
          {/* Return Flight Button - only show if there's an outbound flight */}
          {hasOutboundFlight && (
            <Button 
              variant="outline"
              onClick={suggestReturnFlight}
              className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
            >
              <RotateCcw className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {language === "he" ? "הוסף טיסת חזור" : "Add Return Flight"}
            </Button>
          )}
          
          <Dialog open={isCreateOpen} onOpenChange={(open) => {
            setIsCreateOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg" onClick={resetForm}>
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
          
          <FormFields isEdit />
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingId(null)}>{t("cancel")}</Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transport List */}
      {transports && transports.length > 0 ? (
        <div className="space-y-4">
          {transports.map((transport) => {
            const Icon = transportIcons[transport.type] || ArrowRight;
            const colorClass = transportColors[transport.type] || transportColors.other;
            const depDate = new Date(transport.departureDate);
            const arrDate = transport.arrivalDate ? new Date(transport.arrivalDate) : null;
            
            return (
              <Card key={transport.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="flex items-stretch">
                    <div className={`w-16 bg-gradient-to-br ${colorClass} flex items-center justify-center`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{t(transport.type)}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            {transport.origin} <ArrowRight className="w-3 h-3" /> {transport.destination}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(transport)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate({ id: transport.id })}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {format(depDate, "MMM d, yyyy")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          {format(depDate, "HH:mm")}
                        </span>
                        {transport.price && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                            {transport.price} {transport.currency}
                          </span>
                        )}
                      </div>
                      {arrDate && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {language === "he" ? "הגעה:" : "Arrival:"} {format(arrDate, "MMM d, yyyy HH:mm")}
                        </p>
                      )}
                      {transport.confirmationNumber && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {t("confirmationNumber")}: {transport.confirmationNumber}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Plane className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              {language === "he" ? "אין הסעות עדיין" : "No transportation added yet"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
