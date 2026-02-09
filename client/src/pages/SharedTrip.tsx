import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Plane, Hotel, Car, MapPin, Utensils, Calendar, Clock, 
  Phone, DollarSign, FileText, ArrowLeft, Train, Bus, Ship,
  CalendarDays, Users, Globe, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatTime24 } from "@/lib/timeFormat";
import { useMemo } from "react";

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", ILS: "₪", JPY: "¥",
  CHF: "CHF", CAD: "C$", AUD: "A$", CNY: "¥", INR: "₹", THB: "฿", TRY: "₺"
};

const TRANSPORT_ICONS: Record<string, typeof Plane> = {
  flight: Plane,
  train: Train,
  bus: Bus,
  ferry: Ship,
  other: Car
};

interface TimelineEvent {
  id: string;
  date: number;
  time: string;
  title: string;
  subtitle?: string;
  type: "flight" | "hotel-checkin" | "hotel-checkout" | "car-pickup" | "car-return" | "restaurant" | "site" | "transport";
  icon: typeof Plane;
  color: string;
}

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

  // Build timeline events
  const timelineEvents = useMemo(() => {
    const events: TimelineEvent[] = [];

    // Add hotel check-ins and check-outs
    hotels?.forEach((hotel) => {
      events.push({
        id: `hotel-checkin-${hotel.id}`,
        date: hotel.checkInDate,
        time: hotel.checkInTime || "15:00",
        title: `Check-in: ${hotel.name}`,
        subtitle: hotel.address || undefined,
        type: "hotel-checkin",
        icon: Hotel,
        color: "bg-orange-500"
      });
      events.push({
        id: `hotel-checkout-${hotel.id}`,
        date: hotel.checkOutDate,
        time: hotel.checkOutTime || "11:00",
        title: `Check-out: ${hotel.name}`,
        subtitle: hotel.address || undefined,
        type: "hotel-checkout",
        icon: Hotel,
        color: "bg-orange-400"
      });
    });

    // Add transportation
    transportation?.forEach((t) => {
      const Icon = TRANSPORT_ICONS[t.type] || Car;
      events.push({
        id: `transport-${t.id}`,
        date: t.departureDate,
        time: "00:00",
        title: `${t.type === "flight" ? "Flight" : t.type.charAt(0).toUpperCase() + t.type.slice(1)}: ${t.origin} → ${t.destination}`,
        subtitle: t.flightNumber ? `Flight ${t.flightNumber}` : undefined,
        type: t.type === "flight" ? "flight" : "transport",
        icon: Icon,
        color: t.type === "flight" ? "bg-blue-500" : "bg-purple-500"
      });
    });

    // Add car rentals
    carRentals?.forEach((car) => {
      events.push({
        id: `car-pickup-${car.id}`,
        date: car.pickupDate,
        time: car.pickupTime || "09:00",
        title: `Car Pickup: ${car.company}`,
        subtitle: car.pickupLocation || undefined,
        type: "car-pickup",
        icon: Car,
        color: "bg-green-500"
      });
      events.push({
        id: `car-return-${car.id}`,
        date: car.returnDate,
        time: car.returnTime || "09:00",
        title: `Car Return: ${car.company}`,
        subtitle: car.returnLocation || undefined,
        type: "car-return",
        icon: Car,
        color: "bg-green-400"
      });
    });

    // Add restaurants
    restaurants?.forEach((r) => {
      if (r.reservationDate) {
        events.push({
          id: `restaurant-${r.id}`,
          date: r.reservationDate,
          time: "19:00",
          title: r.name,
          subtitle: r.cuisineType ? `${r.cuisineType} cuisine` : undefined,
          type: "restaurant",
          icon: Utensils,
          color: "bg-pink-500"
        });
      }
    });

    // Sort by date and time
    return events.sort((a, b) => {
      if (a.date !== b.date) return a.date - b.date;
      return a.time.localeCompare(b.time);
    });
  }, [hotels, transportation, carRentals, restaurants]);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, TimelineEvent[]> = {};
    timelineEvents.forEach((event) => {
      const dateKey = new Date(event.date).toDateString();
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(event);
    });
    return grouped;
  }, [timelineEvents]);

  if (tripLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-violet-200 border-t-violet-600 mx-auto"></div>
            <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-violet-600" />
          </div>
          <p className="mt-6 text-gray-600 font-medium">Loading your adventure...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4">
        <Card className="max-w-md shadow-xl border-0">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="bg-gray-100 rounded-full p-4 w-20 h-20 mx-auto mb-6">
              <FileText className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Trip Not Found</h2>
            <p className="text-gray-600 mb-6">
              This shared link is invalid or has been revoked by the trip owner.
            </p>
            <Link href="/">
              <Button size="lg" className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700">
                Go to Homepage
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
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

  const formatDateMedium = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric"
    });
  };

  const getDaysDiff = (start: number, end: number) => {
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  const getNights = (checkIn: number, checkOut: number) => {
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    return nights === 1 ? "1 night" : `${nights} nights`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50">
      {/* Hero Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-600"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        
        <div className="relative container py-8 md:py-12">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10 mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-yellow-300" />
                <span className="text-white/80 text-sm font-medium">Shared Trip</span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3">
                {trip.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-white/90">

                <span className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 text-sm">
                  <Calendar className="h-4 w-4" />
                  {formatDateShort(trip.startDate)} - {formatDateShort(trip.endDate)}
                </span>
                <span className="flex items-center gap-1.5 bg-yellow-400/90 text-yellow-900 rounded-full px-3 py-1 text-sm font-semibold">
                  {getDaysDiff(trip.startDate, trip.endDate)} days
                </span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 text-center">
                <Hotel className="h-6 w-6 text-white mx-auto mb-1" />
                <p className="text-2xl font-bold text-white">{hotels?.length || 0}</p>
                <p className="text-xs text-white/70">Hotels</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 text-center">
                <Plane className="h-6 w-6 text-white mx-auto mb-1" />
                <p className="text-2xl font-bold text-white">{transportation?.length || 0}</p>
                <p className="text-xs text-white/70">Flights</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 text-center">
                <Car className="h-6 w-6 text-white mx-auto mb-1" />
                <p className="text-2xl font-bold text-white">{carRentals?.length || 0}</p>
                <p className="text-xs text-white/70">Cars</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container py-6 md:py-8">
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <div className="bg-amber-100 rounded-full p-2">
            <Globe className="h-5 w-5 text-amber-600" />
          </div>
          <p className="text-amber-800 text-sm">
            You're viewing a shared trip (read-only). Want to plan your own adventure? 
            <Link href="/" className="underline font-semibold ml-1 hover:text-amber-900">Create your trip here</Link>
          </p>
        </div>

        <Tabs defaultValue="timeline" className="space-y-6">
          <TabsList className="bg-white shadow-sm border p-1 rounded-xl">
            <TabsTrigger value="timeline" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-blue-500 data-[state=active]:text-white">
              <CalendarDays className="h-4 w-4 mr-2" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="hotels" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-blue-500 data-[state=active]:text-white">
              <Hotel className="h-4 w-4 mr-2" />
              Hotels
            </TabsTrigger>
            <TabsTrigger value="transport" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-blue-500 data-[state=active]:text-white">
              <Plane className="h-4 w-4 mr-2" />
              Transport
            </TabsTrigger>
            <TabsTrigger value="cars" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-blue-500 data-[state=active]:text-white">
              <Car className="h-4 w-4 mr-2" />
              Cars
            </TabsTrigger>
            <TabsTrigger value="more" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-blue-500 data-[state=active]:text-white">
              <Utensils className="h-4 w-4 mr-2" />
              More
            </TabsTrigger>
          </TabsList>

          {/* Timeline Tab */}
          <TabsContent value="timeline">
            <div className="space-y-6">
              {Object.entries(eventsByDate).length === 0 ? (
                <Card className="border-0 shadow-lg">
                  <CardContent className="py-12 text-center">
                    <CalendarDays className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No events scheduled yet</p>
                  </CardContent>
                </Card>
              ) : (
                Object.entries(eventsByDate).map(([dateStr, events]) => (
                  <div key={dateStr} className="relative">
                    <div className="sticky top-20 z-10 bg-gradient-to-r from-violet-100 to-blue-100 rounded-xl px-4 py-2 mb-4 shadow-sm">
                      <h3 className="font-semibold text-gray-800">
                        {formatDateMedium(new Date(dateStr).getTime())}
                      </h3>
                    </div>
                    <div className="space-y-3 ml-4 border-l-2 border-gray-200 pl-6">
                      {events.map((event) => (
                        <div key={event.id} className="relative">
                          <div className={`absolute -left-[31px] w-4 h-4 rounded-full ${event.color} ring-4 ring-white`}></div>
                          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                            <CardContent className="py-4 px-5">
                              <div className="flex items-start gap-4">
                                <div className={`${event.color} rounded-xl p-2.5 text-white`}>
                                  <event.icon className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium text-gray-500">
                                      {formatTime24(event.time)}
                                    </span>
                                  </div>
                                  <h4 className="font-semibold text-gray-900 truncate">{event.title}</h4>
                                  {event.subtitle && (
                                    <p className="text-sm text-gray-500 truncate">{event.subtitle}</p>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Hotels Tab */}
          <TabsContent value="hotels">
            <div className="grid gap-4 md:grid-cols-2">
              {hotels?.map((hotel) => (
                <Card key={hotel.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-orange-400 to-amber-400"></div>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-3">
                      <div className="bg-orange-100 rounded-xl p-2">
                        <Hotel className="h-5 w-5 text-orange-600" />
                      </div>
                      <span className="truncate">{hotel.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {hotel.address && (
                      <p className="flex items-center gap-2 text-gray-600 text-sm">
                        <MapPin className="h-4 w-4 flex-shrink-0" /> 
                        <span className="truncate">{hotel.address}</span>
                      </p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDateShort(hotel.checkInDate)} - {formatDateShort(hotel.checkOutDate)}
                      </Badge>
                      <Badge variant="outline">{getNights(hotel.checkInDate, hotel.checkOutDate)}</Badge>
                    </div>
                    {(hotel.checkInTime || hotel.checkOutTime) && (
                      <p className="flex items-center gap-2 text-gray-600 text-sm">
                        <Clock className="h-4 w-4" />
                        {hotel.checkInTime && `In: ${formatTime24(hotel.checkInTime)}`}
                        {hotel.checkInTime && hotel.checkOutTime && " • "}
                        {hotel.checkOutTime && `Out: ${formatTime24(hotel.checkOutTime)}`}
                      </p>
                    )}
                    {hotel.phone && (
                      <p className="flex items-center gap-2 text-gray-600 text-sm">
                        <Phone className="h-4 w-4" /> {hotel.phone}
                      </p>
                    )}
                    {hotel.price && (
                      <div className="pt-2 border-t">
                        <p className="flex items-center gap-2 text-lg font-semibold text-green-600">
                          {CURRENCY_SYMBOLS[hotel.currency || "USD"]}{hotel.price}
                          <span className="text-sm font-normal text-gray-500">{hotel.currency || "USD"}</span>
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              {(!hotels || hotels.length === 0) && (
                <Card className="col-span-2 border-0 shadow-lg">
                  <CardContent className="py-12 text-center">
                    <Hotel className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No hotels added yet</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Transportation Tab */}
          <TabsContent value="transport">
            <div className="grid gap-4 md:grid-cols-2">
              {transportation?.map((t) => {
                const Icon = TRANSPORT_ICONS[t.type] || Car;
                return (
                  <Card key={t.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-blue-400 to-cyan-400"></div>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-3">
                        <div className="bg-blue-100 rounded-xl p-2">
                          <Icon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="block truncate">{t.origin} → {t.destination}</span>
                          {t.flightNumber && (
                            <span className="text-sm font-normal text-gray-500">Flight {t.flightNumber}</span>
                          )}
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDateShort(t.departureDate)}
                        </Badge>

                        <Badge className="bg-gray-100 text-gray-700 capitalize">{t.type}</Badge>
                      </div>
                      {t.price && (
                        <div className="pt-2 border-t">
                          <p className="flex items-center gap-2 text-lg font-semibold text-green-600">
                            {CURRENCY_SYMBOLS[t.currency || "USD"]}{t.price}
                            <span className="text-sm font-normal text-gray-500">{t.currency || "USD"}</span>
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
              {(!transportation || transportation.length === 0) && (
                <Card className="col-span-2 border-0 shadow-lg">
                  <CardContent className="py-12 text-center">
                    <Plane className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No transportation added yet</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Cars Tab */}
          <TabsContent value="cars">
            <div className="grid gap-4 md:grid-cols-2">
              {carRentals?.map((car) => (
                <Card key={car.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-green-400 to-emerald-400"></div>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-3">
                      <div className="bg-green-100 rounded-xl p-2">
                        <Car className="h-5 w-5 text-green-600" />
                      </div>
                      <span className="truncate">{car.company}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {car.carModel && (
                      <Badge variant="secondary">{car.carModel}</Badge>
                    )}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Pickup</p>
                        <p className="font-medium">{formatDateShort(car.pickupDate)}</p>
                        {car.pickupTime && <p className="text-gray-600">{formatTime24(car.pickupTime)}</p>}
                        {car.pickupLocation && <p className="text-gray-500 text-xs truncate">{car.pickupLocation}</p>}
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Return</p>
                        <p className="font-medium">{formatDateShort(car.returnDate)}</p>
                        {car.returnTime && <p className="text-gray-600">{formatTime24(car.returnTime)}</p>}
                        {car.returnLocation && <p className="text-gray-500 text-xs truncate">{car.returnLocation}</p>}
                      </div>
                    </div>
                    {car.phone && (
                      <p className="flex items-center gap-2 text-gray-600 text-sm">
                        <Phone className="h-4 w-4" /> {car.phone}
                      </p>
                    )}
                    {car.price && (
                      <div className="pt-2 border-t">
                        <p className="flex items-center gap-2 text-lg font-semibold text-green-600">
                          {CURRENCY_SYMBOLS[car.currency || "USD"]}{car.price}
                          <span className="text-sm font-normal text-gray-500">{car.currency || "USD"}</span>
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              {(!carRentals || carRentals.length === 0) && (
                <Card className="col-span-2 border-0 shadow-lg">
                  <CardContent className="py-12 text-center">
                    <Car className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No car rentals added yet</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* More Tab (Restaurants & Sites) */}
          <TabsContent value="more">
            <div className="space-y-6">
              {/* Restaurants */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Utensils className="h-5 w-5 text-pink-500" />
                  Restaurants ({restaurants?.length || 0})
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {restaurants?.map((r) => (
                    <Card key={r.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                      <div className="h-2 bg-gradient-to-r from-pink-400 to-rose-400"></div>
                      <CardContent className="pt-4 space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="bg-pink-100 rounded-xl p-2">
                            <Utensils className="h-5 w-5 text-pink-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{r.name}</h4>
                            {r.cuisineType && <p className="text-sm text-gray-500">{r.cuisineType}</p>}
                          </div>
                        </div>
                        {r.address && (
                          <p className="flex items-center gap-2 text-gray-600 text-sm">
                            <MapPin className="h-4 w-4" /> {r.address}
                          </p>
                        )}
                        {r.reservationDate && (
                          <Badge variant="secondary">
                            {formatDateShort(r.reservationDate)}
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  {(!restaurants || restaurants.length === 0) && (
                    <Card className="col-span-2 border-0 shadow-lg">
                      <CardContent className="py-8 text-center">
                        <Utensils className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No restaurants added yet</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              {/* Tourist Sites */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-purple-500" />
                  Tourist Sites ({touristSites?.length || 0})
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {touristSites?.map((site) => (
                    <Card key={site.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                      <div className="h-2 bg-gradient-to-r from-purple-400 to-violet-400"></div>
                      <CardContent className="pt-4 space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="bg-purple-100 rounded-xl p-2">
                            <MapPin className="h-5 w-5 text-purple-600" />
                          </div>
                          <h4 className="font-semibold">{site.name}</h4>
                        </div>
                        {site.address && (
                          <p className="text-gray-600 text-sm">{site.address}</p>
                        )}
                        {site.description && (
                          <p className="text-gray-500 text-sm line-clamp-2">{site.description}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  {(!touristSites || touristSites.length === 0) && (
                    <Card className="col-span-full border-0 shadow-lg">
                      <CardContent className="py-8 text-center">
                        <MapPin className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No tourist sites added yet</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-white/50 border-t mt-12 py-6">
        <div className="container text-center">
          <p className="text-gray-500 text-sm">
            Shared via <span className="font-semibold text-violet-600">Trip Planner Pro</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
