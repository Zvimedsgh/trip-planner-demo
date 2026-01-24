import { MapView } from "../Map";
import { useLanguage } from "@/contexts/LanguageContext";

export function AllRouteMapsTab() {
  const { language } = useLanguage();

  return (
    <div className="space-y-8">
      {/* Route 1: Bratislava → Liptovský Mikuláš */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">
          {language === "he" ? "מסלול 1: ברטיסלבה → ליפטובסקי מיקולאש" : "Route 1: Bratislava → Liptovský Mikuláš"}
        </h2>
        <div className="h-[500px] rounded-lg overflow-hidden border-2 border-border">
          <MapView
            onMapReady={(map: any) => {
              const google = window.google;
              const directionsService = new google.maps.DirectionsService();
              const directionsRenderer = new google.maps.DirectionsRenderer({
                map,
                suppressMarkers: false,
              });

              const waypoints = [
                { location: { lat: 48.7164, lng: 19.1517 }, stopover: true }, // Banská Bystrica
              ];

              directionsService.route(
                {
                  origin: { lat: 48.1486, lng: 17.1077 }, // Bratislava
                  destination: { lat: 49.0833, lng: 19.6167 }, // Liptovský Mikuláš
                  waypoints,
                  travelMode: google.maps.TravelMode.DRIVING,
                },
                (result: any, status: any) => {
                  if (status === google.maps.DirectionsStatus.OK && result) {
                    directionsRenderer.setDirections(result);
                  }
                }
              );

              // Points of Interest
              const pois = [
                { lat: 48.7164, lng: 19.1517, name: "Banská Bystrica", type: "city" },
                { lat: 48.8, lng: 19.5, name: "Gas Station", type: "gas" },
                { lat: 48.9, lng: 19.4, name: "Restaurant", type: "restaurant" },
              ];

              pois.forEach((poi) => {
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
        </div>
      </div>

      {/* Route 2: Liptovský Mikuláš → Košice */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">
          {language === "he" ? "מסלול 2: ליפטובסקי מיקולאש → קושיצה" : "Route 2: Liptovský Mikuláš → Košice"}
        </h2>
        <div className="h-[500px] rounded-lg overflow-hidden border-2 border-border">
          <MapView
            onMapReady={(map: any) => {
              const google = window.google;
              const directionsService = new google.maps.DirectionsService();
              const directionsRenderer = new google.maps.DirectionsRenderer({
                map,
                suppressMarkers: false,
              });

              const waypoints = [
                { location: { lat: 48.9972, lng: 20.5597 }, stopover: true }, // Spiš Castle area
              ];

              directionsService.route(
                {
                  origin: { lat: 49.0833, lng: 19.6167 }, // Liptovský Mikuláš
                  destination: { lat: 48.7164, lng: 21.2611 }, // Košice
                  waypoints,
                  travelMode: google.maps.TravelMode.DRIVING,
                },
                (result: any, status: any) => {
                  if (status === google.maps.DirectionsStatus.OK && result) {
                    directionsRenderer.setDirections(result);
                  }
                }
              );

              // Points of Interest
              const pois = [
                { lat: 48.9972, lng: 20.5597, name: "Spiš Castle", type: "attraction" },
                { lat: 49.0, lng: 20.3, name: "Slovak Paradise", type: "attraction" },
                { lat: 49.1, lng: 20.1, name: "Gas Station", type: "gas" },
                { lat: 48.85, lng: 21.0, name: "Restaurant", type: "restaurant" },
              ];

              pois.forEach((poi) => {
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
        </div>
      </div>

      {/* Route 3: Košice → Vienna */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">
          {language === "he" ? "מסלול 3: קושיצה → וינה" : "Route 3: Košice → Vienna"}
        </h2>
        <div className="h-[500px] rounded-lg overflow-hidden border-2 border-border">
          <MapView
            onMapReady={(map: any) => {
              const google = window.google;
              const directionsService = new google.maps.DirectionsService();
              const directionsRenderer = new google.maps.DirectionsRenderer({
                map,
                suppressMarkers: false,
              });

              const waypoints = [
                { location: { lat: 48.1486, lng: 17.1077 }, stopover: true }, // Bratislava
              ];

              directionsService.route(
                {
                  origin: { lat: 48.7164, lng: 21.2611 }, // Košice
                  destination: { lat: 48.2082, lng: 16.3738 }, // Vienna
                  waypoints,
                  travelMode: google.maps.TravelMode.DRIVING,
                },
                (result: any, status: any) => {
                  if (status === google.maps.DirectionsStatus.OK && result) {
                    directionsRenderer.setDirections(result);
                  }
                }
              );

              // Points of Interest
              const pois = [
                { lat: 48.2082, lng: 16.3738, name: "Schönbrunn Palace", type: "attraction" },
                { lat: 48.2085, lng: 16.3794, name: "Belvedere Palace", type: "attraction" },
                { lat: 48.5, lng: 18.0, name: "Gas Station", type: "gas" },
                { lat: 48.3, lng: 17.5, name: "Restaurant", type: "restaurant" },
              ];

              pois.forEach((poi) => {
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
        </div>
      </div>
    </div>
  );
}
