import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { 
  Calendar, Car, DollarSign, FileText, Globe, 
  Hotel, Loader2, MapPin, Plane, Utensils, Clock, Map, CheckSquare, Navigation, Users, Sparkles
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import TouristSitesTab from "@/components/trip/TouristSitesTab";
import HotelsTab from "@/components/trip/HotelsTab";
import TransportationTab from "@/components/trip/TransportationTab";
import RestaurantsTab from "@/components/trip/RestaurantsTab";
import DocumentsTab from "@/components/trip/DocumentsTab";
import TimelineTab from "@/components/trip/TimelineTab";
import BudgetTab from "@/components/trip/BudgetTab";
import ChecklistTab from "@/components/trip/ChecklistTab";
import { AllRouteMapsTab } from "@/components/trip/AllRouteMapsTab";
import DayTripsTab from "@/components/trip/DayTripsTab";
import DailyView from "@/components/trip/DailyView";
import PaymentsTab from "@/components/trip/PaymentsTab";
import TravelersTab from "@/components/trip/TravelersTab";
import { getLoginUrl } from "@/const";

export default function DemoTrip() {
  const [, navigate] = useLocation();
  const { t, language, isRTL } = useLanguage();
  const { user } = useAuth();
  
  const { data: trip, isLoading } = trpc.trips.getDemo.useQuery();
  const [defaultTab, setDefaultTab] = useState<string>("hotels");
  const [hasInitialized, setHasInitialized] = useState(false);
  
  // Auto-select current day or first day (only on mount)
  useEffect(() => {
    if (!trip || hasInitialized) return;
    
    const now = Date.now();
    const tripStart = trip.startDate;
    const tripEnd = trip.endDate;
    
    // If trip hasn't started yet, select first day
    if (now < tripStart) {
      setDefaultTab(`day-${tripStart}`);
      setHasInitialized(true);
      return;
    }
    
    // If trip has ended, select first day
    if (now > tripEnd) {
      setDefaultTab(`day-${tripStart}`);
      setHasInitialized(true);
      return;
    }
    
    // Trip is ongoing - find current day
    const daysCount = getDaysCount(tripStart, tripEnd);
    for (let i = 0; i < daysCount; i++) {
      const dayDate = new Date(tripStart);
      dayDate.setDate(dayDate.getDate() + i);
      const dayStart = dayDate.setHours(0, 0, 0, 0);
      const dayEnd = dayDate.setHours(23, 59, 59, 999);
      
      if (now >= dayStart && now <= dayEnd) {
        setDefaultTab(`day-${dayStart}`);
        setHasInitialized(true);
        return;
      }
    }
    
    // Fallback to first day
    setDefaultTab(`day-${tripStart}`);
    setHasInitialized(true);
  }, [trip, hasInitialized]);

  function getDaysCount(startDate: number, endDate: number): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  }

  function getDaysList(startDate: number, endDate: number) {
    const days = [];
    const daysCount = getDaysCount(startDate, endDate);
    
    for (let i = 0; i < daysCount; i++) {
      const dayDate = new Date(startDate);
      dayDate.setDate(dayDate.getDate() + i);
      const dayTimestamp = dayDate.setHours(0, 0, 0, 0);
      
      days.push({
        date: dayTimestamp,
        label: `${language === "he" ? "יום" : "Day"} ${i + 1} - ${format(dayTimestamp, language === "he" ? "MMM d" : "MMM d")}`,
        dayNumber: i + 1
      });
    }
    
    return days;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              {language === "he" ? "טיול הדגמה לא נמצא" : "Demo Trip Not Found"}
            </h2>
            <p className="text-muted-foreground mb-6">
              {language === "he" 
                ? "לא נמצא טיול בשם 'הדגמה'. אנא צור טיול חדש כדי להתחיל."
                : "No trip named 'הדגמה' found. Please create a new trip to get started."}
            </p>
            <Button asChild>
              <Link href="/">
                {language === "he" ? "חזור לדף הבית" : "Back to Home"}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const days = getDaysList(trip.startDate, trip.endDate);

  return (
    <div className="min-h-screen bg-background">
      {/* Demo Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-4">
        <div className="container max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6" />
            <div>
              <h3 className="font-semibold">
                {language === "he" ? "זו דוגמה לטיול מתוכנן" : "This is a Sample Trip"}
              </h3>
              <p className="text-sm opacity-90">
                {language === "he" 
                  ? "צפה בכל האפשרויות ואז צור טיול משלך כדי להתחיל לתכנן"
                  : "Explore all features, then create your own trip to start planning"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {user ? (
              <Button 
                size="lg"
                variant="secondary"
                onClick={() => navigate("/trips")}
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                {language === "he" ? "הטיולים שלי" : "My Trips"}
              </Button>
            ) : (
              <Button 
                size="lg"
                variant="secondary"
                onClick={() => window.location.href = getLoginUrl()}
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                {language === "he" ? "צור טיול משלך" : "Create Your Own Trip"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Trip Content */}
      <div className="container max-w-6xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{trip.name}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{trip.destination}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                {format(trip.startDate, "MMM d, yyyy")} - {format(trip.endDate, "MMM d, yyyy")}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>
                {getDaysCount(trip.startDate, trip.endDate)} {language === "he" ? "ימים" : "days"}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={defaultTab} onValueChange={setDefaultTab} className="w-full" dir={isRTL ? "rtl" : "ltr"}>
          <TabsList className="w-full flex-wrap h-auto gap-1 bg-muted/50 p-1">
            {days.map((day) => (
              <TabsTrigger 
                key={day.date} 
                value={`day-${day.date}`}
                className="flex-shrink-0 text-xs sm:text-sm"
              >
                {day.label}
              </TabsTrigger>
            ))}
            <TabsTrigger value="hotels" className="flex items-center gap-1">
              <Hotel className="h-4 w-4" />
              <span className="hidden sm:inline">{language === "he" ? "מלונות" : "Hotels"}</span>
            </TabsTrigger>
            <TabsTrigger value="transportation" className="flex items-center gap-1">
              <Plane className="h-4 w-4" />
              <span className="hidden sm:inline">{language === "he" ? "תחבורה" : "Transportation"}</span>
            </TabsTrigger>
            <TabsTrigger value="tourist-sites" className="flex items-center gap-1">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">{language === "he" ? "אתרים" : "Tourist Sites"}</span>
            </TabsTrigger>
            <TabsTrigger value="route-maps" className="flex items-center gap-1">
              <Navigation className="h-4 w-4" />
              <span className="hidden sm:inline">{language === "he" ? "מפות מסלול" : "Route Maps"}</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">{language === "he" ? "תשלומים" : "Payments"}</span>
            </TabsTrigger>
            <TabsTrigger value="travelers" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">{language === "he" ? "מטיילים" : "Travelers"}</span>
            </TabsTrigger>
            <TabsTrigger value="restaurants" className="flex items-center gap-1">
              <Utensils className="h-4 w-4" />
              <span className="hidden sm:inline">{language === "he" ? "מסעדות" : "Restaurants"}</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">{language === "he" ? "מסמכים" : "Documents"}</span>
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">{language === "he" ? "ציר זמן" : "Timeline"}</span>
            </TabsTrigger>
            <TabsTrigger value="budget" className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">{language === "he" ? "תקציב" : "Budget"}</span>
            </TabsTrigger>
            <TabsTrigger value="checklist" className="flex items-center gap-1">
              <CheckSquare className="h-4 w-4" />
              <span className="hidden sm:inline">{language === "he" ? "רשימת משימות" : "Checklist"}</span>
            </TabsTrigger>
            <TabsTrigger value="day-trips" className="flex items-center gap-1">
              <Map className="h-4 w-4" />
              <span className="hidden sm:inline">{language === "he" ? "טיולי יום" : "Day Trips"}</span>
            </TabsTrigger>
          </TabsList>

          {/* Day Tabs */}
          {days.map((day) => (
            <TabsContent key={day.date} value={`day-${day.date}`}>
              <DailyView tripId={trip.id} date={day.date} />
            </TabsContent>
          ))}

          {/* Feature Tabs */}
          <TabsContent value="hotels">
            <HotelsTab tripId={trip.id} />
          </TabsContent>

          <TabsContent value="transportation">
            <TransportationTab tripId={trip.id} />
          </TabsContent>

          <TabsContent value="tourist-sites">
            <TouristSitesTab tripId={trip.id} />
          </TabsContent>

          <TabsContent value="route-maps">
            <AllRouteMapsTab tripId={trip.id} />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentsTab tripId={trip.id} />
          </TabsContent>

          <TabsContent value="travelers">
            <TravelersTab tripId={trip.id} />
          </TabsContent>

          <TabsContent value="restaurants">
            <RestaurantsTab tripId={trip.id} />
          </TabsContent>

          <TabsContent value="documents">
            <DocumentsTab tripId={trip.id} />
          </TabsContent>

          <TabsContent value="timeline">
            <TimelineTab tripId={trip.id} />
          </TabsContent>

          <TabsContent value="budget">
            <BudgetTab tripId={trip.id} />
          </TabsContent>

          <TabsContent value="checklist">
            <ChecklistTab tripId={trip.id} />
          </TabsContent>

          <TabsContent value="day-trips">
            <DayTripsTab tripId={trip.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
