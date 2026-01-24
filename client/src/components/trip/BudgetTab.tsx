import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Car, DollarSign, Hotel, Loader2, Plane, Utensils, Calculator } from "lucide-react";
import { useEffect, useState } from "react";

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

// Default exchange rates to ILS (will be updated with real rates)
const DEFAULT_RATES_TO_ILS: Record<string, number> = {
  USD: 3.65,
  EUR: 3.95,
  GBP: 4.60,
  ILS: 1,
  JPY: 0.024,
  CHF: 4.10,
  CAD: 2.55,
  AUD: 2.30,
  CNY: 0.50,
  INR: 0.044,
  THB: 0.105,
  TRY: 0.105,
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
  const { t, language } = useLanguage();
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>(DEFAULT_RATES_TO_ILS);
  const [ratesLoading, setRatesLoading] = useState(true);

  const { data: hotels, isLoading: hotelsLoading } = trpc.hotels.list.useQuery({ tripId });
  const { data: transports, isLoading: transportsLoading } = trpc.transportation.list.useQuery({ tripId });
  const { data: carRentals, isLoading: carRentalsLoading } = trpc.carRentals.list.useQuery({ tripId });
  const { data: restaurants, isLoading: restaurantsLoading } = trpc.restaurants.list.useQuery({ tripId });

  // Fetch exchange rates
  useEffect(() => {
    const fetchRates = async () => {
      try {
        // Using exchangerate-api.com free tier
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/ILS');
        if (response.ok) {
          const data = await response.json();
          // Convert rates FROM ILS to rates TO ILS
          const ratesToILS: Record<string, number> = { ILS: 1 };
          Object.keys(data.rates).forEach(currency => {
            ratesToILS[currency] = 1 / data.rates[currency];
          });
          setExchangeRates(ratesToILS);
        }
      } catch (error) {
        console.log('Using default exchange rates');
      } finally {
        setRatesLoading(false);
      }
    };
    fetchRates();
  }, []);

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

  // Process hotels - smart handling of "selection" category
  // Group hotels by currency and selection status
  const selectionHotelsByCurrency: Record<string, typeof hotels> = {};
  const confirmedHotels: typeof hotels = [];
  
  hotels?.forEach(hotel => {
    if (hotel.price) {
      if (hotel.category === 'selection') {
        const currency = hotel.currency || "USD";
        if (!selectionHotelsByCurrency[currency]) {
          selectionHotelsByCurrency[currency] = [];
        }
        selectionHotelsByCurrency[currency].push(hotel);
      } else {
        confirmedHotels.push(hotel);
      }
    }
  });
  
  // Add confirmed hotels to budget
  confirmedHotels.forEach(hotel => {
    if (hotel.price) {
      addToCurrency(hotel.currency || "USD", "hotels", parseFloat(hotel.price));
    }
  });
  
  // For selection hotels, add only the highest priced one per currency
  Object.entries(selectionHotelsByCurrency).forEach(([currency, hotelsList]) => {
    if (hotelsList && hotelsList.length > 0) {
      const highestPriced = hotelsList.reduce((max, hotel) => {
        const price = parseFloat(hotel.price!);
        const maxPrice = parseFloat(max.price!);
        return price > maxPrice ? hotel : max;
      });
      addToCurrency(currency, "hotels", parseFloat(highestPriced.price!));
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

  // Calculate total in ILS
  const totalInILS = currencies.reduce((sum, curr) => {
    const rate = exchangeRates[curr.currency] || DEFAULT_RATES_TO_ILS[curr.currency] || 1;
    return sum + (curr.total * rate);
  }, 0);

  const formatCurrency = (amount: number, currencyCode: string) => {
    const symbol = CURRENCY_SYMBOLS[currencyCode] || currencyCode;
    return `${symbol}${amount.toLocaleString(language === "he" ? "he-IL" : "en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  const categories = [
    { key: "hotels" as const, label: t("hotelsCost"), icon: Hotel, color: "from-amber-500 to-orange-600" },
    { key: "transportation" as const, label: t("transportationCost"), icon: Plane, color: "from-blue-500 to-indigo-600" },
    { key: "carRentals" as const, label: t("carRentalsCost"), icon: Car, color: "from-purple-500 to-violet-600" },
    { key: "restaurants" as const, label: language === "he" ? "מסעדות" : "Restaurants", icon: Utensils, color: "from-rose-500 to-pink-600" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">{t("budget")}</h2>
      </div>

      {hasExpenses && (
        <>
          {/* Currency Cards Grid - Responsive for mobile */}
          <div className="grid gap-3 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
            {currencies.map((currencyData) => (
              <Card key={currencyData.currency} className="elegant-card overflow-hidden">
                <div className="bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground font-medium">{currencyData.currency}</span>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                      <span className="text-sm font-bold text-white">{CURRENCY_SYMBOLS[currencyData.currency] || currencyData.currency}</span>
                    </div>
                  </div>
                  <p className="text-2xl font-bold gradient-text">
                    {formatCurrency(currencyData.total, currencyData.currency)}
                  </p>
                  <div className="mt-2 space-y-1">
                    {categories.map((category) => {
                      const amount = currencyData[category.key];
                      if (amount === 0) return null;
                      return (
                        <div key={category.key} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <category.icon className="w-3 h-3" />
                            {category.label}
                          </span>
                          <span className="font-medium">{formatCurrency(amount, currencyData.currency)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            ))}

            {/* Total in ILS Card */}
            <Card className="elegant-card overflow-hidden border-2 border-primary/30">
              <div className="bg-gradient-to-br from-green-500/20 via-emerald-500/10 to-teal-500/10 p-4 h-full">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground font-medium">
                    {language === "he" ? 'סה"כ בשקלים' : "Total in ILS"}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <Calculator className="w-4 h-4 text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ₪{totalInILS.toLocaleString(language === "he" ? "he-IL" : "en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
                <div className="mt-2 space-y-1">
                  {currencies.filter(c => c.currency !== "ILS").map((curr) => {
                    const rate = exchangeRates[curr.currency] || DEFAULT_RATES_TO_ILS[curr.currency] || 1;
                    const inILS = curr.total * rate;
                    return (
                      <div key={curr.currency} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {formatCurrency(curr.total, curr.currency)}
                        </span>
                        <span className="font-medium text-green-600 dark:text-green-400">
                          ₪{inILS.toLocaleString(language === "he" ? "he-IL" : "en-US", { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {ratesLoading ? (
                  <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    {language === "he" ? "טוען שערים..." : "Loading rates..."}
                  </p>
                ) : (
                  <p className="text-[10px] text-muted-foreground mt-2">
                    {language === "he" ? "* לפי שער היום" : "* Today's exchange rate"}
                  </p>
                )}
              </div>
            </Card>
          </div>
        </>
      )}

      {/* Detailed Lists - Responsive for mobile */}
      {hasExpenses && (
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
          {/* Hotels Detail */}
          {hotels && hotels.filter(h => h.price).length > 0 && (
            <Card className="elegant-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Hotel className="w-4 h-4" />
                  {t("hotels")}
                </CardTitle>
                <CardDescription className="text-xs">
                  {hotels.filter(h => h.price).length} {language === "he" ? "הזמנות" : "bookings"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {hotels.filter(h => h.price).map((hotel) => (
                    <div key={hotel.id} className="flex items-center justify-between text-xs">
                      <span className="truncate flex-1">{hotel.name}</span>
                      <span className="font-medium">
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
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Plane className="w-4 h-4" />
                  {t("transportation")}
                </CardTitle>
                <CardDescription className="text-xs">
                  {transports.filter(t => t.price).length} {language === "he" ? "הסעות" : "trips"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {transports.filter(t => t.price).map((transport) => (
                    <div key={transport.id} className="flex items-center justify-between text-xs">
                      <span className="truncate flex-1">
                        {transport.origin} → {transport.destination}
                      </span>
                      <span className="font-medium">
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
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Car className="w-4 h-4" />
                  {t("carRentals")}
                </CardTitle>
                <CardDescription className="text-xs">
                  {carRentals.filter(r => r.price).length} {language === "he" ? "השכרות" : "rentals"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {carRentals.filter(r => r.price).map((rental) => (
                    <div key={rental.id} className="flex items-center justify-between text-xs">
                      <span className="truncate flex-1">{rental.company}</span>
                      <span className="font-medium">
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
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Utensils className="w-4 h-4" />
                  {language === "he" ? "מסעדות" : "Restaurants"}
                </CardTitle>
                <CardDescription className="text-xs">
                  {restaurants.filter(r => r.price).length} {language === "he" ? "הזמנות" : "reservations"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {restaurants.filter(r => r.price).map((restaurant) => (
                    <div key={restaurant.id} className="flex items-center justify-between text-xs">
                      <span className="truncate flex-1">{restaurant.name}</span>
                      <span className="font-medium">
                        {formatCurrency(parseFloat(restaurant.price!), restaurant.currency || "USD")}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!hasExpenses && (
        <div className="elegant-card p-12 text-center">
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
