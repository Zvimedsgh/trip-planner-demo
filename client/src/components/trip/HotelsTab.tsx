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
import { Calendar, DollarSign, Edit, FileText, Hotel, Loader2, MapPin, Phone, Plus, Trash2 } from "lucide-react";
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
  const { data: documents } = trpc.documents.list.useQuery({ tripId });

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
          {hotels.map((hotel, index) => {
            // Colorful gradients for hotel cards
            const gradients = [
              "from-amber-500 via-orange-500 to-red-500",
              "from-blue-500 via-indigo-500 to-purple-500",
              "from-emerald-500 via-teal-500 to-cyan-500",
              "from-pink-500 via-rose-500 to-red-500",
              "from-violet-500 via-purple-500 to-fuchsia-500",
              "from-sky-500 via-blue-500 to-indigo-500",
            ];
            const gradient = gradients[index % gradients.length];
            
            // Use coverImage from database if available
            const hotelImage = hotel.coverImage;
            
            return (
            <Card key={hotel.id} className={`overflow-hidden ${!hotelImage ? `bg-gradient-to-br ${gradient}` : ''} text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative group`}>
              {/* Background image if available */}
              {hotelImage && (
                <>
                  <img 
                    src={hotelImage} 
                    alt={hotel.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
                </>
              )}
              <CardContent className="p-4 relative z-10">
                {/* Header with name and actions */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Hotel className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white drop-shadow-md">{hotel.name}</h3>
                      {hotel.address && (
                        <p className="flex items-center gap-1 text-xs text-white/90 drop-shadow">
                          <MapPin className="w-3 h-3" />
                          {hotel.address}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {/* Link to related documents */}
                    {(() => {
                      const relatedDocs = documents?.filter(doc => 
                        doc.category === 'booking' && 
                        (doc.name.toLowerCase().includes(hotel.name.toLowerCase()) || 
                         doc.name.toLowerCase().includes('hotel') ||
                         (hotel.address && doc.name.toLowerCase().includes(hotel.address.toLowerCase())))
                      );
                      if (relatedDocs && relatedDocs.length > 0) {
                        return (
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-white hover:bg-white/20"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              // Open the document file
                              if (relatedDocs[0]?.fileUrl) {
                                window.open(relatedDocs[0].fileUrl, '_blank');
                              }
                            }}
                            title={language === 'he' ? 'פתיחת מסמך' : 'Open document'}
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                        );
                      }
                      return null;
                    })()}
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20" onClick={() => openEdit(hotel)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 text-white hover:bg-white/20"
                      onClick={() => deleteMutation.mutate({ id: hotel.id })}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Dates */}
                <div className="flex items-center gap-2 text-sm text-white/90 mb-3">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {format(new Date(hotel.checkInDate), "MMM d")} - {format(new Date(hotel.checkOutDate), "MMM d")}
                  </span>
                  <span className="bg-white/20 px-2 py-0.5 rounded text-xs">
                    {getNights(hotel.checkInDate, hotel.checkOutDate)} nights
                  </span>
                </div>
                
                {/* Details */}
                <div className="flex flex-wrap gap-2 text-xs">
                  {hotel.confirmationNumber && (
                    <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded">
                      #{hotel.confirmationNumber}
                    </span>
                  )}
                  {hotel.price && (
                    <span className="flex items-center gap-1 bg-white/30 backdrop-blur-sm px-2 py-1 rounded font-medium">
                      {getCurrencySymbol(hotel.currency || "USD")} {hotel.price} {hotel.currency}
                    </span>
                  )}
                  {hotel.phone && (
                    <span className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded">
                      <Phone className="w-3 h-3" />
                      {hotel.phone}
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
