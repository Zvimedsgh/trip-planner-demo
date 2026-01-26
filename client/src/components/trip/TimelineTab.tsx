import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { format, isSameDay } from "date-fns";
import { formatTime24 } from "@/lib/timeFormat";
import { Bus, Calendar, Car, Hotel, Loader2, MapPin, Plane, Ship, Train, Utensils, Map as MapIcon } from "lucide-react";
import { getDayColor } from "@/lib/dayColors";

interface TimelineTabProps {
  tripId: number;
}

interface TimelineEvent {
  id: string;
  type: "site" | "hotel_checkin" | "hotel_checkout" | "transport" | "car_pickup" | "car_return" | "restaurant" | "route";
  date: number;
  time?: string;
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  color: string;
}

const transportIcons: Record<string, React.ElementType> = {
  flight: Plane,
  train: Train,
  bus: Bus,
  ferry: Ship,
  other: Plane,
};

export default function TimelineTab({ tripId }: TimelineTabProps) {
  const { t, language, isRTL } = useLanguage();

  const { data: trip } = trpc.trips.get.useQuery({ id: tripId });
  const { data: sites } = trpc.touristSites.list.useQuery({ tripId });
  const { data: hotels } = trpc.hotels.list.useQuery({ tripId });
  const { data: transports } = trpc.transportation.list.useQuery({ tripId });
  const { data: carRentals } = trpc.carRentals.list.useQuery({ tripId });
  const { data: restaurants } = trpc.restaurants.list.useQuery({ tripId });
  const { data: routesData } = trpc.routes.list.useQuery({ tripId });

  const isLoading = !sites || !hotels || !transports || !carRentals || !restaurants || !routesData;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Build timeline events
  const events: TimelineEvent[] = [];

  // Tourist sites
  sites.forEach((site) => {
    if (site.plannedVisitDate) {
      events.push({
        id: `site-${site.id}`,
        type: "site",
        date: site.plannedVisitDate,
        time: site.plannedVisitTime || undefined,
        title: site.name,
        subtitle: site.address || undefined,
        icon: MapPin,
        color: "from-emerald-500 to-teal-600",
      });
    }
  });

  // Hotels
  hotels.forEach((hotel) => {
    events.push({
      id: `hotel-checkin-${hotel.id}`,
      type: "hotel_checkin",
      date: hotel.checkInDate,
      time: hotel.checkInTime || undefined,
      title: `${t("checkIn")}: ${hotel.name}`,
      subtitle: hotel.address || undefined,
      icon: Hotel,
      color: "from-amber-500 to-orange-600",
    });
    events.push({
      id: `hotel-checkout-${hotel.id}`,
      type: "hotel_checkout",
      date: hotel.checkOutDate,
      time: hotel.checkOutTime || undefined,
      title: `${t("checkOut")}: ${hotel.name}`,
      subtitle: hotel.address || undefined,
      icon: Hotel,
      color: "from-amber-500 to-orange-600",
    });
  });

  // Transportation
  transports.forEach((transport) => {
    events.push({
      id: `transport-${transport.id}`,
      type: "transport",
      date: transport.departureDate,
      title: `${t(transport.type)}: ${transport.origin} → ${transport.destination}`,
      subtitle: transport.confirmationNumber ? `#${transport.confirmationNumber}` : undefined,
      icon: transportIcons[transport.type] || Plane,
      color: "from-blue-500 to-indigo-600",
    });
  });

  // Car rentals
  carRentals.forEach((rental) => {
    events.push({
      id: `car-pickup-${rental.id}`,
      type: "car_pickup",
      date: rental.pickupDate,
      time: rental.pickupTime || undefined,
      title: `${language === "he" ? "איסוף רכב" : "Car Pickup"}: ${rental.company}`,
      subtitle: rental.pickupLocation || undefined,
      icon: Car,
      color: "from-purple-500 to-violet-600",
    });
    events.push({
      id: `car-return-${rental.id}`,
      type: "car_return",
      date: rental.returnDate,
      time: rental.returnTime || undefined,
      title: `${language === "he" ? "החזרת רכב" : "Car Return"}: ${rental.company}`,
      subtitle: rental.returnLocation || undefined,
      icon: Car,
      color: "from-purple-500 to-violet-600",
    });
  });

  // Restaurants
  restaurants.forEach((restaurant) => {
    if (restaurant.reservationDate) {
      events.push({
        id: `restaurant-${restaurant.id}`,
        type: "restaurant",
        date: restaurant.reservationDate,
        time: restaurant.reservationTime || undefined,
        title: restaurant.name,
        subtitle: restaurant.cuisineType || undefined,
        icon: Utensils,
        color: "from-rose-500 to-pink-600",
      });
    }
  });

  // Add routes from database
  routesData.forEach((route) => {
    events.push({
      id: `route-${route.id}`,
      type: "route",
      date: route.date,
      time: route.time || undefined,
      title: language === "he" && route.nameHe ? route.nameHe : route.name,
      subtitle: language === "he" ? "מסלול נסיעה" : "Driving route",
      icon: MapIcon,
      color: "from-cyan-500 to-blue-600",
    });
  });

  // Sort by date and time
  events.sort((a, b) => {
    // Create full timestamps by combining date and time
    const getFullTimestamp = (event: TimelineEvent) => {
      if (!event.time) return event.date;
      
      // Parse time string (HH:MM)
      const [hours, minutes] = event.time.split(':').map(Number);
      
      // Get date at midnight
      const eventDate = new Date(event.date);
      const midnight = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
      
      // Add hours and minutes
      return midnight.getTime() + (hours * 60 * 60 * 1000) + (minutes * 60 * 1000);
    };
    
    const timestampA = getFullTimestamp(a);
    const timestampB = getFullTimestamp(b);
    
    return timestampA - timestampB;
  });

  // Group by date
  const groupedEvents: { date: Date; events: TimelineEvent[] }[] = [];
  events.forEach((event) => {
    const eventDate = new Date(event.date);
    const existingGroup = groupedEvents.find((g) => isSameDay(g.date, eventDate));
    if (existingGroup) {
      existingGroup.events.push(event);
    } else {
      groupedEvents.push({ date: eventDate, events: [event] });
    }
  });

  if (events.length === 0) {
    return (
      <div className="elegant-card p-12 text-center">
        <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">
          {language === "he" ? "אין אירועים בציר הזמן עדיין" : "No events in the timeline yet"}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          {language === "he" 
            ? "הוסף אתרים, מלונות, הסעות ומסעדות עם תאריכים כדי לראות אותם כאן"
            : "Add sites, hotels, transportation, and restaurants with dates to see them here"}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">{t("timelineView")}</h2>
        <span className="text-sm text-muted-foreground">
          {events.length} {language === "he" ? "אירועים" : "events"}
        </span>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className={`absolute ${isRTL ? 'right-6' : 'left-6'} top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-transparent`} />

        <div className="space-y-8">
          {groupedEvents.map((group, groupIndex) => (
            <div key={groupIndex} className="relative">
              {/* Date header */}
              <div className={`flex items-center gap-4 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center z-10">
                  <Calendar className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="elegant-card px-4 py-2">
                  <span className="font-semibold">
                    {format(group.date, "EEEE, MMMM d, yyyy")}
                  </span>
                </div>
              </div>

              {/* Events for this date */}
              <div className={`${isRTL ? 'pr-16' : 'pl-16'} space-y-3`}>
                {group.events.map((event) => {
                  const dayColor = trip ? getDayColor(trip.startDate, event.date) : null;
                  return (
                  <Card key={event.id} className="elegant-card-hover" style={{ backgroundColor: dayColor?.light }}>
                    <CardContent className="p-4">
                      <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${event.color} flex items-center justify-center flex-shrink-0`}>
                          <event.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className={isRTL ? 'text-right' : ''}>
                          <p className="font-medium">{event.title}</p>
                          {event.subtitle && (
                            <p className="text-sm text-muted-foreground">{event.subtitle}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {event.time ? formatTime24(event.time) : format(new Date(event.date), "HH:mm")}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
