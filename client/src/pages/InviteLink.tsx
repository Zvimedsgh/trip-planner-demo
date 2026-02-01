import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLoginUrl } from "@/const";

export default function InviteLink() {
  const { token } = useParams<{ token: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { language } = useLanguage();

  const { data: trip } = trpc.trips.getByShareToken.useQuery(
    { token: token || "" },
    { enabled: !!token }
  );

  const joinTripMutation = trpc.collaborators.joinViaInvite.useMutation({
    onSuccess: (data) => {
      // Redirect to the trip page
      navigate(`/trip/${data.tripId}`);
    },
    onError: (error) => {
      console.error("Failed to join trip:", error);
      // Still redirect to trip page - they might already be a collaborator
      if (trip) {
        navigate(`/trip/${trip.id}`);
      }
    },
  });

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    // If user is not logged in, redirect to login with return URL
    if (!user) {
      const returnUrl = `${window.location.origin}/invite/${token}`;
      window.location.href = `${getLoginUrl()}?redirect=${encodeURIComponent(returnUrl)}`;
      return;
    }

    // If user is logged in and trip is loaded, auto-add them as collaborator
    if (user && trip) {
      joinTripMutation.mutate({ token });
    }
  }, [user, trip, token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
        <h2 className="text-2xl font-semibold">
          {language === "he" ? "מצטרף לטיול..." : "Joining trip..."}
        </h2>
        <p className="text-muted-foreground">
          {language === "he" 
            ? "אנא המתן בזמן שאנחנו מוסיפים אותך כמשתתף"
            : "Please wait while we add you as a participant"
          }
        </p>
      </div>
    </div>
  );
}
