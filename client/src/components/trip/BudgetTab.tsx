import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Car, DollarSign, Hotel, Loader2, Plane, PieChart } from "lucide-react";

interface BudgetTabProps {
  tripId: number;
}

export default function BudgetTab({ tripId }: BudgetTabProps) {
  const { t, language, isRTL } = useLanguage();

  const { data: budget, isLoading } = trpc.budget.get.useQuery({ tripId });
  const { data: hotels } = trpc.hotels.list.useQuery({ tripId });
  const { data: transports } = trpc.transportation.list.useQuery({ tripId });
  const { data: carRentals } = trpc.carRentals.list.useQuery({ tripId });

  if (isLoading || !budget) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const categories = [
    {
      key: "hotels",
      label: t("hotelsCost"),
      amount: budget.hotels,
      icon: Hotel,
      color: "from-amber-500 to-orange-600",
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
      textColor: "text-amber-700 dark:text-amber-400",
    },
    {
      key: "transportation",
      label: t("transportationCost"),
      amount: budget.transportation,
      icon: Plane,
      color: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      textColor: "text-blue-700 dark:text-blue-400",
    },
    {
      key: "carRentals",
      label: t("carRentalsCost"),
      amount: budget.carRentals,
      icon: Car,
      color: "from-purple-500 to-violet-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      textColor: "text-purple-700 dark:text-purple-400",
    },
  ];

  const getPercentage = (amount: number) => {
    if (budget.total === 0) return 0;
    return Math.round((amount / budget.total) * 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === "he" ? "he-IL" : "en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">{t("budget")}</h2>
      </div>

      {/* Total Budget Card */}
      <Card className="elegant-card mb-8 overflow-hidden">
        <div className="bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{t("totalCost")}</p>
              <p className="text-4xl font-bold gradient-text">
                {formatCurrency(budget.total)}
              </p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </Card>

      {/* Category Breakdown */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {categories.map((category) => (
          <Card key={category.key} className="elegant-card-hover">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center`}>
                  <category.icon className="w-5 h-5 text-white" />
                </div>
                <span className={`text-xs ${category.bgColor} ${category.textColor} px-2 py-1 rounded-full`}>
                  {getPercentage(category.amount)}%
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(category.amount)}</p>
              <p className="text-sm text-muted-foreground">{category.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Visual Breakdown */}
      {budget.total > 0 && (
        <Card className="elegant-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              {language === "he" ? "פירוט הוצאות" : "Expense Breakdown"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categories.map((category) => (
                <div key={category.key}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{category.label}</span>
                    <span className="text-sm text-muted-foreground">
                      {formatCurrency(category.amount)} ({getPercentage(category.amount)}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className={`h-3 rounded-full bg-gradient-to-r ${category.color} transition-all duration-500`}
                      style={{ width: `${getPercentage(category.amount)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Lists */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {/* Hotels Detail */}
        {hotels && hotels.length > 0 && (
          <Card className="elegant-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Hotel className="w-5 h-5" />
                {t("hotels")}
              </CardTitle>
              <CardDescription>
                {hotels.length} {language === "he" ? "הזמנות" : "bookings"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {hotels.map((hotel) => (
                  <div key={hotel.id} className="flex items-center justify-between">
                    <span className="text-sm truncate flex-1">{hotel.name}</span>
                    <span className="text-sm font-medium">
                      {hotel.price ? formatCurrency(parseFloat(hotel.price)) : "-"}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transportation Detail */}
        {transports && transports.length > 0 && (
          <Card className="elegant-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Plane className="w-5 h-5" />
                {t("transportation")}
              </CardTitle>
              <CardDescription>
                {transports.length} {language === "he" ? "הסעות" : "trips"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transports.map((transport) => (
                  <div key={transport.id} className="flex items-center justify-between">
                    <span className="text-sm truncate flex-1">
                      {transport.origin} → {transport.destination}
                    </span>
                    <span className="text-sm font-medium">
                      {transport.price ? formatCurrency(parseFloat(transport.price)) : "-"}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Car Rentals Detail */}
        {carRentals && carRentals.length > 0 && (
          <Card className="elegant-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Car className="w-5 h-5" />
                {t("carRentals")}
              </CardTitle>
              <CardDescription>
                {carRentals.length} {language === "he" ? "השכרות" : "rentals"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {carRentals.map((rental) => (
                  <div key={rental.id} className="flex items-center justify-between">
                    <span className="text-sm truncate flex-1">{rental.company}</span>
                    <span className="text-sm font-medium">
                      {rental.price ? formatCurrency(parseFloat(rental.price)) : "-"}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {budget.total === 0 && (
        <div className="elegant-card p-12 text-center mt-8">
          <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {language === "he" 
              ? "אין הוצאות עדיין. הוסף מחירים למלונות, הסעות והשכרות רכב כדי לעקוב אחר התקציב."
              : "No expenses yet. Add prices to hotels, transportation, and car rentals to track your budget."}
          </p>
        </div>
      )}
    </div>
  );
}
