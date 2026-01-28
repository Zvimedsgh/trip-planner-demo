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
      en: "Route 1: Bratislava → Liptovský Mikuláš (Sep 2)",
      he: "מסלול 1: ברטיסלבה → ליפטובסקי מיקולאש (2 בספטמבר)"
    },
    description: {
      en: "Day 2: Departure at 19:00 from Bratislava to Liptovský Mikuláš",
      he: "יום 2: יציאה ב-19:00 מברטיסלבה למיקולאש"
    },
    gradient: "from-blue-500 via-indigo-500 to-purple-500",
    origin: { lat: 48.1486, lng: 17.1077, name: "Bratislava" },
    destination: { lat: 49.0833, lng: 19.6167, name: "Liptovský Mikuláš" },
    waypoints: [
      { location: { lat: 48.3081, lng: 18.0878 }, stopover: true }, // Nitra
      { location: { lat: 48.7164, lng: 19.1517 }, stopover: true }, // Banská Bystrica
    ],
    pois: [
      // Cities & Towns
      { lat: 48.7164, lng: 19.1517, name: "Banská Bystrica", type: "city" },
      { lat: 48.3081, lng: 18.0878, name: "Nitra", type: "city" },
      
      // Castles & Historic Sites
      { lat: 48.8944, lng: 18.0447, name: "Trenčín Castle", type: "attraction" },
      { lat: 49.1833, lng: 18.8667, name: "Strečno Castle", type: "attraction" },
      { lat: 48.4589, lng: 18.8928, name: "Banská Štiavnica (UNESCO Mining Town)", type: "attraction" },
      { lat: 48.4589, lng: 18.8928, name: "Kalvária Banská Štiavnica", type: "attraction" },
      
      // Villages
      { lat: 49.0833, lng: 19.4167, name: "Vlkolínec (UNESCO Village)", type: "attraction" },
      
      // Museums & Culture
      { lat: 48.0833, lng: 17.2167, name: "Danubiana Art Museum", type: "attraction" },
      
      // Gas Stations
      { lat: 48.3, lng: 17.5, name: "OMV Gas Station", type: "gas" },
      { lat: 48.7, lng: 19.1, name: "Shell Gas Station", type: "gas" },
      { lat: 48.9, lng: 19.5, name: "MOL Gas Station", type: "gas" },
      { lat: 48.5, lng: 18.2, name: "Shell Gas Station Nitra", type: "gas" },
      { lat: 48.85, lng: 18.1, name: "OMV Trenčín", type: "gas" },
      
      // Restaurants
      { lat: 48.4, lng: 17.8, name: "Highway Restaurant", type: "restaurant" },
      { lat: 48.7164, lng: 19.1517, name: "Banská Bystrica Restaurant", type: "restaurant" },
      { lat: 48.95, lng: 19.45, name: "Mountain View Restaurant", type: "restaurant" },
      { lat: 48.3081, lng: 18.0878, name: "Nitra Traditional Restaurant", type: "restaurant" },
      { lat: 48.8944, lng: 18.0447, name: "Trenčín Castle Restaurant", type: "restaurant" },
      { lat: 48.4589, lng: 18.8928, name: "Banská Štiavnica Miner's Tavern", type: "restaurant" },
    ],
  },
  {
    id: "route2",
    title: {
      en: "Route 2: Liptovský Mikuláš → Košice (Sep 5)",
      he: "מסלול 2: ליפטובסקי מיקולאש → קושיצה (5 בספטמבר)"
    },
    description: {
      en: "Day 5: Journey to Košice via Slovenský Raj",
      he: "יום 5: מסע לקושיצה דרך סלובנסקי ראי'"
    },
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    origin: { lat: 49.0833, lng: 19.6167, name: "Liptovský Mikuláš" },
    destination: { lat: 48.7164, lng: 21.2611, name: "Košice" },
    waypoints: [
      { location: { lat: 48.9333, lng: 20.3833 }, stopover: true }, // Slovenský Raj entrance
      { location: { lat: 48.9972, lng: 20.5597 }, stopover: true }, // Spiš Castle area
    ],
    pois: [
      // Slovenský Raj National Park
      { lat: 48.9333, lng: 20.3833, name: "Slovenský Raj National Park", type: "attraction" },
      { lat: 48.9167, lng: 20.4, name: "Dobšinská Ice Cave (UNESCO)", type: "attraction" },
      { lat: 48.9333, lng: 20.3833, name: "Tomášovský výhľad Viewpoint", type: "attraction" },
      { lat: 48.9333, lng: 20.3833, name: "Suchá Belá Gorge", type: "attraction" },
      { lat: 48.9333, lng: 20.3833, name: "Prielom Hornádu Gorge", type: "attraction" },
      { lat: 48.9333, lng: 20.3833, name: "Via Ferrata Kyseľ", type: "attraction" },
      { lat: 48.9333, lng: 20.3833, name: "Sovia skala (Owl Rock)", type: "attraction" },
      { lat: 48.9333, lng: 20.3833, name: "Havrania skala (Raven Rock)", type: "attraction" },
      { lat: 48.9333, lng: 20.3833, name: "Kvačianska Valley", type: "attraction" },
      
      // Historic Sites
      { lat: 48.9972, lng: 20.5597, name: "Spiš Castle (UNESCO)", type: "attraction" },
      { lat: 48.9972, lng: 20.5597, name: "Levoča Medieval Town (UNESCO)", type: "attraction" },
      { lat: 49.0, lng: 21.2, name: "Prešov Historic Town", type: "attraction" },
      { lat: 49.3, lng: 21.3, name: "Bardejov (UNESCO Town)", type: "attraction" },
      
      // Gas Stations
      { lat: 49.1, lng: 20.1, name: "Shell Gas Station", type: "gas" },
      { lat: 48.93, lng: 20.5, name: "OMV Gas Station", type: "gas" },
      { lat: 48.8, lng: 20.8, name: "MOL Gas Station", type: "gas" },
      { lat: 49.0, lng: 20.3, name: "Shell Čingov", type: "gas" },
      { lat: 48.95, lng: 20.55, name: "OMV Spiš", type: "gas" },
      
      // Restaurants
      { lat: 48.95, lng: 20.35, name: "Mountain Restaurant", type: "restaurant" },
      { lat: 48.93, lng: 20.4, name: "Slovenský Raj Restaurant", type: "restaurant" },
      { lat: 48.85, lng: 21.0, name: "Highway Restaurant", type: "restaurant" },
      { lat: 48.75, lng: 21.15, name: "Košice Approach Restaurant", type: "restaurant" },
      { lat: 48.9972, lng: 20.5597, name: "Spiš Castle Restaurant", type: "restaurant" },
      { lat: 48.9972, lng: 20.5597, name: "Levoča Traditional Restaurant", type: "restaurant" },
    ],
  },
  {
    id: "route3",
    title: {
      en: "Route 3: Košice → Vienna (Sep 7)",
      he: "מסלול 3: קושיצה → וינה (7 בספטמבר)"
    },
    description: {
      en: "Day 7: Drive to Vienna",
      he: "יום 7: נסיעה לוינה"
    },
    gradient: "from-amber-500 via-orange-500 to-red-500",
    origin: { lat: 48.7164, lng: 21.2611, name: "Košice" },
    destination: { lat: 48.2082, lng: 16.3738, name: "Vienna" },
    waypoints: [
      { location: { lat: 48.1486, lng: 17.1077 }, stopover: true }, // Bratislava
    ],
    pois: [
      // Vienna Attractions
      { lat: 48.2082, lng: 16.3738, name: "Schönbrunn Palace", type: "attraction" },
      { lat: 48.2085, lng: 16.3794, name: "Belvedere Palace", type: "attraction" },
      { lat: 48.2082, lng: 16.3738, name: "St. Stephen's Cathedral", type: "attraction" },
      
      // Bratislava (stopover)
      { lat: 48.1486, lng: 17.1077, name: "Bratislava Castle", type: "attraction" },
      { lat: 48.1486, lng: 17.1077, name: "Bratislava Old Town", type: "attraction" },
      
      // Hungarian Side (optional detour)
      { lat: 47.9, lng: 20.4, name: "Aggtelek Cave (Hungary)", type: "attraction" },
      { lat: 47.9, lng: 20.4, name: "Eger Castle (Hungary)", type: "attraction" },
      
      // Gas Stations
      { lat: 48.5, lng: 18.0, name: "Shell Gas Station", type: "gas" },
      { lat: 48.35, lng: 17.2, name: "OMV Gas Station", type: "gas" },
      { lat: 48.25, lng: 16.8, name: "MOL Gas Station", type: "gas" },
      { lat: 48.6, lng: 20.5, name: "Shell Košice Exit", type: "gas" },
      { lat: 48.15, lng: 17.1, name: "OMV Bratislava", type: "gas" },
      { lat: 48.22, lng: 16.5, name: "Shell Vienna Approach", type: "gas" },
      
      // Restaurants
      { lat: 48.3, lng: 17.5, name: "Highway Restaurant", type: "restaurant" },
      { lat: 48.4, lng: 17.8, name: "Bratislava Approach Restaurant", type: "restaurant" },
      { lat: 48.22, lng: 16.5, name: "Vienna Exit Restaurant", type: "restaurant" },
      { lat: 48.1486, lng: 17.1077, name: "Bratislava Old Town Restaurant", type: "restaurant" },
      { lat: 48.2082, lng: 16.3738, name: "Vienna Traditional Restaurant", type: "restaurant" },
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
      // High Tatras Attractions
      { lat: 49.1194, lng: 20.0611, name: "Štrbé Pleso Lake", type: "attraction" },
      { lat: 49.15, lng: 20.15, name: "Lomnický štít Cable Car", type: "attraction" },
      { lat: 49.12, lng: 20.1, name: "Tatranská Lomnica", type: "attraction" },
      { lat: 49.14, lng: 20.13, name: "Starý Smokovec", type: "attraction" },
      { lat: 49.13, lng: 20.08, name: "Hrebienok Funicular", type: "attraction" },
      { lat: 49.18, lng: 20.08, name: "Gerlachovský štít (View)", type: "attraction" },
      
      // Gas Stations
      { lat: 49.1, lng: 19.9, name: "Shell Gas Station", type: "gas" },
      { lat: 49.08, lng: 19.85, name: "OMV Gas Station", type: "gas" },
      { lat: 49.12, lng: 20.0, name: "MOL Tatras", type: "gas" },
      
      // Restaurants
      { lat: 49.12, lng: 20.05, name: "Štrbé Pleso Restaurant", type: "restaurant" },
      { lat: 49.1194, lng: 20.0611, name: "Lakeside Café", type: "restaurant" },
      { lat: 49.1, lng: 19.95, name: "Mountain View Restaurant", type: "restaurant" },
      { lat: 49.15, lng: 20.15, name: "Tatranská Lomnica Restaurant", type: "restaurant" },
      { lat: 49.14, lng: 20.13, name: "Starý Smokovec Traditional", type: "restaurant" },
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
      // Jasná & Caves
      { lat: 49.0333, lng: 19.5833, name: "Jasná Ski Resort", type: "attraction" },
      { lat: 49.0444, lng: 19.5833, name: "Demänovská Ice Cave", type: "attraction" },
      { lat: 49.0444, lng: 19.5833, name: "Demänovská Cave of Liberty", type: "attraction" },
      { lat: 49.0444, lng: 19.5833, name: "Demänovská Cave System", type: "attraction" },
      { lat: 49.0333, lng: 19.5833, name: "Chopok Peak Cable Car", type: "attraction" },
      { lat: 49.0333, lng: 19.5833, name: "Low Tatras Hiking Trails", type: "attraction" },
      { lat: 49.05, lng: 19.6, name: "Liptovská Mara Lake", type: "attraction" },
      
      // Gas Stations
      { lat: 49.06, lng: 19.6, name: "Shell Gas Station", type: "gas" },
      { lat: 49.075, lng: 19.61, name: "OMV Gas Station", type: "gas" },
      { lat: 49.05, lng: 19.59, name: "MOL Demänovská", type: "gas" },
      
      // Restaurants
      { lat: 49.04, lng: 19.59, name: "Jasná Restaurant", type: "restaurant" },
      { lat: 49.0333, lng: 19.5833, name: "Ski Resort Restaurant", type: "restaurant" },
      { lat: 49.05, lng: 19.6, name: "Cave Entrance Café", type: "restaurant" },
      { lat: 49.0333, lng: 19.5833, name: "Chopok Summit Restaurant", type: "restaurant" },
      { lat: 49.0444, lng: 19.5833, name: "Traditional Slovak Tavern", type: "restaurant" },
    ],
  },
  {
    id: "route6",
    title: {
      en: "Route 6: Vienna → Bratislava Airport (Sep 9)",
      he: "מסלול 6: וינה → שדה התעופה ברטיסלבה (9 בספטמבר)"
    },
    description: {
      en: "Day 9: Departure - Return to Bratislava Airport",
      he: "יום 9: יציאה - חזרה לשדה התעופה"
    },
    gradient: "from-rose-500 via-pink-500 to-purple-500",
    origin: { lat: 48.2082, lng: 16.3738, name: "Vienna" },
    destination: { lat: 48.1702, lng: 17.2127, name: "Bratislava Airport" },
    waypoints: [
      { location: { lat: 48.1486, lng: 17.1077 }, stopover: false }, // Bratislava city
    ],
    pois: [
      { lat: 48.1702, lng: 17.2127, name: "Bratislava Airport (BTS)", type: "attraction" },
      { lat: 48.19, lng: 16.8, name: "Shell Gas Station", type: "gas" },
      { lat: 48.175, lng: 17.05, name: "OMV Gas Station", type: "gas" },
      { lat: 48.165, lng: 17.15, name: "MOL Gas Station (Airport)", type: "gas" },
      { lat: 48.15, lng: 17.0, name: "Highway Restaurant", type: "restaurant" },
      { lat: 48.18, lng: 16.9, name: "Vienna-Bratislava Border Restaurant", type: "restaurant" },
      { lat: 48.17, lng: 17.18, name: "Airport Café", type: "restaurant" },
    ],
  },
];

