import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Plane, Hotel, Car, MapPin, Utensils, Calendar, Clock, 
  Phone, DollarSign, FileText, ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatTime24 } from "@/lib/timeFormat";

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", ILS: "₪", JPY: "¥",
  CHF: "CHF", CAD: "C$", AUD: "A$", CNY: "¥", INR: "₹", THB: "฿", TRY: "₺"
};

export default function SharedTrip() {
  const { token } = useParams<{ token: string }>();
  
  const { data: trip, isLoading: tripLoading } = trpc.trips.getByShareToken.useQuery(
    { token: token || "" },
    { enabled: !!token }
  );
  
  const { data: hotels } = trpc.sharedTrip.getHotels.useQuery(
    { token: token || "" },
    { enabled: !!token && !!trip }
  );
  
  const { data: transportation } = trpc.sharedTrip.getTransportation.useQuery(
    { token: token || "" },
    { enabled: !!token && !!trip }
  );
  
  const { data: carRentals } = trpc.sharedTrip.getCarRentals.useQuery(
    { token: token || "" },
    { enabled: !!token && !!trip }
  );
  
  const { data: restaurants } = trpc.sharedTrip.getRestaurants.useQuery(
    { token: token || "" },
    { enabled: !!token && !!trip }
  );
  
  const { data: touristSites } = trpc.sharedTrip.getTouristSites.useQuery(
    { token: token || "" },
    { enabled: !!token && !!trip }
  );

  if (tripLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading trip...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Trip Not Found</h2>
            <p className="text-gray-600 mb-4">
              This shared link is invalid or has been revoked.
            </p>
            <Link href="/">
              <Button>Go to Homepage</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const formatDateShort = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    });
  };

  const getDaysDiff = (start: number, end: number) => {
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };

  const getNights = (checkIn: number, checkOut: number) => {
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    return nights === 1 ? "1 night" : `${nights} nights`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{trip.name}</h1>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <MapPin className="h-4 w-4" />
                <span>{trip.destination}</span>
                <span className="mx-2">•</span>
                <Calendar className="h-4 w-4" />
                <span>{formatDateShort(trip.startDate)} - {formatDateShort(trip.endDate)}</span>
                <Badge variant="secondary" className="ml-2">
                  {getDaysDiff(trip.startDate, trip.endDate)} days
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container py-6">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <p className="text-amber-800 text-sm">
            📖 You are viewing a shared trip (read-only). To create your own trips, 
            <Link href="/" className="underline font-medium ml-1">sign up here</Link>.
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-white/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="hotels">Hotels ({hotels?.length || 0})</TabsTrigger>
            <TabsTrigger value="transport">Transport ({transportation?.length || 0})</TabsTrigger>
            <TabsTrigger value="cars">Cars ({carRentals?.length || 0})</TabsTrigger>
            <TabsTrigger value="restaurants">Restaurants ({restaurants?.length || 0})</TabsTrigger>
            <TabsTrigger value="sites">Sites ({touristSites?.length || 0})</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Trip Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Trip Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p><strong>Destination:</strong> {trip.destination}</p>
                    <p><strong>Start:</strong> {formatDate(trip.startDate)}</p>
                    <p><strong>End:</strong> {formatDate(trip.endDate)}</p>
                    <p><strong>Duration:</strong> {getDaysDiff(trip.startDate, trip.endDate)} days</p>
                    {trip.description && <p><strong>Notes:</strong> {trip.description}</p>}
                  </div>
                </CardContent>
              </Card>

              {/* Summary Cards */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hotel className="h-5 w-5 text-orange-600" />
                    Accommodations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{hotels?.length || 0}</p>
                  <p className="text-gray-600 text-sm">hotels booked</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plane className="h-5 w-5 text-blue-600" />
                    Transportation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{transportation?.length || 0}</p>
                  <p className="text-gray-600 text-sm">bookings</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Hotels Tab */}
          <TabsContent value="hotels">
            <div className="grid gap-4 md:grid-cols-2">
              {hotels?.map((hotel) => (
                <Card key={hotel.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Hotel className="h-5 w-5 text-orange-600" />
                      {hotel.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {hotel.address && (
                      <p className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4" /> {hotel.address}
                      </p>
                    )}
                    <p className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {formatDateShort(hotel.checkInDate)} - {formatDateShort(hotel.checkOutDate)}
                      <Badge variant="outline">{getNights(hotel.checkInDate, hotel.checkOutDate)}</Badge>
                    </p>
                    {(hotel.checkInTime || hotel.checkOutTime) && (
                      <p className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-4 w-4" />
                        {hotel.checkInTime && `Check-in: ${formatTime24(hotel.checkInTime)}`}
                        {hotel.checkInTime && hotel.checkOutTime && " • "}
                        {hotel.checkOutTime && `Check-out: ${formatTime24(hotel.checkOutTime)}`}
                      </p>
                    )}
                    {hotel.phone && (
                      <p className="flex items-center gap-2 text-gray-600">
                        <Phone className="h-4 w-4" /> {hotel.phone}
                      </p>
                    )}
                    {hotel.price && (
                      <p className="flex items-center gap-2 text-green-600 font-medium">
                        <DollarSign className="h-4 w-4" />
                        {CURRENCY_SYMBOLS[hotel.currency || "USD"]}{hotel.price} {hotel.currency || "USD"}
                      </p>
                    )}
                    {hotel.confirmationNumber && (
                      <p className="text-gray-600">
                        <strong>Confirmation:</strong> #{hotel.confirmationNumber}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
              {(!hotels || hotels.length === 0) && (
                <p className="text-gray-500 col-span-2 text-center py-8">No hotels added yet</p>
              )}
            </div>
          </TabsContent>

          {/* Transportation Tab */}
          <TabsContent value="transport">
            <div className="grid gap-4 md:grid-cols-2">
              {transportation?.map((t) => (
                <Card key={t.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Plane className="h-5 w-5 text-blue-600" />
                      {t.origin} → {t.destination}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge>{t.type}</Badge>
                      {t.flightNumber && <Badge variant="outline">{t.flightNumber}</Badge>}
                    </div>
                    <p className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {formatDate(t.departureDate)}
                    </p>
                    {t.price && (
                      <p className="flex items-center gap-2 text-green-600 font-medium">
                        <DollarSign className="h-4 w-4" />
                        {CURRENCY_SYMBOLS[t.currency || "USD"]}{t.price} {t.currency || "USD"}
                      </p>
                    )}
                    {t.confirmationNumber && (
                      <p className="text-gray-600">
                        <strong>Confirmation:</strong> #{t.confirmationNumber}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
              {(!transportation || transportation.length === 0) && (
                <p className="text-gray-500 col-span-2 text-center py-8">No transportation added yet</p>
              )}
            </div>
          </TabsContent>

          {/* Car Rentals Tab */}
          <TabsContent value="cars">
            <div className="grid gap-4 md:grid-cols-2">
              {carRentals?.map((car) => (
                <Card key={car.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Car className="h-5 w-5 text-purple-600" />
                      {car.company} - {car.carModel || "Car"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {formatDateShort(car.pickupDate)} - {formatDateShort(car.returnDate)}
                    </p>
                    {car.pickupLocation && (
                      <p className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4" /> Pickup: {car.pickupLocation}
                      </p>
                    )}
                    {car.returnLocation && (
                      <p className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4" /> Return: {car.returnLocation}
                      </p>
                    )}
                    {car.phone && (
                      <p className="flex items-center gap-2 text-gray-600">
                        <Phone className="h-4 w-4" /> {car.phone}
                      </p>
                    )}
                    {car.price && (
                      <p className="flex items-center gap-2 text-green-600 font-medium">
                        <DollarSign className="h-4 w-4" />
                        {CURRENCY_SYMBOLS[car.currency || "USD"]}{car.price} {car.currency || "USD"}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
              {(!carRentals || carRentals.length === 0) && (
                <p className="text-gray-500 col-span-2 text-center py-8">No car rentals added yet</p>
              )}
            </div>
          </TabsContent>

          {/* Restaurants Tab */}
          <TabsContent value="restaurants">
            <div className="grid gap-4 md:grid-cols-2">
              {restaurants?.map((r) => (
                <Card key={r.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Utensils className="h-5 w-5 text-red-600" />
                      {r.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {r.cuisineType && <Badge variant="outline">{r.cuisineType}</Badge>}
                    {r.address && (
                      <p className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4" /> {r.address}
                      </p>
                    )}
                    {r.reservationDate && (
                      <p className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {formatDate(r.reservationDate)}
                        
                      </p>
                    )}
                    {r.phone && (
                      <p className="flex items-center gap-2 text-gray-600">
                        <Phone className="h-4 w-4" /> {r.phone}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
              {(!restaurants || restaurants.length === 0) && (
                <p className="text-gray-500 col-span-2 text-center py-8">No restaurants added yet</p>
              )}
            </div>
          </TabsContent>

          {/* Tourist Sites Tab */}
          <TabsContent value="sites">
            <div className="grid gap-4 md:grid-cols-2">
              {touristSites?.map((site) => (
                <Card key={site.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <MapPin className="h-5 w-5 text-teal-600" />
                      {site.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {site.address && (
                      <p className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4" /> {site.address}
                      </p>
                    )}
                    {site.plannedVisitDate && (
                      <p className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {formatDate(site.plannedVisitDate)}
                      </p>
                    )}
                    {site.openingHours && (
                      <p className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-4 w-4" /> {site.openingHours}
                      </p>
                    )}
                    {site.description && (
                      <p className="text-gray-600">{site.description}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
              {(!touristSites || touristSites.length === 0) && (
                <p className="text-gray-500 col-span-2 text-center py-8">No tourist sites added yet</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-white/50 border-t py-4 mt-8">
        <div className="container text-center text-sm text-gray-600">
          <p>Shared via <strong>Trip Planner Pro</strong></p>
        </div>
      </footer>
    </div>
  );
}
