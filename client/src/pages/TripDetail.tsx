import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { 
  ArrowLeft, Calendar, Car, DollarSign, FileText, Globe, 
  Hotel, Loader2, MapPin, Plane, Utensils, Clock, ArrowRight, Share2, Copy, Check, X, Map, UserPlus, Users, Trash2
} from "lucide-react";
import { useState } from "react";
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
import CarRentalsTab from "@/components/trip/CarRentalsTab";
import RestaurantsTab from "@/components/trip/RestaurantsTab";
import DocumentsTab from "@/components/trip/DocumentsTab";
import TimelineTab from "@/components/trip/TimelineTab";
import BudgetTab from "@/components/trip/BudgetTab";
import { RouteMapTab } from "@/components/trip/RouteMapTab";
import DayTripsTab from "@/components/trip/DayTripsTab";

export default function TripDetail() {
  const params = useParams<{ id: string }>();
  const tripId = parseInt(params.id || "0");
  const [, navigate] = useLocation();
  const { t, language, setLanguage, isRTL } = useLanguage();
  const { user } = useAuth();

  const { data: trip, isLoading, refetch } = trpc.trips.get.useQuery({ id: tripId });
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [collaboratorEmail, setCollaboratorEmail] = useState("");
  const [activeTab, setActiveTab] = useState<"link" | "collaborators">("link");
  
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
  
  const { data: collaborators, refetch: refetchCollaborators } = trpc.trips.listCollaborators.useQuery(
    { tripId },
    { enabled: shareDialogOpen }
  );
  
  const addCollaborator = trpc.trips.addCollaborator.useMutation({
    onSuccess: () => {
      refetchCollaborators();
      setCollaboratorEmail("");
      toast.success(language === "he" ? "משתף נוסף בהצלחה" : "Collaborator added successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const removeCollaborator = trpc.trips.removeCollaborator.useMutation({
    onSuccess: () => {
      refetchCollaborators();
      toast.success(language === "he" ? "משתף הוסר" : "Collaborator removed");
    },
  });
  
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
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };

  const tabs = [
    { id: "transport", label: t("transportation"), icon: Plane },
    { id: "hotels", label: t("hotels"), icon: Hotel },
    { id: "cars", label: t("carRentals"), icon: Car },
    { id: "sites", label: t("touristSites"), icon: MapPin },
    { id: "restaurants", label: t("restaurants"), icon: Utensils },
    { id: "documents", label: t("documents"), icon: FileText },
    { id: "timeline", label: t("timeline"), icon: Clock },
    { id: "route", label: language === "he" ? "מפת מסלול" : "Route Map", icon: Map },
    { id: "daytrips", label: t("dayTrips"), icon: ArrowRight },
    { id: "budget", label: t("budget"), icon: DollarSign },
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShareDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">{language === "he" ? "שתף" : "Share"}</span>
            </Button>
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{trip.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{trip.destination}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {format(new Date(trip.startDate), "MMM d")} - {format(new Date(trip.endDate), "MMM d, yyyy")}
                  </span>
                </div>
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                  {getDaysCount(trip.startDate, trip.endDate)} {t("days")}
                </span>
              </div>
              {trip.description && (
                <p className="mt-4 text-muted-foreground">{trip.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="sites" className="w-full">
          <TabsList className="w-full flex flex-wrap h-auto gap-2 bg-transparent p-0 mb-6">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2 rounded-lg border border-border data-[state=active]:border-primary transition-all"
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="sites">
            <TouristSitesTab tripId={tripId} />
          </TabsContent>

          <TabsContent value="hotels">
            <HotelsTab tripId={tripId} />
          </TabsContent>

          <TabsContent value="transport">
            <TransportationTab tripId={tripId} />
          </TabsContent>

          <TabsContent value="cars">
            <CarRentalsTab tripId={tripId} />
          </TabsContent>

          <TabsContent value="restaurants">
            <RestaurantsTab tripId={tripId} />
          </TabsContent>

          <TabsContent value="documents">
            <DocumentsTab tripId={tripId} />
          </TabsContent>

          <TabsContent value="timeline">
            <TimelineTab tripId={tripId} />
          </TabsContent>

          <TabsContent value="budget">
            <BudgetTab tripId={tripId} />
          </TabsContent>

          <TabsContent value="route">
            <RouteMapTab tripId={tripId} />
          </TabsContent>

          <TabsContent value="daytrips">
            <DayTripsTab tripId={tripId} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              {language === "he" ? "שתף טיול" : "Share Trip"}
            </DialogTitle>
          </DialogHeader>
          
          {/* Tabs for Link vs Collaborators */}
          <div className="flex gap-2 border-b">
            <button
              onClick={() => setActiveTab("link")}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === "link" 
                  ? "text-primary border-b-2 border-primary" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {language === "he" ? "קישור ציבורי" : "Public Link"}
            </button>
            <button
              onClick={() => setActiveTab("collaborators")}
              className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${
                activeTab === "collaborators" 
                  ? "text-primary border-b-2 border-primary" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users className="w-4 h-4" />
              {language === "he" ? "משתפים" : "Collaborators"}
              {collaborators && collaborators.length > 0 && (
                <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs">
                  {collaborators.length}
                </span>
              )}
            </button>
          </div>
          
          <div className="space-y-4 py-4">
            {activeTab === "link" ? (
              <>
                <DialogDescription>
                  {language === "he" 
                    ? "צור קישור ציבורי לצפייה בטיול. כל מי שיש לו את הקישור יוכל לראות את הטיול (ללא אפשרות עריכה)."
                    : "Create a public link to view this trip. Anyone with the link can see the trip (read-only)."
                  }
                </DialogDescription>
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
              </>
            ) : (
              <>
                <DialogDescription>
                  {language === "he" 
                    ? "הזמן אנשים לערוך את הטיול איתך. הם יוכלו להוסיף ולשנות מלונות, אתרים, מסעדות ועוד."
                    : "Invite people to edit this trip with you. They can add and modify hotels, sites, restaurants, and more."
                  }
                </DialogDescription>
                
                {/* Add Collaborator Form */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {language === "he" ? "הוסף משתף לפי אימייל" : "Add collaborator by email"}
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder={language === "he" ? "example@email.com" : "example@email.com"}
                      value={collaboratorEmail}
                      onChange={(e) => setCollaboratorEmail(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && collaboratorEmail.trim()) {
                          addCollaborator.mutate({ 
                            tripId, 
                            userEmail: collaboratorEmail.trim(),
                            permission: "edit"
                          });
                        }
                      }}
                    />
                    <Button
                      onClick={() => {
                        if (collaboratorEmail.trim()) {
                          addCollaborator.mutate({ 
                            tripId, 
                            userEmail: collaboratorEmail.trim(),
                            permission: "edit"
                          });
                        }
                      }}
                      disabled={!collaboratorEmail.trim() || addCollaborator.isPending}
                    >
                      <UserPlus className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {language === "he" 
                      ? `ניתן להוסיף עד 3 משתפים. נוספו: ${collaborators?.length || 0}/3`
                      : `You can add up to 3 collaborators. Added: ${collaborators?.length || 0}/3`
                    }
                  </p>
                </div>
                
                {/* Collaborators List */}
                {collaborators && collaborators.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {language === "he" ? "משתפים נוכחיים" : "Current collaborators"}
                    </label>
                    <div className="space-y-2">
                      {collaborators.map((collab) => (
                        <div key={collab.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-medium">
                              {collab.userName?.charAt(0).toUpperCase() || collab.userEmail?.charAt(0).toUpperCase() || "?"}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{collab.userName || collab.userEmail}</p>
                              {collab.userName && collab.userEmail && (
                                <p className="text-xs text-muted-foreground">{collab.userEmail}</p>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeCollaborator.mutate({ tripId, userId: collab.userId })}
                            disabled={removeCollaborator.isPending}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
