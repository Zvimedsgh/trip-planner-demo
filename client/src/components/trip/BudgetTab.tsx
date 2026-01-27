import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Car, Hotel, Loader2, Plane, Utensils, Calculator, Check, X } from "lucide-react";
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

// Default exchange rates to ILS
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
  totalPaid: number;
  totalUnpaid: number;
  total: number;
}

export default function BudgetTab({ tripId }: BudgetTabProps) {
  const { t, language } = useLanguage();
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>(DEFAULT_RATES_TO_ILS);
  const [ratesLoading, setRatesLoading] = useState(true);
  const utils = trpc.useUtils();

  const { data: hotels, isLoading: hotelsLoading } = trpc.hotels.list.useQuery({ tripId });
  const { data: transports, isLoading: transportsLoading } = trpc.transportation.list.useQuery({ tripId });
  const { data: restaurants, isLoading: restaurantsLoading } = trpc.restaurants.list.useQuery({ tripId });
  const { data: carRentals, isLoading: carRentalsLoading } = trpc.carRentals.list.useQuery({ tripId });

  const updateHotelPayment = trpc.hotels.update.useMutation({
    onSuccess: () => utils.hotels.list.invalidate({ tripId }),
  });
  const updateTransportPayment = trpc.transportation.update.useMutation({
    onSuccess: () => utils.transportation.list.invalidate({ tripId }),
  });
  const updateRestaurantPayment = trpc.restaurants.update.useMutation({
    onSuccess: () => utils.restaurants.list.invalidate({ tripId }),
  });

  // Fetch exchange rates
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/ILS');
        if (response.ok) {
          const data = await response.json();
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

  const isLoading = hotelsLoading || transportsLoading || restaurantsLoading || carRentalsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Group expenses by currency with paid/unpaid split
  const currencyTotals: Record<string, CurrencyTotal> = {};

  const addToCurrency = (currency: string, amount: number, isPaid: boolean) => {
    if (!currency) currency = "USD";
    if (!currencyTotals[currency]) {
      currencyTotals[currency] = {
        currency,
        totalPaid: 0,
        totalUnpaid: 0,
        total: 0,
      };
    }
    if (isPaid) {
      currencyTotals[currency].totalPaid += amount;
    } else {
      currencyTotals[currency].totalUnpaid += amount;
    }
    currencyTotals[currency].total += amount;
  };

  // Process all expenses
  hotels?.forEach(hotel => {
    if (hotel.price) {
      const isPaid = hotel.paymentStatus === "paid";
      addToCurrency(hotel.currency || "USD", parseFloat(hotel.price), isPaid);
    }
  });

  transports?.forEach(transport => {
    if (transport.price) {
      const isPaid = transport.paymentStatus === "paid";
      addToCurrency(transport.currency || "USD", parseFloat(transport.price), isPaid);
    }
  });

  restaurants?.forEach(restaurant => {
    if (restaurant.price) {
      const isPaid = restaurant.paymentStatus === "paid";
      addToCurrency(restaurant.currency || "USD", parseFloat(restaurant.price), isPaid);
    }
  });

  carRentals?.forEach(rental => {
    if (rental.price) {
      const isPaid = rental.paymentStatus === "paid";
      addToCurrency(rental.currency || "USD", parseFloat(rental.price), isPaid);
    }
  });

  const currencies = Object.values(currencyTotals).sort((a, b) => b.total - a.total);
  const hasExpenses = currencies.length > 0;

  // Calculate totals in ILS
  const totalPaidInILS = currencies.reduce((sum, curr) => {
    const rate = exchangeRates[curr.currency] || DEFAULT_RATES_TO_ILS[curr.currency] || 1;
    return sum + (curr.totalPaid * rate);
  }, 0);

  const totalUnpaidInILS = currencies.reduce((sum, curr) => {
    const rate = exchangeRates[curr.currency] || DEFAULT_RATES_TO_ILS[curr.currency] || 1;
    return sum + (curr.totalUnpaid * rate);
  }, 0);

  const totalInILS = totalPaidInILS + totalUnpaidInILS;

  const formatCurrency = (amount: number, currencyCode: string) => {
    const symbol = CURRENCY_SYMBOLS[currencyCode] || currencyCode;
    return `${symbol}${amount.toLocaleString(language === "he" ? "he-IL" : "en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">{t("budget")}</h2>
      </div>

      {hasExpenses && (
        <>
          {/* Currency Cards Grid */}
          <div className="grid gap-3 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
            {currencies.map((currencyData) => (
              <Card key={currencyData.currency} className="elegant-card overflow-hidden">
                <div className="bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground font-medium">{currencyData.currency}</span>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                      <span className="text-sm font-bold text-white">{CURRENCY_SYMBOLS[currencyData.currency] || currencyData.currency}</span>
                    </div>
                  </div>
                  <p className="text-2xl font-bold gradient-text mb-3">
                    {formatCurrency(currencyData.total, currencyData.currency)}
                  </p>
                  <div className="space-y-2 pt-2 border-t border-border/50">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        {language === "he" ? "שולם" : "Paid"}
                      </span>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        {formatCurrency(currencyData.totalPaid, currencyData.currency)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-orange-600 dark:text-orange-400 flex items-center gap-1">
                        <X className="w-3 h-3" />
                        {language === "he" ? "לא שולם" : "Unpaid"}
                      </span>
                      <span className="font-medium text-orange-600 dark:text-orange-400">
                        {formatCurrency(currencyData.totalUnpaid, currencyData.currency)}
                      </span>
                    </div>
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
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-3">
                  ₪{totalInILS.toLocaleString(language === "he" ? "he-IL" : "en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
                <div className="space-y-2 pt-2 border-t border-border/50">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      {language === "he" ? "שולם" : "Paid"}
                    </span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      ₪{totalPaidInILS.toLocaleString(language === "he" ? "he-IL" : "en-US", { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-orange-600 dark:text-orange-400 flex items-center gap-1">
                      <X className="w-3 h-3" />
                      {language === "he" ? "לא שולם" : "Unpaid"}
                    </span>
                    <span className="font-medium text-orange-600 dark:text-orange-400">
                      ₪{totalUnpaidInILS.toLocaleString(language === "he" ? "he-IL" : "en-US", { maximumFractionDigits: 0 })}
                    </span>
                  </div>
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

      {/* Detailed Expense Lists with Payment Toggle */}
      {hasExpenses && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{language === "he" ? "ניהול תשלומים" : "Payment Management"}</h3>
          
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {/* Hotels */}
            {hotels && hotels.filter(h => h.price).length > 0 && (
              <Card className="elegant-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Hotel className="w-4 h-4" />
                    {t("hotels")}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {hotels.filter(h => h.price).length} {language === "he" ? "הזמנות" : "bookings"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {hotels.filter(h => h.price).map((hotel) => (
                      <div key={hotel.id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/30">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{hotel.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(parseFloat(hotel.price!), hotel.currency || "USD")}
                          </p>
                        </div>
                        <Switch
                          checked={hotel.paymentStatus === "paid"}
                          onCheckedChange={(checked) => {
                            updateHotelPayment.mutate({
                              id: hotel.id,
                              paymentStatus: checked ? "paid" : "pending",
                            });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Transportation */}
            {transports && transports.filter(t => t.price).length > 0 && (
              <Card className="elegant-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Plane className="w-4 h-4" />
                    {t("transportation")}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {transports.filter(t => t.price).length} {language === "he" ? "הסעות" : "trips"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {transports.filter(t => t.price).map((transport) => (
                      <div key={transport.id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/30">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">
                            {transport.origin} → {transport.destination}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(parseFloat(transport.price!), transport.currency || "USD")}
                          </p>
                        </div>
                        <Switch
                          checked={transport.paymentStatus === "paid"}
                          onCheckedChange={(checked) => {
                            updateTransportPayment.mutate({
                              id: transport.id,
                              paymentStatus: checked ? "paid" : "pending",
                            });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Restaurants */}
            {restaurants && restaurants.filter(r => r.price).length > 0 && (
              <Card className="elegant-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Utensils className="w-4 h-4" />
                    {language === "he" ? "מסעדות" : "Restaurants"}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {restaurants.filter(r => r.price).length} {language === "he" ? "ארוחות" : "meals"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {restaurants.filter(r => r.price).map((restaurant) => (
                      <div key={restaurant.id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/30">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{restaurant.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(parseFloat(restaurant.price!), restaurant.currency || "USD")}
                          </p>
                        </div>
                        <Switch
                          checked={restaurant.paymentStatus === "paid"}
                          onCheckedChange={(checked) => {
                            updateRestaurantPayment.mutate({
                              id: restaurant.id,
                              paymentStatus: checked ? "paid" : "pending",
                            });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {!hasExpenses && (
        <div className="text-center py-12 text-muted-foreground">
          <p>{language === "he" ? "אין הוצאות עדיין" : "No expenses yet"}</p>
        </div>
      )}
    </div>
  );
}
