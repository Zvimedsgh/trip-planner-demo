import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { CheckCircle2, Circle, Loader2, Plus, Trash2, Calendar as CalendarIcon, FileText, CreditCard, Package, Heart, DollarSign, MoreHorizontal } from "lucide-react";
import { useRef, useState, useEffect } from "react";
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
  // viewFilter: "all" or a traveler name
  const [viewFilter, setViewFilter] = useState<string>("all");
  const [selectedOwner, setSelectedOwner] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const formRef = useRef<HTMLDivElement>(null);

  const utils = trpc.useUtils();
  const { data: items, isLoading } = trpc.checklist.list.useQuery({ tripId });
  const { data: travelers = [] } = trpc.travelers.list.useQuery({ tripId });
  const [hasInitialized, setHasInitialized] = useState(false);

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

  // Non-shared travelers (for filter buttons and auto-init)
  const personalTravelers = travelers.filter(t => t.name !== "משותף" && t.name !== "Shared" && t.identifier !== "shared");

  // Initialize personal essentials for each participant if they don't have any items yet
  useEffect(() => {
    if (!items || hasInitialized || isLoading || !travelers || travelers.length === 0) return;

    const personalEssentials = [
      { title: "Passport", titleHe: "דרכון", category: "documents" as const },
      { title: "Visa (if required)", titleHe: "ויזה (אם נדרש)", category: "documents" as const },
      { title: "Travel Insurance", titleHe: "ביטוח נסיעות", category: "documents" as const },
      { title: "Flight Tickets", titleHe: "כרטיסי טיסה", category: "bookings" as const },
      { title: "Credit Card", titleHe: "כרטיס אשראי", category: "finance" as const },
      { title: "Cash (local currency)", titleHe: "מזומן (מטבע מקומי)", category: "finance" as const },
      { title: "Phone Charger", titleHe: "מטען טלפון", category: "packing" as const },
      { title: "Medications", titleHe: "תרופות", category: "health" as const },
      { title: "Toiletries", titleHe: "מוצרי טואלט", category: "packing" as const },
      { title: "Clothes", titleHe: "בגדים", category: "packing" as const },
    ];

    // Use traveler name as owner key (since identifier may be empty)
    const travelersToInit = travelers.filter(t => t.name !== "משותף" && t.name !== "Shared" && t.identifier !== "shared");

    travelersToInit.forEach(traveler => {
      // Check by name since that's what we store in owner field
      const hasItems = items.some(item => item.owner === traveler.name);
      if (!hasItems) {
        personalEssentials.forEach(essential => {
          createMutation.mutate({
            tripId,
            title: language === "he" ? essential.titleHe : essential.title,
            category: essential.category,
            owner: traveler.name,
          });
        });
      }
    });

    setHasInitialized(true);
  }, [items, hasInitialized, isLoading, tripId, language, createMutation, travelers]);

  // Set default owner for new tasks when travelers load
  useEffect(() => {
    if (personalTravelers.length > 0 && !selectedOwner) {
      setSelectedOwner(personalTravelers[0].name);
    }
  }, [personalTravelers, selectedOwner]);

  const getFormValues = () => {
    if (!formRef.current) return null;
    const getValue = (name: string) => {
      const input = formRef.current?.querySelector(`[name="${name}"]`) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      return input?.value || "";
    };
    return {
      title: getValue("title"),
      category: selectedCategory as any,
      dueDate: getValue("dueDate") ? new Date(getValue("dueDate")).getTime() : undefined,
      notes: getValue("notes"),
      owner: selectedOwner,
    };
  };

  const handleCreate = () => {
    const values = getFormValues();
    if (!values || !values.title || !values.category) {
      toast.error(language === "he" ? "נא למלא את כל השדות הנדרשים" : "Please fill in all required fields");
      return;
    }
    createMutation.mutate({ tripId, ...values });
    setSelectedCategory("");
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

  // Filter items based on selected traveler (by name)
  const filteredItems = items?.filter(item => {
    if (viewFilter === "all") return true;
    return item.owner === viewFilter;
  }) ?? [];

  // Group by category
  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof filteredItems>);

  // Progress counts based on current filter
  const completedCount = filteredItems.filter(i => i.completed).length;
  const totalCount = filteredItems.length;
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
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{language === "he" ? "רשימת משימות לפני הטיול" : "Pre-Trip Checklist"}</h3>
                <p className="text-sm text-muted-foreground">
                  {language === "he"
                    ? `${completedCount} מתוך ${totalCount} משימות הושלמו`
                    : `${completedCount} of ${totalCount} tasks completed`}
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
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
                    <div>
                      <Label htmlFor="owner">{language === "he" ? "שייך ל" : "Belongs to"}</Label>
                      <Select value={selectedOwner} onValueChange={setSelectedOwner}>
                        <SelectTrigger>
                          <SelectValue placeholder={language === "he" ? "בחר נוסע" : "Select traveler"} />
                        </SelectTrigger>
                        <SelectContent>
                          {personalTravelers.map(t => (
                            <SelectItem key={t.id} value={t.name}>
                              {t.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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

            {/* Traveler filter buttons */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={viewFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewFilter("all")}
              >
                {language === "he" ? "הכל" : "All"}
              </Button>
              {personalTravelers.map(traveler => (
                <Button
                  key={traveler.id}
                  variant={viewFilter === traveler.name ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewFilter(traveler.name)}
                >
                  {traveler.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">{progress}% {language === "he" ? "הושלם" : "Complete"}</p>
          </div>
        </CardContent>
      </Card>

      {/* Checklist items grouped by category */}
      {Object.keys(groupedItems).length > 0 ? (
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
                          {/* Show owner name when viewing "all" */}
                          {viewFilter === "all" && item.owner && (
                            <p className="text-xs text-primary/70 mt-0.5">{item.owner}</p>
                          )}
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
                          onClick={() => {
                            if (window.confirm(language === "he" ? "האם אתה בטוח שברצונך למחוק את המשימה?" : "Are you sure you want to delete this task?")) {
                              deleteMutation.mutate({ id: item.id });
                            }
                          }}
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
                : "No tasks yet. Click 'Add Task' to get started."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
