import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

export default function Demo() {
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(true);

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      // After logout, initialize demo
      setIsLoggingOut(false);
      initializeMutation.mutate();
    },
    onError: () => {
      // Even if logout fails (no session), proceed with demo initialization
      setIsLoggingOut(false);
      initializeMutation.mutate();
    },
  });

  const initializeMutation = trpc.demo.initialize.useMutation({
    onSuccess: () => {
      // Redirect to home page after successful initialization
      // Use full page reload to ensure cookie is loaded
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    },
    onError: (err: any) => {
      setError(err.message || "Failed to initialize demo. Please try again.");
    },
  });

  useEffect(() => {
    // First logout any existing user, then initialize demo
    logoutMutation.mutate();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center space-y-4 p-8">
          <div className="text-red-500 text-xl font-semibold">
            {error}
          </div>
          <button
            onClick={() => setLocation("/")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center space-y-6 p-8">
        <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto" />
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">
            Setting up your demo...
          </h1>
          <p className="text-gray-600">
            Creating your demo account and sample trip
          </p>
        </div>
      </div>
    </div>
  );
}
