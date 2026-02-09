import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { SignatureAgreement } from "@/components/SignatureAgreement";

export function DemoExpiryDialog() {
  const [showWarning, setShowWarning] = useState(false);
  const [showUpgradeChoice, setShowUpgradeChoice] = useState(false);
  const [showDataChoice, setShowDataChoice] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [keepData, setKeepData] = useState(false);

  const { data: demoStatus } = trpc.demo.getStatus.useQuery(undefined, {
    refetchInterval: 60000, // Check every minute
  });

  useEffect(() => {
    if (demoStatus?.isDemoUser && demoStatus.daysRemaining !== null) {
      // Show warning when 1 day or less remaining
      if (demoStatus.daysRemaining <= 1 && !demoStatus.isExpired) {
        setShowWarning(true);
      }
      
      // Show expired dialog
      if (demoStatus.isExpired) {
        setShowWarning(false);
        setShowUpgradeChoice(true);
      }
    }
  }, [demoStatus]);

  const handleContinue = () => {
    setShowWarning(false);
    setShowUpgradeChoice(false);
    setShowDataChoice(true);
  };

  const handleDelete = () => {
    // TODO: Implement data deletion
    alert("Your data will be deleted. This feature is coming soon.");
    setShowWarning(false);
    setShowUpgradeChoice(false);
  };

  const handleDataChoice = (keep: boolean) => {
    setKeepData(keep);
    setShowDataChoice(false);
    setShowSignature(true);
  };

  const handleSign = (signatureData: string) => {
    setShowSignature(false);
    // TODO: Send signature and upgrade request to backend
    alert(`Agreement signed! Data choice: ${keepData ? 'keep' : 'delete'}. Payment instructions coming soon.`);
  };

  return (
    <>
      {/* Warning Dialog - 24 hours before expiry */}
      <Dialog open={showWarning} onOpenChange={setShowWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Demo Expiring Soon
            </DialogTitle>
            <DialogDescription>
              Your demo will expire in {demoStatus?.daysRemaining === 1 ? '24 hours' : 'less than 24 hours'}.
              Would you like to continue using Trip Planner Pro?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWarning(false)}>
              Remind Me Later
            </Button>
            <Button onClick={handleContinue}>
              Yes, Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upgrade Choice Dialog - after expiry */}
      <Dialog open={showUpgradeChoice} onOpenChange={setShowUpgradeChoice}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Demo Expired
            </DialogTitle>
            <DialogDescription>
              Your demo period has ended. Would you like to upgrade to continue using Trip Planner Pro?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="destructive" onClick={handleDelete}>
              No, Delete Everything
            </Button>
            <Button onClick={handleContinue}>
              Yes, Upgrade Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Data Choice Dialog */}
      <Dialog open={showDataChoice} onOpenChange={setShowDataChoice}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Keep Your Demo Data?</DialogTitle>
            <DialogDescription>
              Do you want to keep your custom trip data, or start fresh with an empty account?
              <br /><br />
              <strong>Note:</strong> The Slovakia demo trip will not be included in your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleDataChoice(false)}>
              Start Fresh
            </Button>
            <Button onClick={() => handleDataChoice(true)}>
              Keep My Trip
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Signature Agreement Dialog */}
      <SignatureAgreement
        open={showSignature}
        onOpenChange={setShowSignature}
        onSign={handleSign}
      />
    </>
  );
}
