import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { MapView } from "../Map";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Navigation, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";

interface AllRouteMapsTabProps {
  tripId: number;
}

export function AllRouteMapsTab({ tripId }: AllRouteMapsTabProps) {
  const { language } = useLanguage();
  const [selectedRoute, setSelectedRoute] = useState<any | null>(null);
  
  const { data: routes, refetch } = trpc.routes.list.useQuery({ tripId });
  
  // Force refetch when tripId changes to prevent cache collision
  useEffect(() => {
    refetch();
  }, [tripId, refetch]);
  
  // If no routes exist, show empty state
  if (!routes || routes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
            <Navigation className="w-12 h-12 text-blue-600" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-800">
            {language === "he" ? "אין מסלולים עדיין" : "No Routes Yet"}
          </h3>
          <p className="text-gray-600">
            {language === "he" 
              ? "עבור לטאב 'Route Manager' כדי להוסיף מסלולי נסיעה לטיול שלך"
              : "Go to 'Route Manager' tab to add driving routes to your trip"}
          </p>
        </div>
      </div>
    );
  }

  const gradients = [
    "from-blue-500 via-indigo-500 to-purple-500",
    "from-emerald-500 via-teal-500 to-cyan-500",
    "from-amber-500 via-orange-500 to-red-500",
    "from-pink-500 via-rose-500 to-red-500",
    "from-violet-500 via-purple-500 to-fuchsia-500",
    "from-green-500 via-emerald-500 to-teal-500",
  ];

  return (
    <div className="space-y-6 relative">
      {/* Map background pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: '60px 60px'
      }} />

      {/* Header */}
      <div className="relative z-10">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {language === "he" ? "מפות מסלולים" : "Route Maps"}
        </h2>
        <p className="text-gray-600 mt-2">
          {language === "he" 
            ? "לחץ על כרטיס כדי לראות את המפה המלאה עם נקודות עניין"
            : "Click on a card to view the full map with points of interest"}
        </p>
      </div>

      {/* Route Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {routes.map((route, index) => {
          const gradient = gradients[index % gradients.length];
          const displayName = language === "he" && route.nameHe ? route.nameHe : route.name;
          const displayDescription = language === "he" && route.descriptionHe ? route.descriptionHe : route.description;
          
          return (
            <Card
              key={route.id}
              className="cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden group"
              onClick={() => setSelectedRoute(route)}
            >
              <div className={`h-32 bg-gradient-to-br ${gradient} flex items-center justify-center relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all duration-300" />
                <Navigation className="w-16 h-16 text-white drop-shadow-lg transform group-hover:rotate-45 transition-transform duration-300" />
              </div>
              <CardContent className="p-4 space-y-3">
                <h3 className="font-bold text-lg text-gray-800 line-clamp-2 min-h-[3.5rem]">
                  {displayName}
                </h3>
                
                {displayDescription && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {displayDescription}
                  </p>
                )}
                
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(route.date), "MMM d, yyyy")}</span>
                </div>
                
                {route.time && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{route.time}</span>
                  </div>
                )}
                
                {route.distanceKm && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {route.distanceKm} km
                      {route.estimatedDuration && ` • ${Math.floor(route.estimatedDuration / 60)}h ${route.estimatedDuration % 60}m`}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Map Dialog */}
      <Dialog open={!!selectedRoute} onOpenChange={(open) => !open && setSelectedRoute(null)}>
        <DialogContent className="max-w-[95vw] w-[95vw] h-[95vh] p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {selectedRoute && (language === "he" && selectedRoute.nameHe ? selectedRoute.nameHe : selectedRoute?.name)}
            </DialogTitle>
          </DialogHeader>
          
          {selectedRoute && (
            <div className="flex flex-col h-full gap-4">
              {/* Map Container */}
              <div className="flex-1 rounded-lg overflow-hidden border-2 border-gray-200">
                <MapView
                  onMapReady={(map: any) => {
                    const google = (window as any).google;
                    // Parse mapData if it exists
                    let mapConfig = null;
                    if (selectedRoute.mapData) {
                      try {
                        mapConfig = JSON.parse(selectedRoute.mapData);
                      } catch (e) {
                        console.error("Failed to parse mapData:", e);
                      }
                    }
                    
                    // If we have map configuration with origin/destination, show directions
                    if (mapConfig?.origin && mapConfig?.destination) {
                      const directionsService = new google.maps.DirectionsService();
                      const directionsRenderer = new google.maps.DirectionsRenderer({
                        map: map,
                        suppressMarkers: false,
                      });
                      
                      const request: google.maps.DirectionsRequest = {
                        origin: mapConfig.origin,
                        destination: mapConfig.destination,
                        waypoints: mapConfig.waypoints || [],
                        travelMode: google.maps.TravelMode.DRIVING,
                      };
                      
                      directionsService.route(request, (result: any, status: any) => {
                        if (status === google.maps.DirectionsStatus.OK && result) {
                          directionsRenderer.setDirections(result);
                        }
                      });
                      
                      // Add POI markers if they exist
                      if (mapConfig.pois && Array.isArray(mapConfig.pois)) {
                        mapConfig.pois.forEach((poi: any) => {
                          const markerColor = 
                            poi.type === "gas" ? "#3B82F6" : // blue
                            poi.type === "attraction" ? "#EF4444" : // red
                            poi.type === "restaurant" ? "#10B981" : // green
                            "#6B7280"; // gray
                          
                          new google.maps.Marker({
                            position: { lat: poi.lat, lng: poi.lng },
                            map: map,
                            title: poi.name,
                            icon: {
                              path: google.maps.SymbolPath.CIRCLE,
                              scale: 8,
                              fillColor: markerColor,
                              fillOpacity: 0.9,
                              strokeColor: "#FFFFFF",
                              strokeWeight: 2,
                            },
                          });
                        });
                      }
                    } else {
                      // No map data - show a simple message
                      const infoWindow = new google.maps.InfoWindow({
                        content: `<div style="padding: 10px;">
                          <h3 style="font-weight: bold; margin-bottom: 5px;">${selectedRoute.name}</h3>
                          <p style="color: #666;">${language === "he" ? "אין נתוני מפה זמינים למסלול זה" : "No map data available for this route"}</p>
                        </div>`,
                        position: map.getCenter(),
                      });
                      infoWindow.open(map);
                    }
                  }}
                />
              </div>
              
              {/* Route Info */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                {selectedRoute.description && (
                  <p className="text-gray-700">
                    {language === "he" && selectedRoute.descriptionHe ? selectedRoute.descriptionHe : selectedRoute.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(selectedRoute.date), "EEEE, MMMM d, yyyy")}</span>
                  </div>
                  {selectedRoute.time && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{selectedRoute.time}</span>
                    </div>
                  )}
                  {selectedRoute.distanceKm && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {selectedRoute.distanceKm} km
                        {selectedRoute.estimatedDuration && ` • ${Math.floor(selectedRoute.estimatedDuration / 60)}h ${selectedRoute.estimatedDuration % 60}m`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