export function AllRouteMapsTab() {
  const { language } = useLanguage();
  const [selectedRoute, setSelectedRoute] = useState<RouteMap | null>(null);

  return (
    <div className="space-y-6 relative">
      {/* Map background pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: '60px 60px'
      }} />
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
            className="overflow-hidden bg-white/80 backdrop-blur-sm shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group relative border-l-4"
            style={{
              borderLeftColor: route.gradient.includes('blue') ? '#3b82f6' : route.gradient.includes('purple') ? '#a855f7' : '#10b981',
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Cpath d='M0 0h40v40H0z'/%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3Ccircle cx='10' cy='10' r='1'/%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3Ccircle cx='10' cy='30' r='1'/%3E%3Ccircle cx='30' cy='10' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '40px 40px'
            }}
            onClick={() => setSelectedRoute(route)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
                  style={{
                    backgroundColor: route.gradient.includes('blue') ? '#dbeafe' : route.gradient.includes('purple') ? '#f3e8ff' : '#d1fae5'
                  }}
                >
                  <Navigation 
                    className="w-6 h-6"
                    style={{
                      color: route.gradient.includes('blue') ? '#3b82f6' : route.gradient.includes('purple') ? '#a855f7' : '#10b981'
                    }}
                  />
                </div>
              </div>

              <h3 className="font-bold text-lg mb-2 text-gray-900">
                {language === "he" ? route.title.he : route.title.en}
              </h3>

              <p className="text-sm text-gray-600 mb-4">
                {language === "he" ? route.description.he : route.description.en}
              </p>

              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{route.origin.name}</span>
                </div>
                <div className="flex items-center gap-2 pl-6">
                  <span>→</span>
                  <span className="font-medium">{route.destination.name}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
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
                    if (!window.google || !window.google.maps) {
                      console.error('Google Maps not loaded');
                      return;
                    }
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
