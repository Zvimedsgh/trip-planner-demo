import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { MapView } from "../Map";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Calendar, Clock, Navigation, Fuel, Utensils, Landmark, Banknote, Star } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface AllRouteMapsTabProps {
  tripId: number;
}

export function AllRouteMapsTab({ tripId }: AllRouteMapsTabProps) {
  const { language } = useLanguage();
  const [selectedRoute, setSelectedRoute] = useState<any | null>(null);
  const [generatingRoute, setGeneratingRoute] = useState(false);
  const [pois, setPois] = useState<any[]>([]);
  
  const { data: routes, refetch } = trpc.routes.list.useQuery({ tripId });
  const generateRouteMutation = trpc.routes.generateRouteFromName.useMutation();
  const savePOIMutation = trpc.mustVisitPOIs.create.useMutation({
    onSuccess: () => {
      toast.success(language === "he" ? "נשמר ל-Must Visit" : "Saved to Must Visit");
    },
    onError: () => {
      toast.error(language === "he" ? "שגיאה בשמירה" : "Error saving");
    },
  });
  
  const handleSavePOI = (poi: any) => {
    const categoryMap: Record<string, { icon: string; color: string }> = {
      "Gas Stations": { icon: "⛽", color: "#ef4444" },
      "Restaurants": { icon: "🍽️", color: "#22c55e" },
      "Tourist Attractions": { icon: "🏛️", color: "#a855f7" },
      "ATMs": { icon: "🏧", color: "#f97316" },
    };
    
    const categoryInfo = categoryMap[poi.category] || { icon: "📍", color: "#6b7280" };
    
    savePOIMutation.mutate({
      tripId,
      name: poi.name,
      address: poi.vicinity || "",
      category: poi.category,
      categoryIcon: categoryInfo.icon,
      categoryColor: categoryInfo.color,
      rating: poi.rating,
      latitude: poi.geometry.location.lat(),
      longitude: poi.geometry.location.lng(),
      placeId: poi.place_id,
    });
  };
  
  // Force refetch when tripId changes to prevent cache collision
  useEffect(() => {
    refetch();
  }, [tripId, refetch]);
  
  // Handle route card click - open Google Maps directly
  const handleRouteClick = async (route: any) => {
    // Generate Google Maps URL
    const getGoogleMapsUrl = () => {
      // Parse mapData to get origin and destination
      if (route.mapData) {
        try {
          const mapConfig = JSON.parse(route.mapData);
          // Route with origin/destination - use directions
          if (mapConfig?.origin && mapConfig?.destination) {
            const origin = `${mapConfig.origin.location.lat},${mapConfig.origin.location.lng}`;
            const destination = `${mapConfig.destination.location.lat},${mapConfig.destination.location.lng}`;
            return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
          }
          // Single location - use search
          if (mapConfig?.location?.coordinates) {
            const coords = mapConfig.location.coordinates;
            return `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`;
          }
        } catch (e) {
          console.error("Failed to parse mapData:", e);
        }
      }
      // Fallback: search by route name
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(route.name)}`;
    };
    
    // Open Google Maps using programmatic link click (works better in PWA)
    const url = getGoogleMapsUrl();
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // If no routes exist, show empty state
  if (!routes || routes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
            <MapPin className="w-12 h-12 text-blue-600" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-800">
            {language === "he" ? "אין מיקומים עדיין" : "No Locations Yet"}
          </h3>
          <p className="text-gray-600">
            {language === "he" 
              ? "עבור לטאב 'Route Manager' כדי להוסיף מיקומים ופעילויות לטיול שלך"
              : "Go to 'Route Manager' tab to add locations and activities to your trip"}
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
          {language === "he" ? "מפות מיקומים" : "Location Maps"}
        </h2>
        <p className="text-gray-600 mt-2">
          {language === "he" 
            ? "לחץ על כרטיס כדי לראות את המפה של המיקום"
            : "Click on a card to view the location on the map"}
        </p>
      </div>

      {/* Loading overlay */}
      {generatingRoute && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 text-center space-y-4 max-w-sm">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-800 font-semibold text-lg">
              {language === "he" ? "מחפש מיקום..." : "Finding location..."}
            </p>
            <p className="text-gray-600 text-sm">
              {language === "he" 
                ? "מאתר את המיקום עם Google Maps"
                : "Locating with Google Maps"}
            </p>
          </div>
        </div>
      )}

      {/* Location Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {routes.map((route, index) => {
          const gradient = gradients[index % gradients.length];
          const displayName = language === "he" && route.nameHe ? route.nameHe : route.name;
          const displayDescription = language === "he" && route.descriptionHe ? route.descriptionHe : route.description;
          
          return (
            <Card
              key={route.id}
              className="cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden group"
              onClick={() => handleRouteClick(route)}
            >
              <div className={`h-32 bg-gradient-to-br ${gradient} flex items-center justify-center relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all duration-300" />
                <MapPin className="w-16 h-16 text-white drop-shadow-lg transform group-hover:scale-110 transition-transform duration-300" />
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
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Map Dialog */}
      <Dialog open={!!selectedRoute} onOpenChange={(open) => !open && setSelectedRoute(null)}>
        <DialogContent className="max-w-[95vw] w-[95vw] h-[95vh] p-6 overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {selectedRoute && (language === "he" && selectedRoute.nameHe ? selectedRoute.nameHe : selectedRoute?.name)}
            </DialogTitle>
          </DialogHeader>
          
          {selectedRoute && (
            <div className="flex flex-col gap-4 overflow-y-auto" style={{ maxHeight: 'calc(95vh - 120px)' }}>
              {/* Map Container with Distance/Time Overlay */}
              <div className="rounded-lg overflow-hidden border-2 border-gray-200 relative h-[60vh] flex-shrink-0">
                <MapView
                  className="h-full"
                  initialCenter={(() => {
                    // Parse mapData to get coordinates
                    if (selectedRoute.mapData) {
                      try {
                        const mapConfig = JSON.parse(selectedRoute.mapData);
                        // Route with origin/destination
                        if (mapConfig?.origin?.location) {
                          return mapConfig.origin.location;
                        }
                        // Single location
                        if (mapConfig?.location?.coordinates) {
                          return mapConfig.location.coordinates;
                        }
                      } catch (e) {
                        console.error("Failed to parse mapData:", e);
                      }
                    }
                    // Default to Slovakia center if no mapData
                    return { lat: 48.6690, lng: 19.6990 };
                  })()}
                  initialZoom={(() => {
                    // Parse mapData to determine zoom level
                    if (selectedRoute.mapData) {
                      try {
                        const mapConfig = JSON.parse(selectedRoute.mapData);
                        // Route (with origin/destination) needs wider view
                        if (mapConfig?.origin && mapConfig?.destination) {
                          return 8;
                        }
                      } catch (e) {
                        // Ignore parse errors
                      }
                    }
                    // Single location or default
                    return 13;
                  })()}
                  onMapReady={(map: any) => {
                    // Function to search for POIs along the route
                    const searchPOIsAlongRoute = async (map: any, routePath: any[], origin: any, destination: any) => {
                      const google = (window as any).google;
                      const service = new google.maps.places.PlacesService(map);
                      
                      // Calculate midpoint of route for search center
                      const midIndex = Math.floor(routePath.length / 2);
                      const midPoint = routePath[midIndex];
                      
                      // POI types to search for
                      const poiTypes = [
                        { type: 'gas_station', icon: '⛽', color: '#EF4444', name: language === 'he' ? 'תחנות דלק' : 'Gas Stations' },
                        { type: 'restaurant', icon: '🍽️', color: '#10B981', name: language === 'he' ? 'מסעדות' : 'Restaurants' },
                        { type: 'tourist_attraction', icon: '🏛️', color: '#8B5CF6', name: language === 'he' ? 'אתרי תיירות' : 'Tourist Sites' },
                        { type: 'atm', icon: '🏧', color: '#F59E0B', name: language === 'he' ? 'כספומטים' : 'ATMs' }
                      ];
                      
                      const allPOIs: any[] = [];
                      
                      // Search for each POI type
                      for (const poiType of poiTypes) {
                        await new Promise<void>((resolve) => {
                          service.nearbySearch(
                            {
                              location: midPoint,
                              radius: 10000, // 10km radius
                              type: poiType.type
                            },
                            (results: any[], status: any) => {
                              if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                                // Get top 5 closest to route
                                const top5 = results.slice(0, 5);
                                
                                top5.forEach((place: any) => {
                                  // Create custom marker with colored pin
                                  const pinElement = document.createElement('div');
                                  pinElement.innerHTML = poiType.icon;
                                  pinElement.style.fontSize = '24px';
                                  pinElement.style.background = poiType.color;
                                  pinElement.style.borderRadius = '50%';
                                  pinElement.style.width = '40px';
                                  pinElement.style.height = '40px';
                                  pinElement.style.display = 'flex';
                                  pinElement.style.alignItems = 'center';
                                  pinElement.style.justifyContent = 'center';
                                  pinElement.style.border = '2px solid white';
                                  pinElement.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
                                  
                                  const marker = new google.maps.marker.AdvancedMarkerElement({
                                    map: map,
                                    position: place.geometry.location,
                                    content: pinElement,
                                    title: place.name
                                  });
                                  
                                  // Add click listener to show info window
                                  const infoWindow = new google.maps.InfoWindow({
                                    content: `
                                      <div style="padding: 8px; max-width: 200px;">
                                        <h3 style="font-weight: bold; margin-bottom: 4px;">${place.name}</h3>
                                        <p style="font-size: 12px; color: #666; margin-bottom: 4px;">${place.vicinity || ''}</p>
                                        ${place.rating ? `<p style="font-size: 12px;">⭐ ${place.rating}</p>` : ''}
                                        <a href="https://www.google.com/maps/search/?api=1&query=${place.geometry.location.lat()},${place.geometry.location.lng()}&query_place_id=${place.place_id}" target="_blank" style="color: #4285F4; text-decoration: none; font-size: 12px;">${language === 'he' ? 'פתח ב-Google Maps' : 'Open in Google Maps'}</a>
                                      </div>
                                    `
                                  });
                                  
                                  marker.addListener('click', () => {
                                    infoWindow.open(map, marker);
                                  });
                                  
                                  // Add to POI list
                                  allPOIs.push({
                                    ...place,
                                    category: poiType.name,
                                    categoryIcon: poiType.icon,
                                    categoryColor: poiType.color
                                  });
                                });
                              }
                              resolve();
                            }
                          );
                        });
                      }
                      
                      // Update POI state
                      setPois(allPOIs);
                    };
                    
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
                    
                    // Check if this is a route (with origin, destination, polyline)
                    if (mapConfig?.origin && mapConfig?.destination && mapConfig?.polyline) {
                      // This is a driving route - decode polyline and display as blue line
                      const decodedPath = google.maps.geometry.encoding.decodePath(mapConfig.polyline);
                      
                      // Draw the route polyline
                      const routeLine = new google.maps.Polyline({
                        path: decodedPath,
                        geodesic: true,
                        strokeColor: '#4285F4',
                        strokeOpacity: 0.8,
                        strokeWeight: 5,
                        map: map,
                      });
                      
                      // Add markers for origin and destination
                      const originMarker = new google.maps.marker.AdvancedMarkerElement({
                        map: map,
                        position: mapConfig.origin.location,
                        title: mapConfig.origin.address,
                      });
                      
                      const destinationMarker = new google.maps.marker.AdvancedMarkerElement({
                        map: map,
                        position: mapConfig.destination.location,
                        title: mapConfig.destination.address,
                      });
                      
                      // Distance/time will be shown in bottom panel (removed info window)
                      
                      // Fit map to show entire route
                      const bounds = new google.maps.LatLngBounds();
                      bounds.extend(mapConfig.origin.location);
                      bounds.extend(mapConfig.destination.location);
                      map.fitBounds(bounds);
                      
                      // Search for POIs along the route
                      searchPOIsAlongRoute(map, decodedPath, mapConfig.origin.location, mapConfig.destination.location);
                    } else if (mapConfig?.location?.coordinates) {
                      // This is a single location - show marker
                      const marker = new google.maps.marker.AdvancedMarkerElement({
                        map: map,
                        position: mapConfig.location.coordinates,
                        title: mapConfig.location.name,
                      });
                      
                      // Info window removed - location details shown in bottom panel
                    }
                  }}
                />
                
                {/* Distance and Time Panel (Bottom Overlay) */}
                {selectedRoute.mapData && (() => {
                  try {
                    const mapConfig = JSON.parse(selectedRoute.mapData);
                    if (mapConfig?.distance && mapConfig?.duration) {
                      return (
                        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-md shadow-md px-4 py-2 flex items-center gap-4 border border-gray-200">
                          <div className="flex items-center gap-1.5">
                            <Navigation className="w-4 h-4 text-blue-600" />
                            <div>
                              <div className="text-[10px] text-gray-500">{language === "he" ? "מרחק" : "Distance"}</div>
                              <div className="text-sm font-bold text-gray-900">{mapConfig.distance.text}</div>
                            </div>
                          </div>
                          <div className="w-px h-6 bg-gray-300" />
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-green-600" />
                            <div>
                              <div className="text-[10px] text-gray-500">{language === "he" ? "זמן נסיעה" : "Duration"}</div>
                              <div className="text-sm font-bold text-gray-900">{mapConfig.duration.text}</div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  } catch (e) {
                    console.error("Failed to parse mapData:", e);
                  }
                  return null;
                })()}
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
                      <Navigation className="w-4 h-4" />
                      <span>{selectedRoute.distanceKm} {language === "he" ? "ק\"מ" : "km"}</span>
                    </div>
                  )}
                  {selectedRoute.estimatedDuration && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{Math.floor(selectedRoute.estimatedDuration / 60)}h {selectedRoute.estimatedDuration % 60}m</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Open in Google Maps Button */}
              <a
                href={(() => {
                  // Parse mapData to get origin and destination
                  if (selectedRoute.mapData) {
                    try {
                      const mapConfig = JSON.parse(selectedRoute.mapData);
                      // Route with origin/destination - use directions
                      if (mapConfig?.origin && mapConfig?.destination) {
                        const origin = `${mapConfig.origin.location.lat},${mapConfig.origin.location.lng}`;
                        const destination = `${mapConfig.destination.location.lat},${mapConfig.destination.location.lng}`;
                        return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
                      }
                      // Single location - use search
                      if (mapConfig?.location?.coordinates) {
                        const coords = mapConfig.location.coordinates;
                        return `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`;
                      }
                    } catch (e) {
                      console.error("Failed to parse mapData:", e);
                    }
                  }
                  // Fallback: search by route name
                  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedRoute.name)}`;
                })()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-lg shadow-lg transition-all duration-200 active:scale-95"
              >
                <Navigation className="w-5 h-5" />
                <span className="text-lg">
                  {language === "he" ? "פתח ב-Google Maps" : "Open in Google Maps"}
                </span>
              </a>
              
              {/* Points of Interest List */}
              {pois.length > 0 && (
                <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3">
                    <h3 className="text-white font-bold text-lg">
                      {language === "he" ? "נקודות עניין לאורך המסלול" : "Points of Interest Along Route"}
                    </h3>
                  </div>
                  <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
                    {pois.map((poi, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                          style={{ backgroundColor: poi.categoryColor }}
                        >
                          {poi.categoryIcon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 truncate">{poi.name}</h4>
                              <p className="text-xs text-gray-500 mt-0.5">{poi.category}</p>
                            </div>
                            {poi.rating && (
                              <div className="flex items-center gap-1 text-sm flex-shrink-0">
                                <span className="text-yellow-500">⭐</span>
                                <span className="font-medium">{poi.rating}</span>
                              </div>
                            )}
                          </div>
                          {poi.vicinity && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-1">{poi.vicinity}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${poi.geometry.location.lat()},${poi.geometry.location.lng()}&query_place_id=${poi.place_id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                            >
                              <Navigation className="w-3 h-3" />
                              {language === "he" ? "נווט" : "Navigate"}
                            </a>
                            <button
                              onClick={() => handleSavePOI(poi)}
                              className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium"
                            >
                              <Star className="w-3 h-3" />
                              {language === "he" ? "שמור ל-Must Visit" : "Save to Must Visit"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
