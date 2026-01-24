import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { Loader2, Plus, Trash2, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";

interface CollaboratorsDialogProps {
  tripId: number;
  isOwner: boolean;
}

export default function CollaboratorsDialog({ tripId, isOwner }: CollaboratorsDialogProps) {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [newUserId, setNewUserId] = useState("");
  const [newPermission, setNewPermission] = useState<"view_only" | "can_edit">("view_only");

  const utils = trpc.useUtils();
  const { data: collaborators, isLoading } = trpc.collaborators.list.useQuery(
    { tripId },
    { enabled: isOpen }
  );

  const inviteMutation = trpc.collaborators.invite.useMutation({
    onSuccess: () => {
      toast.success(language === "he" ? "משתמש הוזמן בהצלחה" : "User invited successfully");
      setNewUserId("");
      setNewPermission("view_only");
      utils.collaborators.list.invalidate({ tripId });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const removeMutation = trpc.collaborators.remove.useMutation({
    onSuccess: () => {
      toast.success(language === "he" ? "משתמש הוסר" : "User removed");
      utils.collaborators.list.invalidate({ tripId });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updatePermissionMutation = trpc.collaborators.updatePermission.useMutation({
    onSuccess: () => {
      toast.success(language === "he" ? "הרשאות עודכנו" : "Permission updated");
      utils.collaborators.list.invalidate({ tripId });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleInvite = () => {
    const userId = parseInt(newUserId);
    if (isNaN(userId)) {
      toast.error(language === "he" ? "מזהה משתמש לא חוקי" : "Invalid user ID");
      return;
    }
    inviteMutation.mutate({ tripId, userId, permission: newPermission });
  };

  const handleRemove = (id: number) => {
    if (window.confirm(language === "he" ? "האם אתה בטוח שברצונך להסיר משתמש זה?" : "Are you sure you want to remove this user?")) {
      removeMutation.mutate({ id });
    }
  };

  const handlePermissionChange = (id: number, permission: "view_only" | "can_edit") => {
    updatePermissionMutation.mutate({ id, permission });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Users className="w-4 h-4 mr-2" />
          {language === "he" ? "שיתוף ושיתוף פעולה" : "Share & Collaborate"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {language === "he" ? "ניהול משתמשים משותפים" : "Manage Collaborators"}
          </DialogTitle>
          <DialogDescription>
            {language === "he" 
              ? "הזמן משתמשים לצפות או לערוך את הטיול" 
              : "Invite users to view or edit this trip"}
          </DialogDescription>
        </DialogHeader>

        {/* Invite new user */}
        {isOwner && (
          <div className="space-y-4 border-b pb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              {language === "he" ? "הזמן משתמש חדש" : "Invite New User"}
            </h3>
            <div className="grid grid-cols-[1fr_auto_auto] gap-2">
              <div>
                <Label htmlFor="userId">
                  {language === "he" ? "מזהה משתמש" : "User ID"}
                </Label>
                <Input
                  id="userId"
                  type="number"
                  placeholder={language === "he" ? "הזן מזהה משתמש" : "Enter user ID"}
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="permission">
                  {language === "he" ? "הרשאה" : "Permission"}
                </Label>
                <Select value={newPermission} onValueChange={(v: any) => setNewPermission(v)}>
                  <SelectTrigger id="permission" className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view_only">
                      {language === "he" ? "צפייה בלבד" : "View Only"}
                    </SelectItem>
                    <SelectItem value="can_edit">
                      {language === "he" ? "יכול לערוך" : "Can Edit"}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={handleInvite} 
                  disabled={inviteMutation.isPending || !newUserId}
                >
                  {inviteMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Collaborators list */}
        <div className="space-y-2">
          <h3 className="font-semibold">
            {language === "he" ? "משתמשים משותפים" : "Current Collaborators"}
          </h3>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : !collaborators || collaborators.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {language === "he" ? "אין משתמשים משותפים" : "No collaborators yet"}
            </p>
          ) : (
            <div className="space-y-2">
              {collaborators.map((collab) => (
                <div key={collab.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{collab.user.name || `User #${collab.userId}`}</p>
                    {collab.user.email && (
                      <p className="text-sm text-muted-foreground">{collab.user.email}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isOwner ? (
                      <>
                        <Select
                          value={collab.permission}
                          onValueChange={(v: any) => handlePermissionChange(collab.id, v)}
                          disabled={updatePermissionMutation.isPending}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="view_only">
                              {language === "he" ? "צפייה בלבד" : "View Only"}
                            </SelectItem>
                            <SelectItem value="can_edit">
                              {language === "he" ? "יכול לערוך" : "Can Edit"}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => handleRemove(collab.id)}
                          disabled={removeMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {collab.permission === "view_only"
                          ? language === "he" ? "צפייה בלבד" : "View Only"
                          : language === "he" ? "יכול לערוך" : "Can Edit"}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            {language === "he" ? "סגור" : "Close"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
