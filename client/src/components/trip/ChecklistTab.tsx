import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { CheckCircle2, Circle, Loader2, Plus, Trash2, Calendar as CalendarIcon, FileText, CreditCard, Package, Heart, DollarSign, MoreHorizontal } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface ChecklistTabProps {
  tripId: number;
}

const CATEGORIES = [
  { value: "documents", icon: FileText, labelEn: "Documents", labelHe: "מסמכים" },
  { value: "bookings", icon: CreditCard, labelEn: "Bookings", labelHe: "הזמנות" },
  { value: "packing", icon: Package, labelEn: "Packing", labelHe: "ארוז" },
  { value: "health", icon: Heart, labelEn: "Health", labelHe: "בריאות" },
  { value: "finance", icon: DollarSign, labelEn: "Finance", labelHe: "כספים" },
  { value: "other", icon: MoreHorizontal, labelEn: "Other", labelHe: "אחר" },
];

export default function ChecklistTab({ tripId }: ChecklistTabProps) {
  const { t, language, isRTL } = useLanguage();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const utils = trpc.useUtils();
  const { data: items, isLoading } = trpc.checklist.list.useQuery({ tripId });

  const createMutation = trpc.checklist.create.useMutation({
    onSuccess: () => {
      utils.checklist.list.invalidate({ tripId });
      setIsCreateOpen(false);
      toast.success(language === "he" ? "משימה נוספה" : "Task added");
    },
  });

  const updateMutation = trpc.checklist.update.useMutation({
    onSuccess: () => {
      utils.checklist.list.invalidate({ tripId });
    },
  });

  const deleteMutation = trpc.checklist.delete.useMutation({
    onSuccess: () => {
      utils.checklist.list.invalidate({ tripId });
      toast.success(language === "he" ? "משימה נמחקה" : "Task deleted");
    },
  });

  const getFormValues = () => {
    if (!formRef.current) return null;
    const getValue = (name: string) => {
      const input = formRef.current?.querySelector(`[name="${name}"]`) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      return input?.value || "";
    };
    return {
      title: getValue("title"),
      category: getValue("category") as any,
      dueDate: getValue("dueDate") ? new Date(getValue("dueDate")).getTime() : undefined,
      notes: getValue("notes"),
    };
  };

  const handleCreate = () => {
    const values = getFormValues();
    if (!values || !values.title || !values.category) {
      toast.error(language === "he" ? "נא למלא את כל השדות הנדרשים" : "Please fill in all required fields");
      return;
    }

    createMutation.mutate({
      tripId,
      ...values,
    });
  };

  const toggleComplete = (id: number, completed: boolean) => {
    updateMutation.mutate({ id, completed: !completed });
  };

  const getCategoryIcon = (category: string) => {
    const cat = CATEGORIES.find(c => c.value === category);
    return cat?.icon || MoreHorizontal;
  };

  const getCategoryLabel = (category: string) => {
    const cat = CATEGORIES.find(c => c.value === category);
    return language === "he" ? cat?.labelHe : cat?.labelEn;
  };

  const groupedItems = items?.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof items>);

  const completedCount = items?.filter(i => i.completed).length || 0;
  const totalCount = items?.length || 0;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with progress */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">{language === "he" ? "רשימת משימות לפני הטיול" : "Pre-Trip Checklist"}</h3>
              <p className="text-sm text-muted-foreground">
                {language === "he" 
                  ? `${completedCount} מתוך ${totalCount} משימות הושלמו`
                  : `${completedCount} of ${totalCount} tasks completed`
                }
              </p>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  {language === "he" ? "הוסף משימה" : "Add Task"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{language === "he" ? "משימה חדשה" : "New Task"}</DialogTitle>
                </DialogHeader>
                <div ref={formRef} className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="title">{language === "he" ? "כותרת" : "Title"} *</Label>
                    <Input id="title" name="title" placeholder={language === "he" ? "לדוגמה: בדוק דרכון" : "e.g., Check passport"} />
                  </div>
                  <div>
                    <Label htmlFor="category">{language === "he" ? "קטגוריה" : "Category"} *</Label>
                    <Select name="category">
                      <SelectTrigger>
                        <SelectValue placeholder={language === "he" ? "בחר קטגוריה" : "Select category"} />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {language === "he" ? cat.labelHe : cat.labelEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dueDate">{language === "he" ? "תאריך יעד" : "Due Date"}</Label>
                    <Input id="dueDate" name="dueDate" type="date" />
                  </div>
                  <div>
                    <Label htmlFor="notes">{language === "he" ? "הערות" : "Notes"}</Label>
                    <Textarea id="notes" name="notes" rows={3} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    {language === "he" ? "ביטול" : "Cancel"}
                  </Button>
                  <Button onClick={handleCreate} disabled={createMutation.isPending}>
                    {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {language === "he" ? "הוסף" : "Add"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">{progress}% {language === "he" ? "הושלם" : "Complete"}</p>
        </CardContent>
      </Card>

      {/* Checklist items grouped by category */}
      {groupedItems && Object.keys(groupedItems).length > 0 ? (
        <div className="space-y-4">
          {Object.entries(groupedItems).map(([category, categoryItems]) => {
            const Icon = getCategoryIcon(category);
            return (
              <Card key={category}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="w-5 h-5 text-primary" />
                    <h4 className="font-semibold">{getCategoryLabel(category)}</h4>
                    <span className="text-xs text-muted-foreground">
                      ({categoryItems.filter(i => i.completed).length}/{categoryItems.length})
                    </span>
                  </div>
                  <div className="space-y-2">
                    {categoryItems.map(item => (
                      <div 
                        key={item.id} 
                        className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                          item.completed ? 'bg-muted/50 opacity-60' : 'bg-background hover:bg-muted/30'
                        }`}
                      >
                        <button
                          onClick={() => toggleComplete(item.id, item.completed)}
                          className="mt-0.5 flex-shrink-0"
                        >
                          {item.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                          ) : (
                            <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {item.title}
                          </p>
                          {item.notes && (
                            <p className="text-sm text-muted-foreground mt-1">{item.notes}</p>
                          )}
                          {item.dueDate && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <CalendarIcon className="w-3 h-3" />
                              {format(new Date(item.dueDate), "MMM d, yyyy")}
                            </div>
                          )}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 flex-shrink-0"
                          onClick={() => deleteMutation.mutate({ id: item.id })}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {language === "he" 
                ? "אין משימות עדיין. לחץ 'הוסף משימה' כדי להתחיל."
                : "No tasks yet. Click 'Add Task' to get started."
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
