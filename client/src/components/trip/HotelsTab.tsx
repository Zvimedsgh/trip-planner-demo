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
import { Calendar, DollarSign, Edit, Hotel, Loader2, MapPin, Phone, Plus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "ILS", symbol: "₪", name: "Israeli Shekel" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "THB", symbol: "฿", name: "Thai Baht" },
  { code: "TRY", symbol: "₺", name: "Turkish Lira" },
];

interface HotelsTabProps {
  tripId: number;
}

export default function HotelsTab({ tripId }: HotelsTabProps) {
  const { t, language, isRTL } = useLanguage();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const formRef = useRef<HTMLDivElement>(null);

  const utils = trpc.useUtils();
  const { data: hotels, isLoading } = trpc.hotels.list.useQuery({ tripId });

  const createMutation = trpc.hotels.create.useMutation({
    onSuccess: () => {
      utils.hotels.list.invalidate({ tripId });
      utils.budget.get.invalidate({ tripId });
      setIsCreateOpen(false);
      setSelectedCurrency("USD");
      toast.success(language === "he" ? "המלון נוסף בהצלחה" : "Hotel added successfully");
    },
  });

  const updateMutation = trpc.hotels.update.useMutation({
    onSuccess: () => {
      utils.hotels.list.invalidate({ tripId });
      utils.budget.get.invalidate({ tripId });
      setEditingId(null);
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

  const getFormValues = () => {
    if (!formRef.current) return null;
    const getValue = (name: string) => {
      const el = formRef.current?.querySelector(`[name="${name}"]`) as HTMLInputElement | HTMLTextAreaElement | null;
      return el?.value || "";
    };
    return {
      name: getValue("name"),
      address: getValue("address"),
      checkInDate: getValue("checkInDate"),
      checkInTime: getValue("checkInTime"),
      checkOutDate: getValue("checkOutDate"),
      checkOutTime: getValue("checkOutTime"),
      confirmationNumber: getValue("confirmationNumber"),
      phone: getValue("phone"),
      price: getValue("price"),
      notes: getValue("notes"),
    };
  };

  const handleCreate = () => {
    const values = getFormValues();
    if (!values) return;
    
    if (!values.name || !values.checkInDate || !values.checkOutDate) {
      toast.error(language === "he" ? "נא למלא: שם מלון, תאריך צ'ק-אין ותאריך צ'ק-אאוט" : "Please fill: hotel name, check-in and check-out dates");
      return;
    }
    createMutation.mutate({
      tripId,
      name: values.name,
      address: values.address || undefined,
      checkInDate: new Date(values.checkInDate).getTime(),
      checkInTime: values.checkInTime || undefined,
      checkOutDate: new Date(values.checkOutDate).getTime(),
      checkOutTime: values.checkOutTime || undefined,
      confirmationNumber: values.confirmationNumber || undefined,
      phone: values.phone || undefined,
      price: values.price || undefined,
      currency: selectedCurrency,
      notes: values.notes || undefined,
    });
  };

  const handleUpdate = () => {
    const values = getFormValues();
    if (!values || !editingId) return;
    
    if (!values.name || !values.checkInDate || !values.checkOutDate) {
      toast.error(language === "he" ? "נא למלא: שם מלון, תאריך צ'ק-אין ותאריך צ'ק-אאוט" : "Please fill: hotel name, check-in and check-out dates");
      return;
    }
    updateMutation.mutate({
      id: editingId,
      name: values.name,
      address: values.address || undefined,
      checkInDate: new Date(values.checkInDate).getTime(),
      checkInTime: values.checkInTime || undefined,
      checkOutDate: new Date(values.checkOutDate).getTime(),
      checkOutTime: values.checkOutTime || undefined,
      confirmationNumber: values.confirmationNumber || undefined,
      phone: values.phone || undefined,
      price: values.price || undefined,
      currency: selectedCurrency,
      notes: values.notes || undefined,
    });
  };

  const [editDefaults, setEditDefaults] = useState({
    name: "",
    address: "",
    checkInDate: "",
    checkInTime: "",
    checkOutDate: "",
    checkOutTime: "",
    confirmationNumber: "",
    phone: "",
    price: "",
    currency: "USD",
    notes: "",
  });

  const openEdit = (hotel: NonNullable<typeof hotels>[0]) => {
    setEditDefaults({
      name: hotel.name,
      address: hotel.address || "",
      checkInDate: format(new Date(hotel.checkInDate), "yyyy-MM-dd"),
      checkInTime: hotel.checkInTime || "",
      checkOutDate: format(new Date(hotel.checkOutDate), "yyyy-MM-dd"),
      checkOutTime: hotel.checkOutTime || "",
      confirmationNumber: hotel.confirmationNumber || "",
      phone: hotel.phone || "",
      price: hotel.price || "",
      currency: hotel.currency || "USD",
      notes: hotel.notes || "",
    });
    setSelectedCurrency(hotel.currency || "USD");
    setEditingId(hotel.id);
  };

  const getNights = (checkIn: number, checkOut: number) => {
    return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  };

  const getCurrencySymbol = (code: string) => {
    return CURRENCIES.find(c => c.code === code)?.symbol || code;
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
      <div className="grid gap-2">
        <Label>{t("hotelName")} *</Label>
        <Input
          name="name"
          tabIndex={1}
          defaultValue={defaults?.name || ""}
          placeholder={language === "he" ? "מלון הילטון" : "Hilton Hotel"}
        />
      </div>
      <div className="grid gap-2">
        <Label>{t("address")}</Label>
        <Input
          name="address"
          tabIndex={2}
          defaultValue={defaults?.address || ""}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>{t("checkIn")} *</Label>
          <Input
            name="checkInDate"
            tabIndex={3}
            type="date"
            defaultValue={defaults?.checkInDate || ""}
          />
        </div>
        <div className="grid gap-2">
          <Label>{language === "he" ? "שעת צ'ק-אין" : "Check-in Time"}</Label>
          <Input
            name="checkInTime"
            tabIndex={4}
            type="time"
            defaultValue={defaults?.checkInTime || ""}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>{t("checkOut")} *</Label>
          <Input
            name="checkOutDate"
            tabIndex={5}
            type="date"
            defaultValue={defaults?.checkOutDate || ""}
          />
        </div>
        <div className="grid gap-2">
          <Label>{language === "he" ? "שעת צ'ק-אאוט" : "Check-out Time"}</Label>
          <Input
            name="checkOutTime"
            tabIndex={6}
            type="time"
            defaultValue={defaults?.checkOutTime || ""}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>{t("confirmationNumber")}</Label>
          <Input
            name="confirmationNumber"
            tabIndex={7}
            defaultValue={defaults?.confirmationNumber || ""}
          />
        </div>
        <div className="grid gap-2">
          <Label>{language === "he" ? "טלפון" : "Phone"}</Label>
          <Input
            name="phone"
            tabIndex={8}
            type="tel"
            defaultValue={defaults?.phone || ""}
            placeholder={language === "he" ? "+972-XX-XXX-XXXX" : "+1-XXX-XXX-XXXX"}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>{t("price")}</Label>
          <Input
            name="price"
            tabIndex={9}
            type="number"
            defaultValue={defaults?.price || ""}
            placeholder="0.00"
          />
        </div>
        <div className="grid gap-2">
          <Label>{t("currency")}</Label>
          <Select 
            value={selectedCurrency} 
            onValueChange={(value) => {
              setSelectedCurrency(value);
            }}
          >
            <SelectTrigger tabIndex={10}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((currency) => (
                <SelectItem key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-2">
        <Label>{t("notes")}</Label>
        <Textarea
          name="notes"
          tabIndex={11}
          defaultValue={defaults?.notes || ""}
          rows={2}
        />
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">{t("hotels")}</h2>
        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (open) setSelectedCurrency("USD");
        }}>
          <DialogTrigger asChild>
            <Button className="btn-elegant">
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
                      {getCurrencySymbol(hotel.currency || "USD")} {hotel.price} {hotel.currency}
                    </span>
                  )}
                  {hotel.phone && (
                    <span className="flex items-center gap-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded">
                      <Phone className="w-3 h-3" />
                      {hotel.phone}
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
