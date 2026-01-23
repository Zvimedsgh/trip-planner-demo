import { useEffect, useRef, useState } from "react";
import { MapView } from "../Map";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { MapPin, Utensils, Fuel, Castle } from "lucide-react";

interface RouteMapTabProps {
  tripId: number;
}

interface RoutePoint {
  name: string;
  type: "attraction" | "restaurant" | "gas_station" | "hotel";
  lat: number;
  lng: number;
  description?: string;
  address?: string;
}

export function RouteMapTab({ tripId }: RouteMapTabProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  // Route points from Bratislava to Liptovský Mikuláš
  const routePoints: RoutePoint[] = [
    // Start
    { name: "Bratislava", type: "hotel", lat: 48.1486, lng: 17.1077, description: "Starting point" },
    
    // Gas stations along the route
    { name: "OMV Petrol Station", type: "gas_station", lat: 48.2156, lng: 17.2845, address: "Near Trnava" },
    { name: "Shell Station", type: "gas_station", lat: 48.7164, lng: 18.0880, address: "Near Trenčín" },
    { name: "Slovnaft", type: "gas_station", lat: 49.0821, lng: 19.3045, address: "Near Ružomberok" },
    
    // Attractions
    { name: "Bojnice Castle", type: "attraction", lat: 48.7794, lng: 18.5775, description: "Neo-Gothic castle with beautiful gardens" },
    { name: "Nitra Castle", type: "attraction", lat: 48.3167, lng: 18.0875, description: "11th century fortress with cathedral" },
    { name: "Banská Štiavnica - Kalvária", type: "attraction", lat: 48.4583, lng: 18.8972, description: "UNESCO heritage mining town with Calvary" },
    { name: "Vlkolínec", type: "attraction", lat: 49.0333, lng: 19.2833, description: "UNESCO heritage traditional village" },
    
    // Restaurants in Liptovský Mikuláš
    { name: "Liptovská Izba", type: "restaurant", lat: 49.0833, lng: 19.6167, description: "Traditional Slovak cuisine - #1 rated", address: "Main square, Liptovský Mikuláš" },
    { name: "Slovenská Reštaurácia", type: "restaurant", lat: 49.0825, lng: 19.6155, description: "Traditional Slovak restaurant", address: "Opposite Route 66" },
    { name: "Restart Burger", type: "restaurant", lat: 49.0828, lng: 19.6172, description: "Quality burgers", address: "Side street near main square" },
    { name: "Liptovar Pivovar", type: "restaurant", lat: 49.0830, lng: 19.6180, description: "Brew pub with local beer" },
    
    // Destination
    { name: "Liptovský Mikuláš", type: "hotel", lat: 49.0833, lng: 19.6167, description: "Destination - Hotel Bankov Košice area" },
  ];

  const handleMapReady = (mapInstance: google.maps.Map) => {
    setMap(mapInstance);

    // Create DirectionsRenderer
    const renderer = new google.maps.DirectionsRenderer({
      map: mapInstance,
      suppressMarkers: true, // We'll add custom markers
      polylineOptions: {
        strokeColor: "#2563eb",
        strokeWeight: 4,
        strokeOpacity: 0.7,
      },
    });
    setDirectionsRenderer(renderer);

    // Calculate and display route
    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin: { lat: 48.1486, lng: 17.1077 }, // Bratislava
        destination: { lat: 49.0833, lng: 19.6167 }, // Liptovský Mikuláš
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK" && result) {
          renderer.setDirections(result);
        }
      }
    );

    // Add custom markers
    routePoints.forEach((point) => {
      let icon: google.maps.Icon | undefined;
      let zIndex = 1;

      switch (point.type) {
        case "attraction":
          icon = {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
              '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#8b5cf6" stroke="white" stroke-width="2"/></svg>'
            )}`,
            scaledSize: new google.maps.Size(24, 24),
            anchor: new google.maps.Point(12, 12),
          };
          zIndex = 3;
          break;
        case "restaurant":
          icon = {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
              '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" fill="#f59e0b" stroke="white" stroke-width="2"/></svg>'
            )}`,
            scaledSize: new google.maps.Size(20, 20),
            anchor: new google.maps.Point(10, 10),
          };
          zIndex = 2;
          break;
        case "gas_station":
          icon = {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
              '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><circle cx="9" cy="9" r="7" fill="#10b981" stroke="white" stroke-width="2"/></svg>'
            )}`,
            scaledSize: new google.maps.Size(18, 18),
            anchor: new google.maps.Point(9, 9),
          };
          zIndex = 1;
          break;
        case "hotel":
          icon = {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
              '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><circle cx="14" cy="14" r="12" fill="#ef4444" stroke="white" stroke-width="3"/></svg>'
            )}`,
            scaledSize: new google.maps.Size(28, 28),
            anchor: new google.maps.Point(14, 14),
          };
          zIndex = 4;
          break;
      }

      const marker = new google.maps.Marker({
        position: { lat: point.lat, lng: point.lng },
        map: mapInstance,
        title: point.name,
        icon,
        zIndex,
      });

      // Add info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 250px;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">${point.name}</h3>
            ${point.description ? `<p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">${point.description}</p>` : ""}
            ${point.address ? `<p style="margin: 0; font-size: 11px; color: #999;">${point.address}</p>` : ""}
          </div>
        `,
      });

      marker.addListener("click", () => {
        infoWindow.open(mapInstance, marker);
      });

      markersRef.current.push(marker);
    });
  };

  useEffect(() => {
    return () => {
      // Cleanup markers
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
    };
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "attraction":
        return <Castle className="h-4 w-4" />;
      case "restaurant":
        return <Utensils className="h-4 w-4" />;
      case "gas_station":
        return <Fuel className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "attraction":
        return "אתר";
      case "restaurant":
        return "מסעדה";
      case "gas_station":
        return "תחנת דלק";
      case "hotel":
        return "מלון";
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "attraction":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "restaurant":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "gas_station":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "hotel":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>מסלול הנסיעה: ברטיסלבה → ליפטובסקי מיקולש</CardTitle>
          <CardDescription>
            מרחק: ~285 ק"מ | זמן נסיעה: ~4.5 שעות | תאריך: 2 בספטמבר 2026
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] rounded-lg overflow-hidden border">
            <MapView
              onMapReady={handleMapReady}
              initialCenter={{ lat: 48.6, lng: 18.4 }}
              initialZoom={8}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-purple-500 border-2 border-white shadow"></div>
              <span className="text-sm">אתרים</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500 border-2 border-white shadow"></div>
              <span className="text-sm">מסעדות</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow"></div>
              <span className="text-sm">תחנות דלק</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow"></div>
              <span className="text-sm">התחלה/סיום</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>נקודות עניין לאורך המסלול</CardTitle>
          <CardDescription>לחץ על נקודה במפה לפרטים נוספים</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {routePoints
              .filter((p) => p.type !== "hotel")
              .map((point, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => {
                    if (map) {
                      map.panTo({ lat: point.lat, lng: point.lng });
                      map.setZoom(14);
                    }
                  }}
                >
                  <div className={`p-2 rounded-lg ${getTypeColor(point.type)}`}>
                    {getIcon(point.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{point.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {getTypeLabel(point.type)}
                      </Badge>
                    </div>
                    {point.description && (
                      <p className="text-sm text-muted-foreground">{point.description}</p>
                    )}
                    {point.address && (
                      <p className="text-xs text-muted-foreground mt-1">{point.address}</p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
