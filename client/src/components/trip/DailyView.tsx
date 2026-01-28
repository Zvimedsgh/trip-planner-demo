import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { Hotel, Plane, Car, MapPin, Utensils, Calendar, FileText, ExternalLink, Map as MapIcon } from "lucide-react";

interface DailyViewProps {
  tripId: number;
  date: number; // Unix timestamp for the day
}

type Activity = {
  id: number;
  type: "hotel-checkin" | "hotel-checkout" | "transportation" | "car-pickup" | "car-return" | "site" | "restaurant" | "route";
  time: number;
  icon: any;
  title: string;
  subtitle?: string;
  details: string[];
  price?: { amount: number; currency: string };
  documentUrls?: Array<{ url: string; name: string }>;
  website?: string;
  routeData?: any; // Store full route data for rendering
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
  const { data: routesData } = trpc.routes.list.useQuery({ tripId });

  // Filter activities for this specific day
  // Compare dates only (ignore time) to avoid timezone issues
  const isOnDay = (timestamp: number) => {
    const activityDate = new Date(timestamp);
    const targetDate = new Date(date);
    return (
      activityDate.getFullYear() === targetDate.getFullYear() &&
      activityDate.getMonth() === targetDate.getMonth() &&
      activityDate.getDate() === targetDate.getDate()
    );
  };

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
      // Only use explicitly linked documents
      const linkedDoc = h.linkedDocumentId 
        ? documents?.find(doc => doc.id === h.linkedDocumentId)
        : null;
      const relatedDocs = linkedDoc ? [{ url: linkedDoc.fileUrl, name: linkedDoc.name }] : [];
      activities.push({
        id: h.id,
        type: "hotel-checkin",
        time: checkInTimestamp,
        icon: Hotel,
        title: h.name,
        subtitle: language === "he" ? "צ'ק-אין" : "Check-in",
        details: [h.address].filter((d): d is string => Boolean(d)),
        price: h.price ? { amount: parseFloat(h.price), currency: h.currency || "EUR" } : undefined,
        documentUrls: relatedDocs.length > 0 ? relatedDocs : undefined,
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
      // Only use explicitly linked documents
      const linkedDoc = h.linkedDocumentId 
        ? documents?.find(doc => doc.id === h.linkedDocumentId)
        : null;
      const relatedDocs = linkedDoc ? [{ url: linkedDoc.fileUrl, name: linkedDoc.name }] : [];
      activities.push({
        id: h.id + 10000,
        type: "hotel-checkout",
        time: checkOutTimestamp,
        icon: Hotel,
        title: h.name,
        subtitle: language === "he" ? "צ'ק-אאוט" : "Check-out",
        details: [h.address].filter((d): d is string => Boolean(d)),
        price: undefined,
        documentUrls: relatedDocs.length > 0 ? relatedDocs : undefined,
        website: h.website || undefined
      });
    }
  });

  // Transportation
  transportation?.forEach(t => {
    if (isOnDay(t.departureDate)) {
      // Only use explicitly linked documents
      const linkedDoc = t.linkedDocumentId 
        ? documents?.find(doc => doc.id === t.linkedDocumentId)
        : null;
      const relatedDocs = linkedDoc ? [{ url: linkedDoc.fileUrl, name: linkedDoc.name }] : [];
      
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
        documentUrls: relatedDocs.length > 0 ? relatedDocs : undefined,
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
      // Only use explicitly linked documents
      const linkedDoc = s.linkedDocumentId 
        ? documents?.find(doc => doc.id === s.linkedDocumentId)
        : null;
      const relatedDocs = linkedDoc ? [{ url: linkedDoc.fileUrl, name: linkedDoc.name }] : [];
      
      activities.push({
        id: s.id,
        type: "site",
        time: visitTimestamp,
        icon: MapPin,
        title: s.name,
        details: [s.address, s.description, s.openingHours].filter((d): d is string => Boolean(d)),
        price: undefined,
        documentUrls: relatedDocs.length > 0 ? relatedDocs : undefined,
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
      // Only use explicitly linked documents
      const linkedDoc = r.linkedDocumentId 
        ? documents?.find(doc => doc.id === r.linkedDocumentId)
        : null;
      const relatedDocs = linkedDoc ? [{ url: linkedDoc.fileUrl, name: linkedDoc.name }] : [];
      
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
        documentUrls: relatedDocs.length > 0 ? relatedDocs : undefined,
        website: r.website || undefined
      });
    }
  });

  // Add route to activities if exists for this day
  const todayRoute = routesData?.find(r => isOnDay(r.date));
  if (todayRoute) {
    // Parse route time or default to end of day if no time
    let routeTime = date; // Default to start of day
    if (todayRoute.time) {
      const [hours, minutes] = todayRoute.time.split(':').map(Number);
      const routeDate = new Date(date);
      routeDate.setHours(hours, minutes, 0, 0);
      routeTime = routeDate.getTime();
    } else {
      // No time specified - put at end of day
      const routeDate = new Date(date);
      routeDate.setHours(23, 59, 0, 0);
      routeTime = routeDate.getTime();
    }
    
    activities.push({
      id: todayRoute.id,
      type: "route",
      time: routeTime,
      icon: MapIcon,
      title: (() => {
        const routeName = language === "he" && todayRoute.nameHe ? todayRoute.nameHe : todayRoute.name;
        // Remove "Route X: " or "מסלול X: " prefix for cleaner display
        return routeName.replace(/^(Route|מסלול) \d+:\s*/i, '');
      })(),
      subtitle: todayRoute.description || undefined,
      details: [
        todayRoute.distanceKm ? `${todayRoute.distanceKm} km` : "",
        todayRoute.estimatedDuration ? `${Math.floor(Number(todayRoute.estimatedDuration) / 60)}h ${Number(todayRoute.estimatedDuration) % 60}m` : ""
      ].filter(Boolean) as string[],
      routeData: todayRoute // Store for custom rendering
    });
  }
  
  // Sort activities by time
  activities.sort((a, b) => a.time - b.time);

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
      case "route":
        return "bg-cyan-50";
      default:
        return "bg-gray-50";
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Empty state if no activities */}
      {activities.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>{language === "he" ? "אין פעילויות מתוכננות ליום זה" : "No activities planned for this day"}</p>
        </div>
      )}

      {activities.map((activity) => {
        const Icon = activity.icon;
        const bgColor = getActivityBgColor(activity.type);
        
        // Special rendering for routes with gradient background
        if (activity.type === "route" && activity.routeData) {
          const routeGradients = [
            "from-blue-500 via-indigo-500 to-purple-500",
            "from-sky-500 via-blue-500 to-indigo-500",
            "from-violet-500 via-purple-500 to-fuchsia-500",
            "from-emerald-500 via-teal-500 to-cyan-500",
            "from-amber-500 via-orange-500 to-red-500",
            "from-rose-500 via-pink-500 to-purple-500",
          ];
          const routeGradient = routeGradients[activity.id % routeGradients.length];
          
          return (
            <Card key={`${activity.type}-${activity.id}`} className={`overflow-hidden bg-gradient-to-br ${routeGradient} text-white shadow-lg border-0`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base font-bold drop-shadow-md">{activity.title}</CardTitle>
                      {activity.subtitle && (
                        <p className="text-sm text-white/90 mt-1 drop-shadow">{activity.subtitle}</p>
                      )}
                      {activity.details.length > 0 && (
                        <p className="text-xs text-white/80 mt-2">{activity.details.join(" • ")}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-semibold drop-shadow">{format(new Date(activity.time), "HH:mm")}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <button
                  onClick={() => {
                    // Parse origin and destination from route name (format: "Origin → Destination")
                    const parts = activity.title.split(/→|->/).map(p => p.trim());
                    if (parts.length >= 2) {
                      // Use Google Maps Directions API
                      const origin = encodeURIComponent(parts[0]);
                      const destination = encodeURIComponent(parts[1]);
                      // Add region=SK to force Slovakia context and show local POIs
                      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&region=SK`;
                      window.open(googleMapsUrl, "_blank");
                    } else {
                      // Fallback to search if format doesn't match
                      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.title)}&region=SK`;
                      window.open(googleMapsUrl, "_blank");
                    }
                  }}
                  className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  {language === "he" ? "פתח במפה" : "Open in Map"}
                </button>
              </CardContent>
            </Card>
          );
        }
        
        // Regular activity rendering
        return (
          <Card key={`${activity.type}-${activity.id}`} className={`${bgColor}`} style={{ padding: '12px', gap: '0' }}>
            <CardHeader className="p-0" style={{ padding: '0', gap: '0' }}>
              <div className="flex items-start justify-between gap-3">
                {/* Left: Icon + Title */}
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <Icon className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm font-semibold leading-tight">{activity.title}</CardTitle>
                    {activity.subtitle && (
                      <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{activity.subtitle}</p>
                    )}
                  </div>
                </div>
                
                {/* Right: Time + Action Buttons */}
                <div className="flex items-start gap-2 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-semibold">{format(new Date(activity.time), "HH:mm")}</p>
                  </div>
                  <div className="flex gap-1">
                    {activity.documentUrls?.map((doc, idx) => (
                      <button
                        key={idx}
                        onClick={() => window.open(doc.url, '_blank')}
                        className="p-1 rounded bg-blue-500/80 hover:bg-blue-600 text-white transition-colors"
                        title={doc.name}
                      >
                        <FileText className="w-3 h-3" />
                      </button>
                    ))}
                    {activity.website && (
                      <button
                        onClick={() => window.open(activity.website, '_blank')}
                        className="p-1 rounded bg-green-500/80 hover:bg-green-600 text-white transition-colors"
                        title={language === "he" ? "פתיחת אתר" : "Open website"}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Center: Details (moved from CardContent) */}
              {activity.details.length > 0 && (
                <div className="mt-2 pt-2 border-t border-border/50">
                  <div className="space-y-0.5 text-xs text-muted-foreground">
                    {activity.details.map((detail, idx) => (
                      <p key={idx} className="leading-tight">{detail}</p>
                    ))}
                  </div>
                </div>
              )}
            </CardHeader>
          </Card>
        );
      })}
    </div>
  );
}
