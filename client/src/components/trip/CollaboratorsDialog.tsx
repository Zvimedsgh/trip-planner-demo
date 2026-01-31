import { useState, useEffect } from "react";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUserName, setSelectedUserName] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [newPermission, setNewPermission] = useState<"view_only" | "can_edit">("view_only");

  const utils = trpc.useUtils();
  const { data: collaborators, isLoading } = trpc.collaborators.list.useQuery(
    { tripId },
    { enabled: isOpen }
  );

  const { data: searchResults, isLoading: isSearching } = trpc.collaborators.searchUsers.useQuery(
    { searchTerm },
    { enabled: searchTerm.length >= 2 && showSuggestions }
  );

  const inviteMutation = trpc.collaborators.invite.useMutation({
    onSuccess: () => {
      toast.success(language === "he" ? "משתמש הוזמן בהצלחה" : "User invited successfully");
      setSearchTerm("");
      setSelectedUserId(null);
      setSelectedUserName("");
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
    if (!selectedUserId) {
      toast.error(language === "he" ? "אנא בחר משתמש מהרשימה" : "Please select a user from the list");
      return;
    }
    inviteMutation.mutate({ tripId, userId: selectedUserId, permission: newPermission });
  };

  const handleRemove = (id: number) => {
    if (window.confirm(language === "he" ? "האם אתה בטוח שברצונך להסיר משתמש זה?" : "Are you sure you want to remove this user?")) {
      removeMutation.mutate({ id });
    }
  };

  const handlePermissionChange = (id: number, permission: "view_only" | "can_edit") => {
    updatePermissionMutation.mutate({ id, permission });
  };

  const handleSelectUser = (userId: number, userName: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setSearchTerm(userName);
    setShowSuggestions(false);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setSelectedUserId(null);
    setSelectedUserName("");
    setShowSuggestions(true);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowSuggestions(false);
    if (showSuggestions) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showSuggestions]);

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
            {/* Helper message when no users exist */}
            <div className="bg-muted/50 p-3 rounded-md text-sm space-y-2">
              <p className="text-muted-foreground">
                {language === "he" 
                  ? "כדי להזמין משתמשים, שלח להם את הקישור לאפליקציה:"
                  : "To invite users, send them the app link:"}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.origin);
                  toast.success(language === "he" ? "הקישור הועתק!" : "Link copied!");
                }}
              >
                {language === "he" ? "העתק קישור לאפליקציה" : "Copy App Link"}
              </Button>
              <p className="text-xs text-muted-foreground">
                {language === "he"
                  ? "לאחר שיתחברו, תוכל לחפש אותם כאן ולהזמין אותם לטיול."
                  : "After they sign up, you can search for them here and invite them to the trip."}
              </p>
            </div>
            <div className="grid grid-cols-[1fr_auto_auto] gap-2">
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <Label htmlFor="userName">
                  {language === "he" ? "שם המשתמש" : "User Name"}
                </Label>
                <Input
                  id="userName"
                  type="text"
                  placeholder={language === "he" ? "הזן שם פרטי (למשל: דני)" : "Enter first name (e.g., Danny)"}
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                />
                {/* Autocomplete suggestions */}
                {showSuggestions && searchTerm.length >= 2 && (
                  <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {isSearching ? (
                      <div className="p-3 text-center text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" />
                        {language === "he" ? "מחפש..." : "Searching..."}
                      </div>
                    ) : !searchResults || searchResults.length === 0 ? (
                      <div className="p-3 text-center text-sm">
                        <p className="text-muted-foreground mb-2">
                          {language === "he" ? "לא נמצאו משתמשים" : "No users found"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {language === "he" 
                            ? "שלח קישור לחברים כדי שיתחברו תחילה"
                            : "Send app link to friends so they can sign up first"}
                        </p>
                      </div>
                    ) : (
                      searchResults.map((user) => (
                        <button
                          key={user.id}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                          onClick={() => handleSelectUser(user.id, user.name || `User #${user.id}`)}
                        >
                          <p className="font-medium">{user.name || `User #${user.id}`}</p>
                        </button>
                      ))
                    )}
                  </div>
                )}
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
                  disabled={inviteMutation.isPending || !selectedUserId}
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
                    <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                      {collab.lastSeen && (
                        <span>
                          {language === "he" ? "נראה לאחרונה:" : "Last seen:"}{" "}
                          {new Date(collab.lastSeen).toLocaleDateString(language === "he" ? "he-IL" : "en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                      <span>
                        {language === "he" ? "ביקורים:" : "Visits:"} {collab.visitCount}
                      </span>
                    </div>
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
