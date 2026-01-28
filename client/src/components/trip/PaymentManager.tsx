import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, DollarSign, Calendar } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";

interface PaymentManagerProps {
  tripId: number;
  activityType: "hotel" | "transportation" | "car_rental" | "restaurant" | "tourist_site" | "other";
  activityId: number;
  totalPrice?: number;
  currency?: string;
}

export default function PaymentManager({ tripId, activityType, activityId, totalPrice, currency = "USD" }: PaymentManagerProps) {
  const { language } = useLanguage();
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { data: payments = [], refetch } = trpc.payments.getActivityPayments.useQuery({
    activityType,
    activityId,
  });
  
  const [formData, setFormData] = useState({
    amount: "",
    currency: currency,
    paymentDate: Date.now(),
    paymentMethod: "credit_card",
    notes: "",
  });

  const createMutation = trpc.payments.create.useMutation({
    onSuccess: () => {
      toast.success(language === "he" ? "תשלום נוסף בהצלחה" : "Payment added successfully");
      refetch();
      setDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.payments.delete.useMutation({
    onSuccess: () => {
      toast.success(language === "he" ? "תשלום נמחק בהצלחה" : "Payment deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      amount: "",
      currency: currency,
      paymentDate: Date.now(),
      paymentMethod: "credit_card",
      notes: "",
    });
  };

  const handleSubmit = () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error(language === "he" ? "נא להזין סכום תקין" : "Please enter a valid amount");
      return;
    }

    createMutation.mutate({
      tripId,
      activityType,
      activityId,
      amount: parseFloat(formData.amount),
      currency: formData.currency,
      paymentDate: formData.paymentDate,
      paymentMethod: formData.paymentMethod,
      notes: formData.notes,
    });
  };

  // Calculate totals
  const totalPaid = payments.reduce((sum, p) => {
    // Convert all to same currency for display (simplified - assumes same currency)
    if (p.currency === currency) {
      return sum + parseFloat(p.amount);
    }
    return sum;
  }, 0);

  const remaining = totalPrice ? totalPrice - totalPaid : 0;

  return (
    <div className="space-y-3">
      {/* Payment Summary */}
      {totalPrice !== undefined && (
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
            <div className="text-xs text-muted-foreground">{language === "he" ? "סה\"כ" : "Total"}</div>
            <div className="font-semibold">{totalPrice.toFixed(2)} {currency}</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
            <div className="text-xs text-muted-foreground">{language === "he" ? "שולם" : "Paid"}</div>
            <div className="font-semibold text-green-600 dark:text-green-400">{totalPaid.toFixed(2)} {currency}</div>
          </div>
          <div className={`p-2 rounded ${remaining > 0 ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-gray-50 dark:bg-gray-800'}`}>
            <div className="text-xs text-muted-foreground">{language === "he" ? "נותר" : "Remaining"}</div>
            <div className={`font-semibold ${remaining > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-600'}`}>
              {remaining.toFixed(2)} {currency}
            </div>
          </div>
        </div>
      )}

      {/* Payment List */}
      {payments.length > 0 && (
        <div className="space-y-2">
          {payments.map((payment) => (
            <div key={payment.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded text-sm">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="font-semibold">{parseFloat(payment.amount).toFixed(2)} {payment.currency}</span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(payment.paymentDate), "MMM d, yyyy")}
                  </span>
                </div>
                {payment.paymentMethod && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {payment.paymentMethod.replace(/_/g, " ")}
                  </div>
                )}
                {payment.notes && (
                  <div className="text-xs text-muted-foreground mt-1">{payment.notes}</div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (confirm(language === "he" ? "למחוק תשלום זה?" : "Delete this payment?")) {
                    deleteMutation.mutate({ id: payment.id });
                  }
                }}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add Payment Button */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            {language === "he" ? "הוסף תשלום" : "Add Payment"}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === "he" ? "הוסף תשלום" : "Add Payment"}</DialogTitle>
            <DialogDescription>
              {language === "he" 
                ? "הזן פרטי תשלום (מקדמה, תשלום חלקי או תשלום מלא)"
                : "Enter payment details (deposit, partial payment, or full payment)"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{language === "he" ? "סכום" : "Amount"}</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>{language === "he" ? "מטבע" : "Currency"}</Label>
                <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="ILS">ILS</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>{language === "he" ? "תאריך תשלום" : "Payment Date"}</Label>
              <Input
                type="date"
                value={format(new Date(formData.paymentDate), "yyyy-MM-dd")}
                onChange={(e) => setFormData({ ...formData, paymentDate: new Date(e.target.value).getTime() })}
              />
            </div>

            <div>
              <Label>{language === "he" ? "אמצעי תשלום" : "Payment Method"}</Label>
              <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit_card">{language === "he" ? "כרטיס אשראי" : "Credit Card"}</SelectItem>
                  <SelectItem value="bank_transfer">{language === "he" ? "העברה בנקאית" : "Bank Transfer"}</SelectItem>
                  <SelectItem value="cash">{language === "he" ? "מזומן" : "Cash"}</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="other">{language === "he" ? "אחר" : "Other"}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{language === "he" ? "הערות" : "Notes"}</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder={language === "he" ? "הערות נוספות..." : "Additional notes..."}
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSubmit} className="flex-1">
                {language === "he" ? "שמור" : "Save"}
              </Button>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {language === "he" ? "ביטול" : "Cancel"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
