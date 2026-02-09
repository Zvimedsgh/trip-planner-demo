import { useRef, useEffect, useState } from "react";
import SignaturePad from "signature_pad";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SignatureAgreementProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSign: (signatureData: string) => void;
}

const AGREEMENT_TEXT = `
# Trip Planner Pro - Terms of Service

**[PLACEHOLDER - User will provide agreement text]**

This is a placeholder for the terms of service agreement. The actual agreement text will be provided by the user.

## Key Points:
- Payment terms (Bit/Paybox details to be added)
- Service description
- User responsibilities
- Privacy policy
- Refund policy
- Contact information

---

By signing below, you agree to these terms and conditions.
`;

export function SignatureAgreement({ open, onOpenChange, onSign }: SignatureAgreementProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<SignaturePad | null>(null);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    if (canvasRef.current && open) {
      signaturePadRef.current = new SignaturePad(canvasRef.current, {
        backgroundColor: "rgb(255, 255, 255)",
        penColor: "rgb(0, 0, 0)",
      });

      signaturePadRef.current.addEventListener("endStroke", () => {
        setHasSignature(!signaturePadRef.current?.isEmpty());
      });

      // Set canvas size
      const canvas = canvasRef.current;
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      canvas.getContext("2d")?.scale(ratio, ratio);
    }

    return () => {
      signaturePadRef.current?.off();
    };
  }, [open]);

  const handleClear = () => {
    signaturePadRef.current?.clear();
    setHasSignature(false);
  };

  const handleSign = () => {
    if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
      const signatureData = signaturePadRef.current.toDataURL();
      onSign(signatureData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Service Agreement</DialogTitle>
          <DialogDescription>
            Please read the agreement carefully and sign below to continue.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[300px] border rounded-md p-4">
          <div className="prose prose-sm max-w-none whitespace-pre-wrap">
            {AGREEMENT_TEXT}
          </div>
        </ScrollArea>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Your Signature</label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={!hasSignature}
            >
              Clear
            </Button>
          </div>
          <canvas
            ref={canvasRef}
            className="border-2 border-dashed rounded-md w-full"
            style={{ height: "150px", touchAction: "none" }}
          />
          <p className="text-xs text-muted-foreground">
            Sign above using your mouse or touchscreen
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSign} disabled={!hasSignature}>
            Sign & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
