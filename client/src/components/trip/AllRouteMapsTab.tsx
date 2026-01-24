import { useState } from "react";
import { MapView } from "../Map";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Navigation } from "lucide-react";

type RouteMap = {
  id: string;
  title: { en: string; he: string };
  description: { en: string; he: string };
  gradient: string;
  origin: { lat: number; lng: number; name: string };
  destination: { lat: number; lng: number; name: string };
  waypoints: Array<{ location: { lat: number; lng: number }; stopover: boolean }>;
  pois: Array<{ lat: number; lng: number; name: string; type: string }>;
};

const routeMaps: RouteMap[] = [
  {
    id: "route1",
    title: {
      en: "Route 1: Bratislava → Liptovský Mikuláš",
      he: "מסלול 1: ברטיסלבה → ליפטובסקי מיקולאש"
    },
    description: {
      en: "Scenic drive through central Slovakia",
      he: "נסיעה נופית דרך מרכז סלובקיה"
    },
    gradient: "from-blue-500 via-indigo-500 to-purple-500",
    origin: { lat: 48.1486, lng: 17.1077, name: "Bratislava" },
    destination: { lat: 49.0833, lng: 19.6167, name: "Liptovský Mikuláš" },
    waypoints: [
      { location: { lat: 48.7164, lng: 19.1517 }, stopover: true }, // Banská Bystrica
    ],
    pois: [
      { lat: 48.7164, lng: 19.1517, name: "Banská Bystrica", type: "city" },
      { lat: 48.8, lng: 19.5, name: "Gas Station", type: "gas" },
      { lat: 48.9, lng: 19.4, name: "Restaurant", type: "restaurant" },
    ],
  },
  {
    id: "route2",
    title: {
      en: "Route 2: Liptovský Mikuláš → Košice (via Slovenský Raj)",
      he: "מסלול 2: ליפטובסקי מיקולאש → קושיצה (דרך סלובנסקי ראי')"
    },
    description: {
      en: "Through Slovenský Raj National Park and Spiš Castle",
      he: "דרך פארק סלובנסקי ראי' וטירת שפיש"
    },
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    origin: { lat: 49.0833, lng: 19.6167, name: "Liptovský Mikuláš" },
    destination: { lat: 48.7164, lng: 21.2611, name: "Košice" },
    waypoints: [
      { location: { lat: 48.9333, lng: 20.3833 }, stopover: true }, // Slovenský Raj entrance
      { location: { lat: 48.9972, lng: 20.5597 }, stopover: true }, // Spiš Castle area
    ],
    pois: [
      { lat: 48.9333, lng: 20.3833, name: "Slovenský Raj National Park", type: "attraction" },
      { lat: 48.9167, lng: 20.4, name: "Dobšinská Ice Cave", type: "attraction" },
      { lat: 48.9972, lng: 20.5597, name: "Spiš Castle", type: "attraction" },
      { lat: 49.0, lng: 20.3, name: "Slovak Paradise Gorges", type: "attraction" },
      { lat: 49.1, lng: 20.1, name: "Gas Station", type: "gas" },
      { lat: 48.95, lng: 20.35, name: "Mountain Restaurant", type: "restaurant" },
      { lat: 48.85, lng: 21.0, name: "Restaurant", type: "restaurant" },
    ],
  },
  {
    id: "route3",
    title: {
      en: "Route 3: Košice → Vienna",
      he: "מסלול 3: קושיצה → וינה"
    },
    description: {
      en: "Return journey via Bratislava to Vienna",
      he: "מסע חזרה דרך ברטיסלבה לוינה"
    },
    gradient: "from-amber-500 via-orange-500 to-red-500",
    origin: { lat: 48.7164, lng: 21.2611, name: "Košice" },
    destination: { lat: 48.2082, lng: 16.3738, name: "Vienna" },
    waypoints: [
      { location: { lat: 48.1486, lng: 17.1077 }, stopover: true }, // Bratislava
    ],
    pois: [
      { lat: 48.2082, lng: 16.3738, name: "Schönbrunn Palace", type: "attraction" },
      { lat: 48.2085, lng: 16.3794, name: "Belvedere Palace", type: "attraction" },
      { lat: 48.5, lng: 18.0, name: "Gas Station", type: "gas" },
      { lat: 48.3, lng: 17.5, name: "Restaurant", type: "restaurant" },
    ],
  },
  {
    id: "route4",
    title: {
      en: "Route 4: Liptovský Mikuláš → Štrbské Pleso (Sep 3)",
      he: "מסלול 4: ליפטובסקי מיקולאש → שטרבסקה פלסו (3 בספטמבר)"
    },
    description: {
      en: "Day 3: Round trip to High Tatras mountain lake",
      he: "יום 3: טיול יום לאגם ההרים בטטרה הגבוהה"
    },
    gradient: "from-sky-500 via-blue-500 to-indigo-500",
    origin: { lat: 49.0833, lng: 19.6167, name: "Liptovský Mikuláš" },
    destination: { lat: 49.1194, lng: 20.0611, name: "Štrbské Pleso" },
    waypoints: [
      { location: { lat: 49.1, lng: 19.85 }, stopover: true }, // Scenic viewpoint
    ],
    pois: [
      { lat: 49.1194, lng: 20.0611, name: "Štrbské Pleso Lake", type: "attraction" },
      { lat: 49.15, lng: 20.15, name: "Lomnický štít Cable Car", type: "attraction" },
      { lat: 49.1, lng: 19.9, name: "Gas Station", type: "gas" },
      { lat: 49.12, lng: 20.05, name: "Mountain Restaurant", type: "restaurant" },
    ],
  },
  {
    id: "route5",
    title: {
      en: "Route 5: Liptovský Mikuláš → Jasná – Demänovská Dolina (Sep 4)",
      he: "מסלול 5: ליפטובסקי מיקולאש → יאסנה – דמנובסקה דולינה (4 בספטמבר)"
    },
    description: {
      en: "Day 4: Round trip to ski resort and caves",
      he: "יום 4: טיול יום לאתר סקי ומערות"
    },
    gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
    origin: { lat: 49.0833, lng: 19.6167, name: "Liptovský Mikuláš" },
    destination: { lat: 49.0333, lng: 19.5833, name: "Jasná – Demänovská Dolina" },
    waypoints: [
      { location: { lat: 49.05, lng: 19.6 }, stopover: true }, // Demänovská Cave
    ],
    pois: [
      { lat: 49.0333, lng: 19.5833, name: "Jasná Ski Resort", type: "attraction" },
      { lat: 49.0444, lng: 19.5833, name: "Demänovská Ice Cave", type: "attraction" },
      { lat: 49.0444, lng: 19.5833, name: "Demänovská Cave of Liberty", type: "attraction" },
      { lat: 49.06, lng: 19.6, name: "Gas Station", type: "gas" },
      { lat: 49.04, lng: 19.59, name: "Mountain Restaurant", type: "restaurant" },
    ],
  },
];

