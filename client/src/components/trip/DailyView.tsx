import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { Hotel, Plane, Car, MapPin, Utensils, Calendar } from "lucide-react";

interface DailyViewProps {
  tripId: number;
  date: number; // Unix timestamp for the day
}

export default function DailyView({ tripId, date }: DailyViewProps) {
  const { language } = useLanguage();
  
  // Fetch all data for this trip
  const { data: hotels } = trpc.hotels.list.useQuery({ tripId });
  const { data: transportation } = trpc.transportation.list.useQuery({ tripId });
  const { data: carRentals } = trpc.carRentals.list.useQuery({ tripId });
  const { data: sites } = trpc.touristSites.list.useQuery({ tripId });
  const { data: restaurants } = trpc.restaurants.list.useQuery({ tripId });

  // Filter activities for this specific day
  const dayStart = new Date(date).setHours(0, 0, 0, 0);
  const dayEnd = new Date(date).setHours(23, 59, 59, 999);

  const isOnDay = (timestamp: number) => timestamp >= dayStart && timestamp <= dayEnd;

  const dayHotels = hotels?.filter(h => 
    isOnDay(h.checkInDate) || isOnDay(h.checkOutDate)
  ) || [];

  const dayTransportation = transportation?.filter(t => 
    isOnDay(t.departureDate)
  ) || [];

  const dayCarRentals = carRentals?.filter(c => 
    isOnDay(c.pickupDate) || isOnDay(c.returnDate)
  ) || [];

  const daySites = sites?.filter(s => 
    s.plannedVisitDate && isOnDay(s.plannedVisitDate)
  ) || [];

  const dayRestaurants = restaurants?.filter(r => 
    r.reservationDate && isOnDay(r.reservationDate)
  ) || [];

  const hasActivities = dayHotels.length > 0 || dayTransportation.length > 0 || 
    dayCarRentals.length > 0 || daySites.length > 0 || dayRestaurants.length > 0;

  if (!hasActivities) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>{language === "he" ? "אין פעילויות מתוכננות ליום זה" : "No activities planned for this day"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hotels */}
      {dayHotels.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Hotel className="w-5 h-5" />
            {language === "he" ? "מלונות" : "Hotels"}
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {dayHotels.map((hotel) => (
              <Card key={hotel.id}>
                <CardHeader>
                  <CardTitle className="text-base">{hotel.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="text-muted-foreground">{hotel.address}</p>
                  {isOnDay(hotel.checkInDate) && (
                    <p>
                      <span className="font-medium">{language === "he" ? "צ'ק-אין:" : "Check-in:"}</span>{" "}
                      {format(new Date(hotel.checkInDate), "HH:mm")}
                    </p>
                  )}
                  {isOnDay(hotel.checkOutDate) && (
                    <p>
                      <span className="font-medium">{language === "he" ? "צ'ק-אאוט:" : "Check-out:"}</span>{" "}
                      {format(new Date(hotel.checkOutDate), "HH:mm")}
                    </p>
                  )}
                  {hotel.price && (
                    <p className="font-semibold text-primary">
                      {hotel.price} {hotel.currency || "EUR"}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Transportation */}
      {dayTransportation.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Plane className="w-5 h-5" />
            {language === "he" ? "תחבורה" : "Transportation"}
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {dayTransportation.map((trans) => (
              <Card key={trans.id}>
                <CardHeader>
                  <CardTitle className="text-base">{trans.type}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>
                    {trans.origin} → {trans.destination}
                  </p>
                  <p>
                    {format(new Date(trans.departureDate), "HH:mm")}
                    {trans.arrivalDate && ` - ${format(new Date(trans.arrivalDate), "HH:mm")}`}
                  </p>
                  {trans.flightNumber && (
                    <p className="text-muted-foreground">{trans.flightNumber}</p>
                  )}
                  {trans.price && (
                    <p className="font-semibold text-primary">
                      {trans.price} {trans.currency || "EUR"}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Car Rentals */}
      {dayCarRentals.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Car className="w-5 h-5" />
            {language === "he" ? "השכרת רכב" : "Car Rentals"}
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {dayCarRentals.map((car) => (
              <Card key={car.id}>
                <CardHeader>
                  <CardTitle className="text-base">{car.company}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>{car.carModel}</p>
                  {isOnDay(car.pickupDate) && (
                    <p>
                      <span className="font-medium">{language === "he" ? "איסוף:" : "Pickup:"}</span>{" "}
                      {car.pickupLocation} - {format(new Date(car.pickupDate), "HH:mm")}
                    </p>
                  )}
                  {isOnDay(car.returnDate) && (
                    <p>
                      <span className="font-medium">{language === "he" ? "החזרה:" : "Return:"}</span>{" "}
                      {car.returnLocation} - {format(new Date(car.returnDate), "HH:mm")}
                    </p>
                  )}
                  {car.price && (
                    <p className="font-semibold text-primary">
                      {car.price} {car.currency || "EUR"}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tourist Sites */}
      {daySites.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            {language === "he" ? "אתרי תיירות" : "Tourist Sites"}
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {daySites.map((site) => (
              <Card key={site.id}>
                <CardHeader>
                  <CardTitle className="text-base">{site.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="text-muted-foreground">{site.address}</p>
                  {site.description && (
                    <p className="text-sm">{site.description}</p>
                  )}
                  {site.openingHours && (
                    <p className="text-muted-foreground">{site.openingHours}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Restaurants */}
      {dayRestaurants.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Utensils className="w-5 h-5" />
            {language === "he" ? "מסעדות" : "Restaurants"}
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {dayRestaurants.map((restaurant) => (
              <Card key={restaurant.id}>
                <CardHeader>
                  <CardTitle className="text-base">{restaurant.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="text-muted-foreground">{restaurant.address}</p>
                  {restaurant.cuisineType && (
                    <p>{restaurant.cuisineType}</p>
                  )}
                  {restaurant.reservationDate && (
                    <p>
                      {format(new Date(restaurant.reservationDate), "HH:mm")}
                      {restaurant.numberOfDiners && ` - ${restaurant.numberOfDiners} ${language === "he" ? "סועדים" : "diners"}`}
                    </p>
                  )}
                  {restaurant.price && (
                    <p className="font-semibold text-primary">
                      {restaurant.price} {restaurant.currency || "EUR"}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
