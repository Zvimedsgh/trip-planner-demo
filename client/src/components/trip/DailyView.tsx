import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { Hotel, Plane, Car, MapPin, Utensils, Calendar, FileText, ExternalLink, Map as MapIcon } from "lucide-react";

interface DailyViewProps {
  tripId: number;
  date: number; // Unix timestamp for the day
  onTabChange?: (tabId: string, activityId?: number) => void; // Callback to switch tabs with optional activity ID
}

type Activity = {
  id: number;
  type: "hotel-checkin" | "hotel-checkout" | "transportation" | "car-pickup" | "car-return" | "site" | "restaurant" | "route";
  time: string; // HH:MM format for sorting
  displayTime: string; // Formatted time for display
  icon: any;
  title: string;
  subtitle?: string;
  details: string[];
  price?: { amount: number; currency: string };
  documentUrls?: Array<{ url: string; name: string }>;
  website?: string;
  routeData?: any; // Store full route data for rendering
};

export default function DailyView({ tripId, date, onTabChange }: DailyViewProps) {
  const { language, t } = useLanguage();
  
  // Translation map for transportation types
  const getTransportTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      flight: t("flight"),
      train: t("train"),
      bus: t("bus"),
      ferry: t("ferry"),
      car_rental: language === 'he' ? 'השכרת רכב' : 'Car Rental',
      other: t("other")
    };
    return labels[type] || type;
  };
  
  // Fetch all data for this trip
  const { data: hotels } = trpc.hotels.list.useQuery({ tripId });
  const { data: transportation } = trpc.transportation.list.useQuery({ tripId });
  const { data: carRentals } = trpc.carRentals.list.useQuery({ tripId });
  const { data: sites } = trpc.touristSites.list.useQuery({ tripId });
  const { data: restaurants } = trpc.restaurants.list.useQuery({ tripId });
  const { data: documents } = trpc.documents.list.useQuery({ tripId });
  const { data: routesData } = trpc.routes.list.useQuery({ tripId });

  // Filter activities for this specific day
  // Compare dates only (using local timezone)
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
      const time = h.checkInTime || "00:00";
      const linkedDoc = h.linkedDocumentId 
        ? documents?.find(doc => doc.id === h.linkedDocumentId)
        : null;
      const relatedDocs = linkedDoc ? [{ url: linkedDoc.fileUrl, name: linkedDoc.name }] : [];
      activities.push({
        id: h.id,
        type: "hotel-checkin",
        time,
        displayTime: time,
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
      const time = h.checkOutTime || "00:00";
      const linkedDoc = h.linkedDocumentId 
        ? documents?.find(doc => doc.id === h.linkedDocumentId)
        : null;
      const relatedDocs = linkedDoc ? [{ url: linkedDoc.fileUrl, name: linkedDoc.name }] : [];
      activities.push({
        id: h.id + 10000,
        type: "hotel-checkout",
        time,
        displayTime: time,
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
  transportation?.forEach(trans => {
    if (isOnDay(trans.departureDate)) {
      const depTime = trans.departureTime || "00:00";
      const arrTime = trans.arrivalTime || "";
      const linkedDoc = trans.linkedDocumentId 
        ? documents?.find(doc => doc.id === trans.linkedDocumentId)
        : null;
      const relatedDocs = linkedDoc ? [{ url: linkedDoc.fileUrl, name: linkedDoc.name }] : [];
      
      activities.push({
        id: trans.id,
        type: "transportation",
        time: depTime,
        displayTime: depTime,
        icon: Plane,
        title: getTransportTypeLabel(trans.type),
        subtitle: `${trans.origin} → ${trans.destination}`,
        details: [
          trans.flightNumber || "",
          `${language === "he" ? "המראה:" : "Departure:"} ${depTime}`,
          arrTime ? `${language === "he" ? "נחיתה:" : "Arrival:"} ${arrTime}` : ""
        ].filter(Boolean),
        price: trans.price ? { amount: parseFloat(trans.price), currency: trans.currency || "EUR" } : undefined,
        documentUrls: relatedDocs.length > 0 ? relatedDocs : undefined,
        website: trans.website || undefined
      });
    }
  });

  // Car Rentals
  carRentals?.forEach(c => {
    if (isOnDay(c.pickupDate)) {
      const time = c.pickupTime || "00:00";
      activities.push({
        id: c.id,
        type: "car-pickup",
        time,
        displayTime: time,
        icon: Car,
        title: c.company,
        subtitle: language === "he" ? "איסוף רכב" : "Car Pickup",
        details: [c.carModel, c.pickupLocation].filter((d): d is string => Boolean(d)),
        price: c.price ? { amount: parseFloat(c.price), currency: c.currency || "EUR" } : undefined,
        website: c.website || undefined
      });
    }
    if (isOnDay(c.returnDate)) {
      const time = c.returnTime || "00:00";
      activities.push({
        id: c.id + 10000,
        type: "car-return",
        time,
        displayTime: time,
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
      const time = s.plannedVisitTime || "00:00";
      const linkedDoc = s.linkedDocumentId 
        ? documents?.find(doc => doc.id === s.linkedDocumentId)
        : null;
      const relatedDocs = linkedDoc ? [{ url: linkedDoc.fileUrl, name: linkedDoc.name }] : [];
      
      activities.push({
        id: s.id,
        type: "site",
        time,
        displayTime: time,
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
      const time = r.reservationTime || "00:00";
      const linkedDoc = r.linkedDocumentId 
        ? documents?.find(doc => doc.id === r.linkedDocumentId)
        : null;
      const relatedDocs = linkedDoc ? [{ url: linkedDoc.fileUrl, name: linkedDoc.name }] : [];
      
      activities.push({
        id: r.id,
        type: "restaurant",
        time,
        displayTime: time,
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

  // Add ALL routes for this day
  const todayRoutes = routesData?.filter(r => isOnDay(r.date)) || [];
  todayRoutes.forEach(todayRoute => {
    const time = todayRoute.time || "23:59"; // Default to end of day if no time
    
    activities.push({
      id: todayRoute.id,
      type: "route",
      time,
      displayTime: time,
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
  });
  
  // Sort activities by time (HH:MM string comparison works perfectly!)
  activities.sort((a, b) => a.time.localeCompare(b.time));

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
        return "bg-purple-50";
      case "site":
        return "bg-yellow-50";
      case "restaurant":
        return "bg-orange-50";
      case "route":
        return "bg-pink-50";
      default:
        return "bg-gray-50";
    }
  };

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <Calendar className="w-16 h-16 mb-4" />
        <p className="text-lg">{language === "he" ? "אין פעילויות מתוכננות ליום זה" : "No activities planned for this day"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const Icon = activity.icon;
        const bgColor = getActivityBgColor(activity.type);
        
        // Special rendering for routes
        if (activity.type === "route" && activity.routeData) {
          return (
            <Card key={`${activity.type}-${activity.id}`} className={`p-4 ${bgColor} border-l-4 border-pink-400`}>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  <Icon className="w-6 h-6 text-pink-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-pink-600">{activity.displayTime}</span>
                    <h3 className="text-lg font-semibold text-gray-900">{activity.title}</h3>
                  </div>
                  {activity.subtitle && (
                    <p className="text-sm text-gray-600 mb-2">{activity.subtitle}</p>
                  )}
                  {activity.details.length > 0 && (
                    <div className="space-y-1">
                      {activity.details.map((detail, idx) => (
                        <p key={idx} className="text-sm text-gray-700">{detail}</p>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => {
                      // Open Google Maps directly (same as RouteManager)
                      const routeName = activity.title;
                      const cleanRouteName = routeName.replace(/^Route \d+:\s*/i, '');
                      const parts = cleanRouteName.split(/→|->/).map((p: string) => p.trim());
                      if (parts.length >= 2) {
                        const origin = encodeURIComponent(parts[0]);
                        const destination = encodeURIComponent(parts[1]);
                        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&region=SK`;
                        console.log('[DailyView] Opening Google Maps Directions:', googleMapsUrl);
                        window.open(googleMapsUrl, "_blank");
                      } else {
                        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanRouteName)}&region=SK`;
                        console.log('[DailyView] Opening Google Maps Search (fallback):', googleMapsUrl);
                        window.open(googleMapsUrl, "_blank");
                      }
                    }}
                    className="mt-2 text-sm text-pink-600 hover:text-pink-700 font-medium flex items-center gap-1"
                  >
                    <MapIcon className="w-4 h-4" />
                    {language === "he" ? "צפה במפה" : "View on map"}
                  </button>
                </div>
              </div>
            </Card>
          );
        }

        // Standard activity rendering
        return (
          <Card key={`${activity.type}-${activity.id}`} className={`p-4 ${bgColor}`}>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <Icon className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-700">{activity.displayTime}</span>
                  <h3 className="text-lg font-semibold text-gray-900">{activity.title}</h3>
                </div>
                {activity.subtitle && (
                  <p className="text-sm text-gray-600 mb-2">{activity.subtitle}</p>
                )}
                {activity.details.length > 0 && (
                  <div className="space-y-1">
                    {activity.details.map((detail, idx) => (
                      <p key={idx} className="text-sm text-gray-700">{detail}</p>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-4 mt-2">
                  {activity.price && (
                    <span className="text-sm font-medium text-gray-900">
                      {activity.price.amount} {activity.price.currency}
                    </span>
                  )}
                  {activity.website && (
                    <a
                      href={activity.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {language === "he" ? "אתר" : "Website"}
                    </a>
                  )}
                  {activity.documentUrls && activity.documentUrls.length > 0 && (
                    <div className="flex items-center gap-2">
                      {activity.documentUrls.map((doc, idx) => (
                        <a
                          key={idx}
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                        >
                          <FileText className="w-4 h-4" />
                          {doc.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
