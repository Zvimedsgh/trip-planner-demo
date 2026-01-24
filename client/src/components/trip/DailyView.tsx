import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { Hotel, Plane, Car, MapPin, Utensils, Calendar, FileText, ExternalLink } from "lucide-react";

interface DailyViewProps {
  tripId: number;
  date: number; // Unix timestamp for the day
}

type Activity = {
  id: number;
  type: "hotel-checkin" | "hotel-checkout" | "transportation" | "car-pickup" | "car-return" | "site" | "restaurant";
  time: number;
  icon: any;
  title: string;
  subtitle?: string;
  details: string[];
  price?: { amount: number; currency: string };
  documentUrl?: string;
  website?: string;
};

export default function DailyView({ tripId, date }: DailyViewProps) {
  const { language } = useLanguage();
  
  // Fetch all data for this trip
  const { data: hotels } = trpc.hotels.list.useQuery({ tripId });
  const { data: transportation } = trpc.transportation.list.useQuery({ tripId });
  const { data: carRentals } = trpc.carRentals.list.useQuery({ tripId });
  const { data: sites } = trpc.touristSites.list.useQuery({ tripId });
  const { data: restaurants } = trpc.restaurants.list.useQuery({ tripId });
  const { data: documents } = trpc.documents.list.useQuery({ tripId });

  // Filter activities for this specific day
  const dayStart = new Date(date).setHours(0, 0, 0, 0);
  const dayEnd = new Date(date).setHours(23, 59, 59, 999);

  const isOnDay = (timestamp: number) => timestamp >= dayStart && timestamp <= dayEnd;

  // Collect all activities with their times
  const activities: Activity[] = [];

  // Hotels
  hotels?.forEach(h => {
    if (isOnDay(h.checkInDate)) {
      // Combine date with checkInTime if available
      let checkInTimestamp = h.checkInDate;
      if (h.checkInTime) {
        const [hours, minutes] = h.checkInTime.split(':');
        const checkInDate = new Date(h.checkInDate);
        checkInDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        checkInTimestamp = checkInDate.getTime();
      }
      const relatedDoc = documents?.find(doc => 
        (doc.category === 'booking' || doc.category === 'other') && 
        (doc.name.toLowerCase().includes(h.name.toLowerCase()) || 
         doc.name.toLowerCase().includes('hotel') ||
         (h.address && doc.name.toLowerCase().includes(h.address.toLowerCase())))
      );
      activities.push({
        id: h.id,
        type: "hotel-checkin",
        time: checkInTimestamp,
        icon: Hotel,
        title: h.name,
        subtitle: language === "he" ? "צ'ק-אין" : "Check-in",
        details: [h.address].filter((d): d is string => Boolean(d)),
        price: h.price ? { amount: parseFloat(h.price), currency: h.currency || "EUR" } : undefined,
        documentUrl: relatedDoc?.fileUrl || undefined,
        website: h.website || undefined
      });
    }
    if (isOnDay(h.checkOutDate)) {
      // Combine date with checkOutTime if available
      let checkOutTimestamp = h.checkOutDate;
      if (h.checkOutTime) {
        const [hours, minutes] = h.checkOutTime.split(':');
        const checkOutDate = new Date(h.checkOutDate);
        checkOutDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        checkOutTimestamp = checkOutDate.getTime();
      }
      const relatedDoc = documents?.find(doc => 
        (doc.category === 'booking' || doc.category === 'other') && 
        (doc.name.toLowerCase().includes(h.name.toLowerCase()) || 
         doc.name.toLowerCase().includes('hotel') ||
         (h.address && doc.name.toLowerCase().includes(h.address.toLowerCase())))
      );
      activities.push({
        id: h.id + 10000,
        type: "hotel-checkout",
        time: checkOutTimestamp,
        icon: Hotel,
        title: h.name,
        subtitle: language === "he" ? "צ'ק-אאוט" : "Check-out",
        details: [h.address].filter((d): d is string => Boolean(d)),
        price: undefined,
        documentUrl: relatedDoc?.fileUrl || undefined,
        website: h.website || undefined
      });
    }
  });

  // Transportation
  transportation?.forEach(t => {
    if (isOnDay(t.departureDate)) {
      activities.push({
        id: t.id,
        type: "transportation",
        time: t.departureDate,
        icon: Plane,
        title: t.type,
        subtitle: `${t.origin} → ${t.destination}`,
        details: [
          t.flightNumber || "",
          `${language === "he" ? "המראה:" : "Departure:"} ${format(new Date(t.departureDate), "HH:mm")}`,
          t.arrivalDate ? `${language === "he" ? "נחיתה:" : "Arrival:"} ${format(new Date(t.arrivalDate), "HH:mm")}` : ""
        ].filter(Boolean),
        price: t.price ? { amount: parseFloat(t.price), currency: t.currency || "EUR" } : undefined,
        website: t.website || undefined
      });
    }
  });

  // Car Rentals
  carRentals?.forEach(c => {
    if (isOnDay(c.pickupDate)) {
      // Combine date with pickupTime if available
      let pickupTimestamp = c.pickupDate;
      if (c.pickupTime) {
        const [hours, minutes] = c.pickupTime.split(':');
        const pickupDate = new Date(c.pickupDate);
        pickupDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        pickupTimestamp = pickupDate.getTime();
      }
      activities.push({
        id: c.id,
        type: "car-pickup",
        time: pickupTimestamp,
        icon: Car,
        title: c.company,
        subtitle: language === "he" ? "איסוף רכב" : "Car Pickup",
        details: [c.carModel, c.pickupLocation].filter((d): d is string => Boolean(d)),
        price: c.price ? { amount: parseFloat(c.price), currency: c.currency || "EUR" } : undefined,
        website: c.website || undefined
      });
    }
    if (isOnDay(c.returnDate)) {
      // Combine date with returnTime if available
      let returnTimestamp = c.returnDate;
      if (c.returnTime) {
        const [hours, minutes] = c.returnTime.split(':');
        const returnDate = new Date(c.returnDate);
        returnDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        returnTimestamp = returnDate.getTime();
      }
      activities.push({
        id: c.id + 10000,
        type: "car-return",
        time: returnTimestamp,
        icon: Car,
        title: c.company,
        subtitle: language === "he" ? "החזרת רכב" : "Car Return",
        details: [c.carModel, c.returnLocation].filter((d): d is string => Boolean(d)),
        price: undefined,
        website: c.website || undefined
      });
    }
  });

  // Tourist Sites
  sites?.forEach(s => {
    if (s.plannedVisitDate && isOnDay(s.plannedVisitDate)) {
      // Combine date with plannedVisitTime if available
      let visitTimestamp = s.plannedVisitDate;
      if (s.plannedVisitTime) {
        const [hours, minutes] = s.plannedVisitTime.split(':');
        const visitDate = new Date(s.plannedVisitDate);
        visitDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        visitTimestamp = visitDate.getTime();
      }
      activities.push({
        id: s.id,
        type: "site",
        time: visitTimestamp,
        icon: MapPin,
        title: s.name,
        details: [s.address, s.description, s.openingHours].filter((d): d is string => Boolean(d)),
        price: undefined,
        website: s.website || undefined
      });
    }
  });

  // Restaurants
  restaurants?.forEach(r => {
    if (r.reservationDate && isOnDay(r.reservationDate)) {
      // Combine date with reservationTime if available
      let reservationTimestamp = r.reservationDate;
      if (r.reservationTime) {
        const [hours, minutes] = r.reservationTime.split(':');
        const reservationDate = new Date(r.reservationDate);
        reservationDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        reservationTimestamp = reservationDate.getTime();
      }
      activities.push({
        id: r.id,
        type: "restaurant",
        time: reservationTimestamp,
        icon: Utensils,
        title: r.name,
        subtitle: r.cuisineType || undefined,
        details: [
          r.address,
          r.numberOfDiners ? `${r.numberOfDiners} ${language === "he" ? "סועדים" : "diners"}` : ""
        ].filter(Boolean) as string[],
        price: r.price ? { amount: parseFloat(r.price), currency: r.currency || "EUR" } : undefined,
        website: r.website || undefined
      });
    }
  });

  // Sort activities by time
  activities.sort((a, b) => a.time - b.time);

  if (activities.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>{language === "he" ? "אין פעילויות מתוכננות ליום זה" : "No activities planned for this day"}</p>
      </div>
    );
  }

  // Get pastel background color based on activity type
  const getActivityBgColor = (type: Activity["type"]) => {
    switch (type) {
      case "hotel-checkin":
      case "hotel-checkout":
        return "bg-blue-50";
      case "transportation":
        return "bg-green-50";
      case "car-pickup":
      case "car-return":
        return "bg-yellow-50";
      case "site":
        return "bg-purple-50";
      case "restaurant":
        return "bg-orange-50";
      default:
        return "bg-gray-50";
    }
  };

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const Icon = activity.icon;
        const bgColor = getActivityBgColor(activity.type);
        return (
          <Card key={`${activity.type}-${activity.id}`} className={bgColor}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-primary" />
                  <div>
                    <CardTitle className="text-base">{activity.title}</CardTitle>
                    {activity.subtitle && (
                      <p className="text-sm text-muted-foreground mt-1">{activity.subtitle}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="text-right">
                    <p className="text-sm font-semibold">{format(new Date(activity.time), "HH:mm")}</p>
                    {activity.price && (
                      <p className="text-sm font-semibold text-primary mt-1">
                        {activity.price.amount} {activity.price.currency}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {activity.documentUrl && (
                      <button
                        onClick={() => window.open(activity.documentUrl, '_blank')}
                        className="p-1.5 rounded bg-blue-500/80 hover:bg-blue-600 text-white transition-colors"
                        title={language === "he" ? "פתיחת מסמך" : "Open document"}
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {activity.website && (
                      <button
                        onClick={() => window.open(activity.website, '_blank')}
                        className="p-1.5 rounded bg-green-500/80 hover:bg-green-600 text-white transition-colors"
                        title={language === "he" ? "פתיחת אתר" : "Open website"}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            {activity.details.length > 0 && (
              <CardContent className="pt-0">
                <div className="space-y-1 text-sm text-muted-foreground">
                  {activity.details.map((detail, idx) => (
                    <p key={idx}>{detail}</p>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
