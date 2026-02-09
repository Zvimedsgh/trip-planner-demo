import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Loader2, Plus, Trash2, Users, GripVertical } from "lucide-react";
import { toast } from "sonner";

interface TravelersTabProps {
  tripId: number;
}

export default function TravelersTab({ tripId }: TravelersTabProps) {
  const { language } = useLanguage();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", identifier: "" });

  const utils = trpc.useUtils();
  const { data: travelers = [], isLoading } = trpc.travelers.list.useQuery({ tripId });

  const createMutation = trpc.travelers.create.useMutation({
    onSuccess: () => {
      utils.travelers.list.invalidate({ tripId });
      setIsCreateOpen(false);
      setFormData({ name: "", identifier: "" });
      toast.success(language === "he" ? "נוסע נוסף בהצלחה" : "Traveler added successfully");
    },
    onError: (error) => {
      toast.error(error.message || (language === "he" ? "שגיאה בהוספת נוסע" : "Error adding traveler"));
    },
  });

  const updateMutation = trpc.travelers.update.useMutation({
    onSuccess: () => {
      utils.travelers.list.invalidate({ tripId });
      setEditingId(null);
      setFormData({ name: "", identifier: "" });
      toast.success(language === "he" ? "נוסע עודכן בהצלחה" : "Traveler updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || (language === "he" ? "שגיאה בעדכון נוסע" : "Error updating traveler"));
    },
  });

  const deleteMutation = trpc.travelers.delete.useMutation({
    onSuccess: () => {
      utils.travelers.list.invalidate({ tripId });
      toast.success(language === "he" ? "נוסע נמחק בהצלחה" : "Traveler deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || (language === "he" ? "שגיאה במחיקת נוסע" : "Error deleting traveler"));
    },
  });

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.identifier.trim()) {
      toast.error(language === "he" ? "נא למלא את כל השדות" : "Please fill in all fields");
      return;
    }

    // Validate identifier (only lowercase letters, numbers, underscores)
    if (!/^[a-z0-9_]+$/.test(formData.identifier)) {
      toast.error(
        language === "he" 
          ? "המזהה חייב להכיל רק אותיות אנגליות קטנות, מספרים וקו תחתון" 
          : "Identifier must contain only lowercase letters, numbers, and underscores"
      );
      return;
    }

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        name: formData.name,
        identifier: formData.identifier,
      });
    } else {
      createMutation.mutate({
        tripId,
        name: formData.name,
        identifier: formData.identifier,
      });
    }
  };

  const handleEdit = (traveler: typeof travelers[0]) => {
    setEditingId(traveler.id);
    setFormData({ name: traveler.name, identifier: traveler.identifier });
    setIsCreateOpen(true);
  };

  const handleDelete = (id: number, identifier: string) => {
    // Prevent deleting "shared"
    if (identifier === "shared") {
      toast.error(language === "he" ? 'לא ניתן למחוק את "משותף"' : 'Cannot delete "shared"');
      return;
    }
    
    if (confirm(language === "he" ? "האם אתה בטוח שברצונך למחוק נוסע זה?" : "Are you sure you want to delete this traveler?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleDialogClose = (open: boolean) => {
    setIsCreateOpen(open);
    if (!open) {
      setEditingId(null);
      setFormData({ name: "", identifier: "" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                {language === "he" ? "ניהול נוסעים" : "Manage Travelers"}
              </CardTitle>
              <CardDescription>
                {language === "he" 
                  ? "הוסף או ערוך נוסעים עבור הטיול. כל נוסע יקבל רשימת משימות אישית בצ'קליסט."
                  : "Add or edit travelers for this trip. Each traveler will have their own checklist."}
              </CardDescription>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={handleDialogClose}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  {language === "he" ? "הוסף נוסע" : "Add Traveler"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingId 
                      ? (language === "he" ? "ערוך נוסע" : "Edit Traveler")
                      : (language === "he" ? "נוסע חדש" : "New Traveler")}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="name">{language === "he" ? "שם" : "Name"} *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={language === "he" ? "לדוגמה: צבי ויונה" : "e.g., John & Jane"}
                    />
                  </div>
                  <div>
                    <Label htmlFor="identifier">{language === "he" ? "מזהה" : "Identifier"} *</Label>
                    <Input
                      id="identifier"
                      value={formData.identifier}
                      onChange={(e) => setFormData({ ...formData, identifier: e.target.value.toLowerCase() })}
                      placeholder={language === "he" ? "לדוגמה: tzvi_yona" : "e.g., john_jane"}
                      disabled={editingId !== null && formData.identifier === "shared"}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {language === "he" 
                        ? "אותיות אנגליות קטנות, מספרים וקו תחתון בלבד"
                        : "Lowercase letters, numbers, and underscores only"}
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => handleDialogClose(false)}>
                    {language === "he" ? "ביטול" : "Cancel"}
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {(createMutation.isPending || updateMutation.isPending) && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    {editingId 
                      ? (language === "he" ? "עדכן" : "Update")
                      : (language === "he" ? "הוסף" : "Add")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {travelers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {language === "he" ? "אין נוסעים עדיין" : "No travelers yet"}
              </p>
            ) : (
              travelers.map((traveler) => (
                <Card key={traveler.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-5 h-5 text-muted-foreground cursor-move" />
                      <div>
                        <h4 className="font-semibold">{traveler.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {language === "he" ? "מזהה" : "ID"}: {traveler.identifier}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(traveler)}
                      >
                        {language === "he" ? "ערוך" : "Edit"}
                      </Button>
                      {traveler.identifier !== "shared" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(traveler.id, traveler.identifier)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">
            {language === "he" ? "💡 טיפ" : "💡 Tip"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            {language === "he" 
              ? "• הנוסע \"משותף\" משמש למשימות שמשותפות לכולם (כמו הזמנת מלון)"
              : "• The \"shared\" traveler is used for tasks that apply to everyone (like hotel bookings)"}
          </p>
          <p>
            {language === "he" 
              ? "• כל נוסע אחר יקבל רשימת משימות אישית (כמו דרכון, תרופות)"
              : "• Each other traveler gets their own personal checklist (like passport, medications)"}
          </p>
          <p>
            {language === "he" 
              ? "• המזהה משמש לסינון המשימות - השתמש באותיות אנגליות קטנות"
              : "• The identifier is used to filter tasks - use lowercase English letters"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
