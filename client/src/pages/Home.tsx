import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { 
  Plane, MapPin, Hotel, Car, Utensils, FileText, 
  Calendar, DollarSign, Globe, ArrowRight, Sparkles, Plus
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const { t, language, setLanguage, isRTL } = useLanguage();
  const [, navigate] = useLocation();
  const [scrollY, setScrollY] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTripName, setNewTripName] = useState("");
  const [newTripDestination, setNewTripDestination] = useState("");
  const [newTripStartDate, setNewTripStartDate] = useState("");
  const [newTripEndDate, setNewTripEndDate] = useState("");
  
  // Reset and set default dates when dialog opens (iPhone fix)
  useEffect(() => {
    if (createDialogOpen) {
      // Clear all fields
      setNewTripName("");
      setNewTripDestination("");
      
      // Set default dates: today and 7 days from now
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      
      setNewTripStartDate(today.toISOString().split('T')[0]);
      setNewTripEndDate(nextWeek.toISOString().split('T')[0]);
    }
  }, [createDialogOpen]);

  
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const { data: trips } = trpc.trips.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  
  const createTripMutation = trpc.trips.create.useMutation({
    onSuccess: (newTrip) => {
      toast.success(language === 'he' ? 'הטיול נוצר בהצלחה!' : 'Trip created successfully!');
      setCreateDialogOpen(false);
      setNewTripName("");
      setNewTripDestination("");
      setNewTripStartDate("");
      setNewTripEndDate("");
      navigate(`/trip/${newTrip.id}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const handleCreateTrip = () => {
    if (!newTripName || !newTripDestination || !newTripStartDate || !newTripEndDate) {
      toast.error(language === 'he' ? 'נא למלא את כל השדות' : 'Please fill in all fields');
      return;
    }
    
    createTripMutation.mutate({
      name: newTripName,
      destination: newTripDestination,
      startDate: new Date(newTripStartDate).getTime(),
      endDate: new Date(newTripEndDate).getTime(),
    });
  };
  
  // Get destination image based on destination name
  const getDestinationImage = (destination: string): string => {
    const dest = destination.toLowerCase();
    if (dest.includes('slovakia') || dest.includes('bratislava')) return '/slovakia.jpg';
    if (dest.includes('paris') || dest.includes('france')) return '/travel-2.jpg';
    if (dest.includes('greece') || dest.includes('athens')) return '/travel-3.jpg';
    if (dest.includes('italy') || dest.includes('rome')) return '/travel-1.jpg';
    return '/travel-1.jpg'; // default
  };

  // Sort trips by start date (most recent first)
  const sortedTrips = trips ? [...trips].sort((a, b) => b.startDate - a.startDate) : [];
  
  const getDaysCount = (start: number, end: number) => {
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  const features = [
    { icon: Plane, title: t("featureTrips"), desc: t("featureTripsDesc"), color: "from-blue-500 to-indigo-600" },
    { icon: MapPin, title: t("featureSites"), desc: t("featureSitesDesc"), color: "from-emerald-500 to-teal-600" },
    { icon: Hotel, title: t("featureHotels"), desc: t("featureHotelsDesc"), color: "from-amber-500 to-orange-600" },
    { icon: Car, title: t("featureTransport"), desc: t("featureTransportDesc"), color: "from-purple-500 to-violet-600" },
    { icon: Utensils, title: t("featureRestaurants"), desc: t("featureRestaurantsDesc"), color: "from-rose-500 to-pink-600" },
    { icon: FileText, title: t("featureDocs"), desc: t("featureDocsDesc"), color: "from-cyan-500 to-blue-600" },
    { icon: Calendar, title: t("timelineView"), desc: "View all activities chronologically", color: "from-indigo-500 to-purple-600" },
    { icon: DollarSign, title: t("featureBudget"), desc: t("featureBudgetDesc"), color: "from-green-500 to-emerald-600" },
  ];

  const destinations = [
    { 
      image: "/travel-1.jpg", 
      title: "Discover Amazing Places",
      subtitle: "From mountains to beaches"
    },
    { 
      image: "/travel-2.jpg", 
      title: "Explore the World",
      subtitle: "Natural wonders await"
    },
    { 
      image: "/travel-3.jpg", 
      title: "Create Memories",
      subtitle: "Adventures of a lifetime"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">{t("appName")}</span>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(language === "en" ? "he" : "en")}
              className="flex items-center gap-2"
            >
              <Globe className="w-4 h-4" />
              <span>{language === "en" ? "עברית" : "English"}</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Plan your perfect adventure</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="gradient-text">{t("heroTitle")}</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              {t("heroSubtitle")}
            </p>
            

          </div>
          
          {/* Travel Destination Images */}
          <div className="relative mt-20 max-w-6xl mx-auto">
            <div className="absolute -top-10 -left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
            <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
            
            {/* Trip Cards Gallery */}
            <div className="relative grid md:grid-cols-3 gap-6">
              {/* Display all trips dynamically */}
              {sortedTrips.map((trip, index) => (
                <Card 
                  key={trip.id}
                  className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer h-80"
                  onClick={() => navigate(`/trip/${trip.id}`)}
                  style={{ transform: `translateY(${scrollY * (0.05 + (index % 3) * 0.025)}px)` }}
                >
                  <img 
                    src={trip.coverImage || getDestinationImage(trip.destination)} 
                    alt={trip.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="relative h-full flex flex-col justify-between p-6">
                    <div className="text-white text-center">
                      <h3 className="text-3xl font-bold mb-2 leading-tight">
                        {trip.name}
                      </h3>
                      <div className="flex items-center gap-2 justify-center text-white/90">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{trip.destination}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-base text-white/90 justify-center">
                        <Calendar className="w-5 h-5" />
                        <span className="font-semibold">
                          {format(new Date(trip.startDate), "MMM d")} - {format(new Date(trip.endDate), "MMM d, yyyy")}
                        </span>
                        <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">
                          {getDaysCount(trip.startDate, trip.endDate)} {t("days")}
                        </span>
                      </div>
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 text-lg font-semibold py-6">
                        {t("tripDetails")}
                        <ArrowRight className={`w-5 h-5 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              
              {/* Add New Trip Card */}
              <Card 
                className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer h-80"
                onClick={() => isAuthenticated ? setCreateDialogOpen(true) : window.location.href = getLoginUrl()}
                style={{ transform: `translateY(${scrollY * 0.05}px)` }}
              >
                <img 
                  src='/travel-3.jpg' 
                  alt="Create New Trip"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="relative h-full flex flex-col items-center justify-center p-6 text-white">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Plus className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{language === 'he' ? 'טיול חדש' : 'New Trip'}</h3>
                  <p className="text-white/80 text-sm text-center">{language === 'he' ? 'לחץ להתחלת תכנון טיול חדש' : 'Click to start planning a new trip'}</p>
                </div>
              </Card>

            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("features")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to plan and organize your perfect trip
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="elegant-card-hover p-6 group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container">
          <div className="elegant-card p-12 text-center bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {isAuthenticated ? t("welcome") + ", " + (user?.name || "Traveler") + "!" : t("loginToStart")}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Start organizing your next adventure today with our elegant and intuitive trip planner.
            </p>
            {isAuthenticated ? (
              <Link href="/trips">
                <Button size="lg" className="btn-elegant">
                  {t("myTrips")}
                  <ArrowRight className={`w-5 h-5 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} />
                </Button>
              </Link>
            ) : (
              <a href={getLoginUrl()}>
                <Button size="lg" className="btn-elegant">
                  {t("getStarted")}
                  <ArrowRight className={`w-5 h-5 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} />
                </Button>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Create Trip Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{language === 'he' ? 'צור טיול חדש' : 'Create New Trip'}</DialogTitle>
            <DialogDescription>
              {language === 'he' ? 'הזן את פרטי הטיול החדש שלך' : 'Enter the details of your new trip'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{language === 'he' ? 'שם הטיול' : 'Trip Name'}</Label>
              <Input
                id="name"
                placeholder={language === 'he' ? 'למשל: טיול משפחתי לאיטליה' : 'e.g., Family Trip to Italy'}
                value={newTripName}
                onChange={(e) => setNewTripName(e.target.value)}
                autoComplete="off"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="destination">{language === 'he' ? 'יעד' : 'Destination'}</Label>
              <Input
                id="destination"
                placeholder={language === 'he' ? 'למשל: רומא, איטליה' : 'e.g., Rome, Italy'}
                value={newTripDestination}
                onChange={(e) => setNewTripDestination(e.target.value)}
                autoComplete="off"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="startDate">{language === 'he' ? 'תאריך התחלה' : 'Start Date'}</Label>
              <Input
                id="startDate"
                type="date"
                value={newTripStartDate}
                onChange={(e) => setNewTripStartDate(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endDate">{language === 'he' ? 'תאריך סיום' : 'End Date'}</Label>
              <Input
                id="endDate"
                type="date"
                value={newTripEndDate}
                onChange={(e) => setNewTripEndDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              {language === 'he' ? 'ביטול' : 'Cancel'}
            </Button>
            <Button onClick={handleCreateTrip} disabled={createTripMutation.isPending}>
              {createTripMutation.isPending ? (language === 'he' ? 'יוצר...' : 'Creating...') : (language === 'he' ? 'צור טיול' : 'Create Trip')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <Plane className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold">{t("appName")}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 Trip Planner Pro. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
