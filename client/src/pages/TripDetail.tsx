import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { 
  ArrowLeft, Calendar, Car, DollarSign, FileText, Globe, 
  Hotel, Loader2, MapPin, Plane, Utensils, Clock, ArrowRight, Share2, Copy, Check, X, Map, CheckSquare, Navigation, Trash2
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Link, useParams, useLocation } from "wouter";
import TouristSitesTab from "@/components/trip/TouristSitesTab";
import HotelsTab from "@/components/trip/HotelsTab";
import TransportationTab from "@/components/trip/TransportationTab";
// import CarRentalsTab from "@/components/trip/CarRentalsTab"; // Removed - merged into Transportation
import RestaurantsTab from "@/components/trip/RestaurantsTab";
import DocumentsTab from "@/components/trip/DocumentsTab";
import TimelineTab from "@/components/trip/TimelineTab";
import BudgetTab from "@/components/trip/BudgetTab";
import ChecklistTab from "@/components/trip/ChecklistTab";
import { AllRouteMapsTab } from "@/components/trip/AllRouteMapsTab";
import DayTripsTab from "@/components/trip/DayTripsTab";
import DailyView from "@/components/trip/DailyView";
import CollaboratorsDialog from "@/components/trip/CollaboratorsDialog";
import RouteManager from "@/components/trip/RouteManager";
import PaymentsTab from "@/components/trip/PaymentsTab";

