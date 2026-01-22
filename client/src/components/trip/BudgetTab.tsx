import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Car, DollarSign, Hotel, Loader2, Plane, PieChart, Utensils } from "lucide-react";

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  ILS: "₪",
  JPY: "¥",
  CHF: "Fr",
  CAD: "C$",
  AUD: "A$",
  CNY: "¥",
  INR: "₹",
  THB: "฿",
  TRY: "₺",
};

interface BudgetTabProps {
  tripId: number;
}

interface CurrencyTotal {
  currency: string;
  total: number;
  hotels: number;
  transportation: number;
  carRentals: number;
  restaurants: number;
}

export default function BudgetTab({ tripId }: BudgetTabProps) {
  const { t, language, isRTL } = useLanguage();

  const { data: hotels, isLoading: hotelsLoading } = trpc.hotels.list.useQuery({ tripId });
  const { data: transports, isLoading: transportsLoading } = trpc.transportation.list.useQuery({ tripId });
  const { data: carRentals, isLoading: carRentalsLoading } = trpc.carRentals.list.useQuery({ tripId });
  const { data: restaurants, isLoading: restaurantsLoading } = trpc.restaurants.list.useQuery({ tripId });

  const isLoading = hotelsLoading || transportsLoading || carRentalsLoading || restaurantsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Group expenses by currency
  const currencyTotals: Record<string, CurrencyTotal> = {};

  const addToCurrency = (currency: string, category: keyof Omit<CurrencyTotal, 'currency' | 'total'>, amount: number) => {
    if (!currency) currency = "USD";
    if (!currencyTotals[currency]) {
      currencyTotals[currency] = {
        currency,
        total: 0,
        hotels: 0,
        transportation: 0,
        carRentals: 0,
        restaurants: 0,
      };
    }
    currencyTotals[currency][category] += amount;
    currencyTotals[currency].total += amount;
  };

  // Process hotels
  hotels?.forEach(hotel => {
    if (hotel.price) {
      addToCurrency(hotel.currency || "USD", "hotels", parseFloat(hotel.price));
    }
  });

  // Process transportation
  transports?.forEach(transport => {
    if (transport.price) {
      addToCurrency(transport.currency || "USD", "transportation", parseFloat(transport.price));
    }
  });

  // Process car rentals
  carRentals?.forEach(rental => {
    if (rental.price) {
      addToCurrency(rental.currency || "USD", "carRentals", parseFloat(rental.price));
    }
  });

  // Process restaurants
  restaurants?.forEach(restaurant => {
    if (restaurant.price) {
      addToCurrency(restaurant.currency || "USD", "restaurants", parseFloat(restaurant.price));
    }
  });

  const currencies = Object.values(currencyTotals).sort((a, b) => b.total - a.total);
  const hasExpenses = currencies.length > 0;

  const formatCurrency = (amount: number, currencyCode: string) => {
    const symbol = CURRENCY_SYMBOLS[currencyCode] || currencyCode;
    return `${symbol}${amount.toLocaleString(language === "he" ? "he-IL" : "en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  const getPercentage = (amount: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((amount / total) * 100);
  };

  const categories = [
    {
      key: "hotels" as const,
      label: t("hotelsCost"),
      icon: Hotel,
      color: "from-amber-500 to-orange-600",
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
      textColor: "text-amber-700 dark:text-amber-400",
    },
    {
      key: "transportation" as const,
      label: t("transportationCost"),
      icon: Plane,
      color: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      textColor: "text-blue-700 dark:text-blue-400",
    },
    {
      key: "carRentals" as const,
      label: t("carRentalsCost"),
      icon: Car,
      color: "from-purple-500 to-violet-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      textColor: "text-purple-700 dark:text-purple-400",
    },
    {
      key: "restaurants" as const,
      label: language === "he" ? "מסעדות" : "Restaurants",
      icon: Utensils,
      color: "from-rose-500 to-pink-600",
      bgColor: "bg-rose-100 dark:bg-rose-900/30",
      textColor: "text-rose-700 dark:text-rose-400",
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">{t("budget")}</h2>
      </div>

      {/* Total Budget Cards by Currency */}
      {currencies.map((currencyData) => (
        <Card key={currencyData.currency} className="elegant-card mb-6 overflow-hidden">
          <div className="bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {language === "he" ? `סה"כ ב-${currencyData.currency}` : `Total in ${currencyData.currency}`}
                </p>
                <p className="text-3xl font-bold gradient-text">
                  {formatCurrency(currencyData.total, currencyData.currency)}
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                <span className="text-xl font-bold text-white">{CURRENCY_SYMBOLS[currencyData.currency] || currencyData.currency}</span>
              </div>
            </div>

            {/* Category Breakdown for this currency */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {categories.map((category) => {
                const amount = currencyData[category.key];
                if (amount === 0) return null;
                return (
                  <div key={category.key} className={`${category.bgColor} rounded-lg p-3`}>
                    <div className="flex items-center gap-2 mb-1">
                      <category.icon className={`w-4 h-4 ${category.textColor}`} />
                      <span className={`text-xs ${category.textColor}`}>{category.label}</span>
                    </div>
                    <p className={`text-lg font-semibold ${category.textColor}`}>
                      {formatCurrency(amount, currencyData.currency)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getPercentage(amount, currencyData.total)}%
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Visual Breakdown */}
          <CardContent className="pt-4">
            <div className="space-y-3">
              {categories.map((category) => {
                const amount = currencyData[category.key];
                if (amount === 0) return null;
                return (
                  <div key={category.key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{category.label}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(amount, currencyData.currency)} ({getPercentage(amount, currencyData.total)}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full bg-gradient-to-r ${category.color} transition-all duration-500`}
                        style={{ width: `${getPercentage(amount, currencyData.total)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Detailed Lists */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        {/* Hotels Detail */}
        {hotels && hotels.filter(h => h.price).length > 0 && (
          <Card className="elegant-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Hotel className="w-5 h-5" />
                {t("hotels")}
              </CardTitle>
              <CardDescription>
                {hotels.filter(h => h.price).length} {language === "he" ? "הזמנות" : "bookings"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {hotels.filter(h => h.price).map((hotel) => (
                  <div key={hotel.id} className="flex items-center justify-between">
                    <span className="text-sm truncate flex-1">{hotel.name}</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(parseFloat(hotel.price!), hotel.currency || "USD")}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transportation Detail */}
        {transports && transports.filter(t => t.price).length > 0 && (
          <Card className="elegant-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Plane className="w-5 h-5" />
                {t("transportation")}
              </CardTitle>
              <CardDescription>
                {transports.filter(t => t.price).length} {language === "he" ? "הסעות" : "trips"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transports.filter(t => t.price).map((transport) => (
                  <div key={transport.id} className="flex items-center justify-between">
                    <span className="text-sm truncate flex-1">
                      {transport.origin} → {transport.destination}
                    </span>
                    <span className="text-sm font-medium">
                      {formatCurrency(parseFloat(transport.price!), transport.currency || "USD")}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Car Rentals Detail */}
        {carRentals && carRentals.filter(r => r.price).length > 0 && (
          <Card className="elegant-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Car className="w-5 h-5" />
                {t("carRentals")}
              </CardTitle>
              <CardDescription>
                {carRentals.filter(r => r.price).length} {language === "he" ? "השכרות" : "rentals"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {carRentals.filter(r => r.price).map((rental) => (
                  <div key={rental.id} className="flex items-center justify-between">
                    <span className="text-sm truncate flex-1">{rental.company}</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(parseFloat(rental.price!), rental.currency || "USD")}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Restaurants Detail */}
        {restaurants && restaurants.filter(r => r.price).length > 0 && (
          <Card className="elegant-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Utensils className="w-5 h-5" />
                {language === "he" ? "מסעדות" : "Restaurants"}
              </CardTitle>
              <CardDescription>
                {restaurants.filter(r => r.price).length} {language === "he" ? "הזמנות" : "reservations"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {restaurants.filter(r => r.price).map((restaurant) => (
                  <div key={restaurant.id} className="flex items-center justify-between">
                    <span className="text-sm truncate flex-1">{restaurant.name}</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(parseFloat(restaurant.price!), restaurant.currency || "USD")}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {!hasExpenses && (
        <div className="elegant-card p-12 text-center mt-8">
          <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {language === "he" 
              ? "אין הוצאות עדיין. הוסף מחירים למלונות, הסעות, השכרות רכב ומסעדות כדי לעקוב אחר התקציב."
              : "No expenses yet. Add prices to hotels, transportation, car rentals, and restaurants to track your budget."}
          </p>
        </div>
      )}
    </div>
  );
}