export function AllRouteMapsTab() {
  const { language } = useLanguage();
  const [selectedRoute, setSelectedRoute] = useState<RouteMap | null>(null);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">
          {language === "he" ? "מפות מסלול" : "Route Maps"}
        </h2>
        <p className="text-muted-foreground">
          {language === "he" 
            ? "לחץ על כרטיס כדי לצפות במפה המפורטת" 
            : "Click on a card to view the detailed map"}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {routeMaps.map((route) => (
          <Card
            key={route.id}
            className={`overflow-hidden bg-gradient-to-br ${route.gradient} text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group`}
            onClick={() => setSelectedRoute(route)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Navigation className="w-6 h-6 text-white" />
                </div>
              </div>

              <h3 className="font-bold text-lg mb-2 drop-shadow-md">
                {language === "he" ? route.title.he : route.title.en}
              </h3>

              <p className="text-sm text-white/90 mb-4 drop-shadow">
                {language === "he" ? route.description.he : route.description.en}
              </p>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span className="font-medium">{route.origin.name}</span>
                </div>
                <div className="flex items-center gap-2 pl-6">
                  <span>→</span>
                  <span className="font-medium">{route.destination.name}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/20">
                <p className="text-xs text-white/80">
                  {route.pois.length} {language === "he" ? "נקודות עניין" : "points of interest"}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Map Dialog */}
      <Dialog open={!!selectedRoute} onOpenChange={(open) => !open && setSelectedRoute(null)}>
        <DialogContent className="max-w-[95vw] h-[95vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {selectedRoute && (language === "he" ? selectedRoute.title.he : selectedRoute.title.en)}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            {/* Map Container */}
            <div className="flex-1 rounded-lg overflow-hidden border-2 border-border min-h-[500px]">
              {selectedRoute && (
                <MapView
                  onMapReady={(map: any) => {
                    const google = window.google;
                    const directionsService = new google.maps.DirectionsService();
                    const directionsRenderer = new google.maps.DirectionsRenderer({
                      map,
                      suppressMarkers: false,
                    });

                    directionsService.route(
                      {
                        origin: selectedRoute.origin,
                        destination: selectedRoute.destination,
                        waypoints: selectedRoute.waypoints,
                        travelMode: google.maps.TravelMode.DRIVING,
                      },
                      (result: any, status: any) => {
                        if (status === google.maps.DirectionsStatus.OK && result) {
                          directionsRenderer.setDirections(result);
                        }
                      }
                    );

                    // Add POI markers
                    selectedRoute.pois.forEach((poi) => {
                      new google.maps.Marker({
                        position: { lat: poi.lat, lng: poi.lng },
                        map,
                        title: poi.name,
                        icon: {
                          url:
                            poi.type === "gas"
                              ? "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                              : poi.type === "restaurant"
                              ? "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                              : "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                        },
                      });
                    });
                  }}
                />
              )}
            </div>

            {/* POI List */}
            {selectedRoute && selectedRoute.pois.length > 0 && (
              <div className="border-t pt-4 overflow-y-auto max-h-[200px]">
                <h3 className="font-semibold mb-3">
                  {language === "he" ? "נקודות עניין לאורך המסלול" : "Points of Interest Along Route"}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {selectedRoute.pois.map((poi, index) => {
                    const Icon = poi.type === "gas" ? Navigation : poi.type === "restaurant" ? Navigation : MapPin;
                    const colorClass = 
                      poi.type === "gas" ? "text-blue-600" : 
                      poi.type === "restaurant" ? "text-green-600" : 
                      "text-red-600";
                    return (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Icon className={`w-4 h-4 ${colorClass}`} />
                        <span className="truncate">{poi.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