export default function TripDetail() {
  const params = useParams<{ id: string }>();
  const tripId = parseInt(params.id || "0");
  const [, navigate] = useLocation();
  const { t, language, setLanguage, isRTL } = useLanguage();
  const { user } = useAuth();

  const { data: trip, isLoading, refetch } = trpc.trips.get.useQuery({ id: tripId });
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [defaultTab, setDefaultTab] = useState<string>("hotels");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [highlightedActivityId, setHighlightedActivityId] = useState<number | null>(null);
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
  
  // Scroll-to-top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const generateShareLink = trpc.trips.generateShareLink.useMutation({
    onSuccess: () => {
      refetch();
      toast.success(language === "he" ? "קישור שיתוף נוצר" : "Share link created");
    },
  });
  
  const revokeShareLink = trpc.trips.revokeShareLink.useMutation({
    onSuccess: () => {
      refetch();
      toast.success(language === "he" ? "קישור שיתוף בוטל" : "Share link revoked");
    },
  });

  const deleteTrip = trpc.trips.delete.useMutation({
    onSuccess: () => {
      toast.success(language === "he" ? "הטיול נמחק בהצלחה" : "Trip deleted successfully");
      navigate("/trips");
    },
    onError: () => {
      toast.error(language === "he" ? "שגיאה במחיקת הטיול" : "Error deleting trip");
    },
  });

  const handleDeleteTrip = () => {
    if (deleteConfirmation.toLowerCase() === "delete" || deleteConfirmation === "מחק") {
      deleteTrip.mutate({ id: tripId });
      setDeleteDialogOpen(false);
      setDeleteConfirmation("");
    } else {
      toast.error(language === "he" ? 'הקלד "מחק" לאישור' : 'Type "delete" to confirm');
    }
  };
  
  const shareUrl = trip?.shareToken 
    ? `${window.location.origin}/shared/${trip.shareToken}`
    : null;
  
  const copyToClipboard = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success(language === "he" ? "הקישור הועתק" : "Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            {language === "he" ? "הטיול לא נמצא" : "Trip not found"}
          </h2>
          <Link href="/trips">
            <Button>{t("back")}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getDaysCount = (start: number, end: number) => {
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  const tabs = [
    { id: "hotels", label: t("hotels"), icon: Hotel, color: "bg-blue-200 hover:bg-blue-300 data-[state=active]:bg-blue-500 data-[state=active]:text-white border-blue-300 data-[state=active]:border-blue-700" },
    { id: "transport", label: t("transportation"), icon: Plane, color: "bg-purple-200 hover:bg-purple-300 data-[state=active]:bg-purple-500 data-[state=active]:text-white border-purple-300 data-[state=active]:border-purple-700" },
    // { id: "cars", label: t("carRentals"), icon: Car, color: "bg-red-50 hover:bg-red-100 data-[state=active]:bg-red-300 data-[state=active]:text-red-950 border-red-200 data-[state=active]:border-red-600" }, // Removed - merged into Transportation
    { id: "sites", label: t("touristSites"), icon: MapPin, color: "bg-green-200 hover:bg-green-300 data-[state=active]:bg-green-500 data-[state=active]:text-white border-green-300 data-[state=active]:border-green-700" },
    { id: "restaurants", label: t("restaurants"), icon: Utensils, color: "bg-orange-200 hover:bg-orange-300 data-[state=active]:bg-orange-500 data-[state=active]:text-white border-orange-300 data-[state=active]:border-orange-700" },
    { id: "documents", label: t("documents"), icon: FileText, color: "bg-slate-200 hover:bg-slate-300 data-[state=active]:bg-slate-500 data-[state=active]:text-white border-slate-300 data-[state=active]:border-slate-700" },
    { id: "timeline", label: t("timeline"), icon: Clock, color: "bg-cyan-200 hover:bg-cyan-300 data-[state=active]:bg-cyan-500 data-[state=active]:text-white border-cyan-300 data-[state=active]:border-cyan-700" },
    { id: "routes", label: language === "he" ? "מפות מסלול" : "Route Maps", icon: Map, color: "bg-teal-200 hover:bg-teal-300 data-[state=active]:bg-teal-500 data-[state=active]:text-white border-teal-300 data-[state=active]:border-teal-700" },
    { id: "route_manager", label: language === "he" ? "ניהול מסלולים" : "Route Manager", icon: Navigation, color: "bg-indigo-200 hover:bg-indigo-300 data-[state=active]:bg-indigo-500 data-[state=active]:text-white border-indigo-300 data-[state=active]:border-indigo-700" },
    // { id: "daytrips", label: t("dayTrips"), icon: ArrowRight, color: "bg-pink-50 hover:bg-pink-100 data-[state=active]:bg-pink-300 data-[state=active]:text-pink-950 border-pink-200 data-[state=active]:border-pink-600" }, // Hidden temporarily
    { id: "checklist", label: language === "he" ? "רשימת משימות" : "Checklist", icon: CheckSquare, color: "bg-lime-200 hover:bg-lime-300 data-[state=active]:bg-lime-500 data-[state=active]:text-white border-lime-300 data-[state=active]:border-lime-700" },
    { id: "payments", label: language === "he" ? "תשלומים" : "Payments", icon: DollarSign, color: "bg-emerald-200 hover:bg-emerald-300 data-[state=active]:bg-emerald-500 data-[state=active]:text-white border-emerald-300 data-[state=active]:border-emerald-700" },
    { id: "budget", label: t("budget"), icon: DollarSign, color: "bg-amber-200 hover:bg-amber-300 data-[state=active]:bg-amber-500 data-[state=active]:text-white border-amber-300 data-[state=active]:border-amber-700" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/10">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link href="/trips">
              <Button variant="ghost" size="icon">
                <ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
              </Button>
            </Link>
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                  <Plane className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl hidden sm:block">{t("appName")}</span>
              </div>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <CollaboratorsDialog 
              tripId={tripId} 
              isOwner={trip?.userId === user?.id}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShareDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">{language === "he" ? "שתף" : "Share"}</span>
            </Button>
            {trip?.userId === user?.id && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">{language === "he" ? "מחק" : "Delete"}</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(language === "en" ? "he" : "en")}
              className="flex items-center gap-2"
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">{language === "en" ? "עברית" : "English"}</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Trip Header */}
        <div className="elegant-card p-6 mb-8">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-full">
              {/* Rainbow colored title */}
              <div className="mb-4">
                <h1 className="text-4xl md:text-5xl font-bold mb-2">
                  {trip.name.split('').map((char, i) => {
                    const colors = ['#FF6B6B', '#FFA500', '#FFD700', '#4CAF50', '#2196F3', '#9C27B0', '#E91E63'];
                    return (
                      <span key={i} style={{ color: colors[i % colors.length] }}>
                        {char}
                      </span>
                    );
                  })}
                </h1>
                <div className="flex items-center justify-center gap-2 text-2xl md:text-3xl text-muted-foreground">
                  <MapPin className="w-6 h-6" />
                  <span>{trip.destination}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-5 h-5" />
                  <span className="text-lg font-medium">
                    {format(new Date(trip.startDate), "MMM d")} - {format(new Date(trip.endDate), "MMM d, yyyy")}
                  </span>
                </div>
                <span className="bg-primary/10 text-primary px-4 py-2 rounded-full text-base font-medium">
                  {getDaysCount(trip.startDate, trip.endDate)} {t("days")}
                </span>
              </div>
              {trip.description && (
                <p className="mt-4 text-muted-foreground text-center">{trip.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Combined Tabs: Days (Row 1) + Activities (Row 2) */}
        <Tabs value={defaultTab} onValueChange={setDefaultTab} className="w-full">
          {/* Sticky Tab Container */}
          <div className="sticky top-16 z-20 bg-background/95 backdrop-blur-sm pb-4 pt-4 border-b border-border mb-6 shadow-sm">
            <TabsList className="w-full flex flex-col h-auto gap-4 bg-transparent p-0">
              {/* Row 1: Daily Tabs with Pastel Colors */}
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold text-muted-foreground px-1">
                  {language === "he" ? "ימים" : "Days"}
                </h3>
                <div className="flex flex-wrap gap-2">
                {(() => {
                  const daysCount = getDaysCount(trip.startDate, trip.endDate);
                  const pastelColors = [
                    'bg-pink-100 hover:bg-pink-200 data-[state=active]:bg-pink-400 data-[state=active]:text-pink-950 border-pink-200 data-[state=active]:border-pink-500 data-[state=active]:border-2 data-[state=active]:shadow-lg',
                    'bg-blue-100 hover:bg-blue-200 data-[state=active]:bg-blue-400 data-[state=active]:text-blue-950 border-blue-200 data-[state=active]:border-blue-500 data-[state=active]:border-2 data-[state=active]:shadow-lg',
                    'bg-green-100 hover:bg-green-200 data-[state=active]:bg-green-400 data-[state=active]:text-green-950 border-green-200 data-[state=active]:border-green-500 data-[state=active]:border-2 data-[state=active]:shadow-lg',
                    'bg-yellow-100 hover:bg-yellow-200 data-[state=active]:bg-yellow-400 data-[state=active]:text-yellow-950 border-yellow-200 data-[state=active]:border-yellow-500 data-[state=active]:border-2 data-[state=active]:shadow-lg',
                    'bg-purple-100 hover:bg-purple-200 data-[state=active]:bg-purple-400 data-[state=active]:text-purple-950 border-purple-200 data-[state=active]:border-purple-500 data-[state=active]:border-2 data-[state=active]:shadow-lg',
                    'bg-orange-100 hover:bg-orange-200 data-[state=active]:bg-orange-400 data-[state=active]:text-orange-950 border-orange-200 data-[state=active]:border-orange-500 data-[state=active]:border-2 data-[state=active]:shadow-lg',
                    'bg-teal-100 hover:bg-teal-200 data-[state=active]:bg-teal-400 data-[state=active]:text-teal-950 border-teal-200 data-[state=active]:border-teal-500 data-[state=active]:border-2 data-[state=active]:shadow-lg',
                    'bg-indigo-100 hover:bg-indigo-200 data-[state=active]:bg-indigo-400 data-[state=active]:text-indigo-950 border-indigo-200 data-[state=active]:border-indigo-500 data-[state=active]:border-2 data-[state=active]:shadow-lg',
                  ];
                  return Array.from({ length: daysCount }, (_, i) => {
                    const dayDate = new Date(trip.startDate);
                    dayDate.setDate(dayDate.getDate() + i);
                    const dayTimestamp = dayDate.getTime();
                    const colorClass = pastelColors[i % pastelColors.length];
                    return (
                      <TabsTrigger
                        key={`day-${dayTimestamp}`}
                        value={`day-${dayTimestamp}`}
                        className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-md border text-sm transition-all font-medium min-w-[60px] ${colorClass}`}
                      >
                        {/* Mobile: numbers only */}
                        <span className="md:hidden text-base font-bold">{i + 1}</span>
                        {/* Desktop: full format */}
                        <span className="hidden md:inline text-sm font-medium">
                          {language === "he" ? `יום ${i + 1} - ${format(dayDate, "MMM d")}` : `Day ${i + 1} - ${format(dayDate, "MMM d")}`}
                        </span>
                      </TabsTrigger>
                    );
                  });
                })()}
                </div>

              {/* Row 2: Activity Category Tabs */}
              <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className={`flex flex-col items-center justify-center gap-0.5 px-2 py-2 rounded-lg border transition-all data-[state=active]:border-[3px] data-[state=active]:shadow-lg flex-1 min-w-[80px] ${tab.color}`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="hidden md:block text-[10px] font-medium text-center leading-tight break-words overflow-hidden">{tab.label}</span>
                  </TabsTrigger>
                ))}
              </div>
              </div>
            </TabsList>
          </div>

          {/* Daily Content */}
          {Array.from({ length: getDaysCount(trip.startDate, trip.endDate) }, (_, i) => {
            const dayDate = new Date(trip.startDate);
            dayDate.setDate(dayDate.getDate() + i);
            const dayTimestamp = dayDate.getTime();
            return (
              <TabsContent key={`day-content-${dayTimestamp}`} value={`day-${dayTimestamp}`}>
                <DailyView 
                  tripId={tripId} 
                  date={dayTimestamp} 
                  onTabChange={(tabId, activityId) => {
                    setDefaultTab(tabId);
                    if (activityId) {
                      setHighlightedActivityId(activityId);
                      // Clear highlight after 3 seconds
                      setTimeout(() => setHighlightedActivityId(null), 3000);
                    }
                  }} 
                />
              </TabsContent>
            );
          })}

          <TabsContent value="sites">
            <TouristSitesTab tripId={tripId} highlightedId={highlightedActivityId} />
          </TabsContent>

          <TabsContent value="hotels">
            <HotelsTab tripId={tripId} highlightedId={highlightedActivityId} />
          </TabsContent>

          <TabsContent value="transport">
            <TransportationTab tripId={tripId} highlightedId={highlightedActivityId} />
          </TabsContent>

          <TabsContent value="restaurants">
            <RestaurantsTab tripId={tripId} highlightedId={highlightedActivityId} />
          </TabsContent>

          <TabsContent value="documents">
            <DocumentsTab tripId={tripId} />
          </TabsContent>

          <TabsContent value="timeline">
            <TimelineTab tripId={tripId} />
          </TabsContent>

          <TabsContent value="routes">
            <AllRouteMapsTab tripId={tripId} />
          </TabsContent>

          <TabsContent value="route_manager">
            <RouteManager tripId={tripId} />
          </TabsContent>

          <TabsContent value="daytrips">
            <DayTripsTab tripId={tripId} />
          </TabsContent>

          <TabsContent value="checklist">
            <ChecklistTab tripId={tripId} />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentsTab tripId={tripId} />
          </TabsContent>

          <TabsContent value="budget">
            <BudgetTab tripId={tripId} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              {language === "he" ? "שתף טיול" : "Share Trip"}
            </DialogTitle>
            <DialogDescription>
              {language === "he" 
                ? "צור קישור ציבורי לצפייה בטיול. כל מי שיש לו את הקישור יוכל לראות את הטיול (ללא אפשרות עריכה)."
                : "Create a public link to view this trip. Anyone with the link can see the trip (read-only)."
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {shareUrl ? (
              <>
                <div className="flex items-center gap-2">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="flex-1 text-sm"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={copyToClipboard}
                  >
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => revokeShareLink.mutate({ id: tripId })}
                  disabled={revokeShareLink.isPending}
                >
                  <X className="w-4 h-4 mr-2" />
                  {language === "he" ? "בטל קישור שיתוף" : "Revoke Share Link"}
                </Button>
              </>
            ) : (
              <Button
                className="w-full"
                onClick={() => generateShareLink.mutate({ id: tripId })}
                disabled={generateShareLink.isPending}
              >
                <Share2 className="w-4 h-4 mr-2" />
                {language === "he" ? "צור קישור שיתוף" : "Create Share Link"}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Trip Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              {language === "he" ? "מחק טיול" : "Delete Trip"}
            </DialogTitle>
            <DialogDescription>
              {language === "he" 
                ? "פעולה זו לא ניתנת לביטול! כל הנתונים ימחקו לצמיתות."
                : "This action cannot be undone! All data will be permanently deleted."
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === "he" 
                  ? 'הקלד "מחק" לאישור:'
                  : 'Type "delete" to confirm:'
                }
              </label>
              <Input
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder={language === "he" ? "מחק" : "delete"}
                className="text-center font-bold"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setDeleteConfirmation("");
                }}
              >
                {language === "he" ? "ביטול" : "Cancel"}
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleDeleteTrip}
                disabled={deleteTrip.isPending}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {deleteTrip.isPending 
                  ? (language === "he" ? "מוחק..." : "Deleting...") 
                  : (language === "he" ? "מחק לצמיתות" : "Delete Permanently")
                }
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Floating Scroll-to-Top Button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-8 left-8 z-[100] rounded-full w-14 h-14 p-0 shadow-2xl hover:shadow-xl transition-all hover:scale-110"
          size="icon"
        >
          <ArrowRight className={`w-6 h-6 ${isRTL ? 'rotate-90' : '-rotate-90'}`} />
        </Button>
      )}
    </div>
  );
}
