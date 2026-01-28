import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import PaymentManager from "./PaymentManager";
import { Hotel, Plane, Car, UtensilsCrossed, MapPin } from "lucide-react";

interface PaymentsTabProps {
  tripId: number;
}

export default function PaymentsTab({ tripId }: PaymentsTabProps) {
  const { language } = useLanguage();
  
  const { data: hotels = [] } = trpc.hotels.list.useQuery({ tripId });
  const { data: transportation = [] } = trpc.transportation.list.useQuery({ tripId });
  const { data: carRentals = [] } = trpc.carRentals.list.useQuery({ tripId });
  const { data: restaurants = [] } = trpc.restaurants.list.useQuery({ tripId });
  const { data: touristSites = [] } = trpc.touristSites.list.useQuery({ tripId });

  // Combine all activities with prices
  const activities = [
    ...hotels
      .filter(h => h.price && parseFloat(h.price) > 0)
      .map(h => ({
        id: h.id,
        type: "hotel" as const,
        name: h.name,
        price: parseFloat(h.price!),
        currency: h.currency || "USD",
        icon: Hotel,
        color: "text-blue-600",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
      })),
    ...transportation
      .filter(t => t.price && parseFloat(t.price) > 0)
      .map(t => ({
        id: t.id,
        type: "transportation" as const,
        name: `${t.origin} → ${t.destination}`,
        price: parseFloat(t.price!),
        currency: t.currency || "USD",
        icon: Plane,
        color: "text-green-600",
        bgColor: "bg-green-50 dark:bg-green-900/20",
      })),
    ...carRentals
      .filter(c => c.price && parseFloat(c.price) > 0)
      .map(c => ({
        id: c.id,
        type: "car_rental" as const,
        name: `${c.company} - Car Rental`,
        price: parseFloat(c.price!),
        currency: c.currency || "USD",
        icon: Car,
        color: "text-purple-600",
        bgColor: "bg-purple-50 dark:bg-purple-900/20",
      })),
    ...restaurants
      .filter(r => r.price && parseFloat(r.price) > 0)
      .map(r => ({
        id: r.id,
        type: "restaurant" as const,
        name: r.name,
        price: parseFloat(r.price!),
        currency: r.currency || "USD",
        icon: UtensilsCrossed,
        color: "text-orange-600",
        bgColor: "bg-orange-50 dark:bg-orange-900/20",
      })),
  ];

  // Sort by price descending
  activities.sort((a, b) => b.price - a.price);

  if (activities.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>{language === "he" ? "אין פעילויות עם מחירים" : "No activities with prices"}</p>
        <p className="text-sm mt-2">
          {language === "he" 
            ? "הוסף מחירים למלונות, טיסות, רכב שכור או מסעדות כדי לעקוב אחרי תשלומים"
            : "Add prices to hotels, flights, car rentals, or restaurants to track payments"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        {language === "he" 
          ? `${activities.length} פעילויות עם מחירים`
          : `${activities.length} activities with prices`}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <Card key={`${activity.type}-${activity.id}`} className="overflow-hidden">
              <CardHeader className={`${activity.bgColor} pb-3`}>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className={`w-5 h-5 ${activity.color}`} />
                  <span className="truncate">{activity.name}</span>
                </CardTitle>
                <div className="text-sm text-muted-foreground capitalize">
                  {activity.type.replace(/_/g, " ")}
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <PaymentManager
                  tripId={tripId}
                  activityType={activity.type}
                  activityId={activity.id}
                  totalPrice={activity.price}
                  currency={activity.currency}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
