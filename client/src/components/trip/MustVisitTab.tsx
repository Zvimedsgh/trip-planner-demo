import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Navigation, Star, MapPin } from "lucide-react";
import { toast } from "sonner";

interface MustVisitTabProps {
  tripId: number;
}

export default function MustVisitTab({ tripId }: MustVisitTabProps) {
  const { language } = useLanguage();
  
  const { data: pois, refetch } = trpc.mustVisitPOIs.list.useQuery({ tripId });
  
  const deleteMutation = trpc.mustVisitPOIs.delete.useMutation({
    onSuccess: () => {
      toast.success(language === "he" ? "נמחק מהרשימה" : "Removed from list");
      refetch();
    },
    onError: () => {
      toast.error(language === "he" ? "שגיאה במחיקה" : "Error deleting");
    },
  });

  if (!pois || pois.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Star className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {language === "he" ? "אין נקודות עניין שמורות" : "No Saved Points of Interest"}
          </h3>
          <p className="text-gray-500">
            {language === "he" 
              ? "שמור נקודות עניין מהמפות כדי לראות אותן כאן"
              : "Save points of interest from route maps to see them here"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-6 h-6 text-yellow-500" />
        <h2 className="text-2xl font-bold">
          {language === "he" ? "Must Visit - נקודות עניין מועדפות" : "Must Visit - Favorite Points of Interest"}
        </h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pois.map((poi: any) => (
          <Card key={poi.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ backgroundColor: poi.categoryColor || "#6b7280" }}
                >
                  {poi.categoryIcon || "📍"}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1">{poi.name}</h3>
                  <p className="text-xs text-gray-500 mb-2">{poi.category}</p>
                  {poi.rating && (
                    <div className="flex items-center gap-1 text-sm mb-2">
                      <span className="text-yellow-500">⭐</span>
                      <span className="font-medium">{poi.rating}</span>
                    </div>
                  )}
                  {poi.address && (
                    <div className="flex items-start gap-1 text-xs text-gray-600 mb-3">
                      <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{poi.address}</span>
                    </div>
                  )}
                  {poi.notes && (
                    <p className="text-sm text-gray-700 italic mb-3 line-clamp-2">"{poi.notes}"</p>
                  )}
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${poi.latitude},${poi.longitude}${poi.placeId ? `&query_place_id=${poi.placeId}` : ''}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <Navigation className="w-3 h-3" />
                      {language === "he" ? "נווט" : "Navigate"}
                    </a>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate({ id: poi.id })}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 h-6 px-2"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
