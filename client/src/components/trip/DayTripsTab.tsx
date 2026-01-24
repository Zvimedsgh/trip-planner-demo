import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { Calendar, Loader2, MapPin, Plus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface DayTripsTabProps {
  tripId: number;
}

export default function DayTripsTab({ tripId }: DayTripsTabProps) {
  const { t, language } = useLanguage();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const utils = trpc.useUtils();
  const { data: dayTrips, isLoading } = trpc.dayTrips.list.useQuery({ tripId });

  const createMutation = trpc.dayTrips.create.useMutation({
    onSuccess: () => {
      utils.dayTrips.list.invalidate({ tripId });
      setIsCreateOpen(false);
      if (formRef.current) formRef.current.reset();
      toast.success(t("dayTripCreated"));
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.dayTrips.delete.useMutation({
    onSuccess: () => {
      utils.dayTrips.list.invalidate({ tripId });
      toast.success(t("dayTripDeleted"));
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const startDate = formData.get("startDate") as string;
    const startTimeStr = formData.get("startTime") as string;
    const endDate = formData.get("endDate") as string;
    const endTimeStr = formData.get("endTime") as string;

    const startTime = new Date(`${startDate}T${startTimeStr}`).getTime();
    const endTime = new Date(`${endDate}T${endTimeStr}`).getTime();

    const data = {
      tripId,
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || undefined,
      startLocation: formData.get("startLocation") as string,
      endLocation: formData.get("endLocation") as string,
      startTime,
      endTime,
      stops: (formData.get("stops") as string) || undefined,
      notes: (formData.get("notes") as string) || undefined,
    };

    createMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t("dayTrips")}</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t("newDayTrip")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("createDayTrip")}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} ref={formRef}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">{t("tripName")}</Label>
                  <Input id="name" name="name" required placeholder={t("dayTripNamePlaceholder")} />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="description">{t("description")}</Label>
                  <Textarea id="description" name="description" placeholder={t("dayTripDescriptionPlaceholder")} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startLocation">{t("startLocation")}</Label>
                    <Input id="startLocation" name="startLocation" required placeholder={t("startLocationPlaceholder")} />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="endLocation">{t("endLocation")}</Label>
                    <Input id="endLocation" name="endLocation" required placeholder={t("endLocationPlaceholder")} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startDate">{t("startDate")}</Label>
                    <Input id="startDate" name="startDate" type="date" required />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="startTime">{t("startTime")}</Label>
                    <Input id="startTime" name="startTime" type="time" required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="endDate">{t("endDate")}</Label>
                    <Input id="endDate" name="endDate" type="date" required />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="endTime">{t("endTime")}</Label>
                    <Input id="endTime" name="endTime" type="time" required />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="stops">{t("stops")}</Label>
                  <Textarea 
                    id="stops" 
                    name="stops" 
                    placeholder={t("stopsPlaceholder")}
                    rows={5}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="notes">{t("notes")}</Label>
                  <Textarea id="notes" name="notes" placeholder={t("notesPlaceholder")} />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("create")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Day Trips List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {dayTrips && dayTrips.length > 0 ? (
          dayTrips.map((dayTrip, index) => {
            const gradients = [
              "from-emerald-500 via-teal-500 to-cyan-500",
              "from-violet-500 via-purple-500 to-fuchsia-500",
              "from-amber-500 via-orange-500 to-red-500",
              "from-rose-500 via-pink-500 to-purple-500",
              "from-blue-500 via-indigo-500 to-violet-500",
              "from-green-500 via-emerald-500 to-teal-500",
            ];
            const gradient = gradients[index % gradients.length];

            return (
              <Card key={dayTrip.id} className={`overflow-hidden bg-gradient-to-br ${gradient} text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold">{dayTrip.name}</h3>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-white hover:bg-white/20"
                        onClick={() => {
                          if (window.confirm(language === "he" ? "האם אתה בטוח שברצונך למחוק את הטיול היומי?" : "Are you sure you want to delete this day trip?")) {
                            deleteMutation.mutate({ id: dayTrip.id });
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {dayTrip.description && (
                    <p className="text-white/90 text-sm mb-4">{dayTrip.description}</p>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4" />
                      <span>{dayTrip.startLocation} &rarr; {dayTrip.endLocation}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(dayTrip.startTime), "MMM d, HH:mm")} - {format(new Date(dayTrip.endTime), "HH:mm")}
                      </span>
                    </div>

                    {dayTrip.stops && (
                      <div className="mt-4 pt-4 border-t border-white/20">
                        <p className="text-xs font-semibold mb-2">{t("stops")}:</p>
                        <p className="text-xs text-white/80 whitespace-pre-line">{dayTrip.stops}</p>
                      </div>
                    )}

                    {dayTrip.notes && (
                      <div className="mt-3 pt-3 border-t border-white/20">
                        <p className="text-xs text-white/80">{dayTrip.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <p>{t("noDayTrips")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
