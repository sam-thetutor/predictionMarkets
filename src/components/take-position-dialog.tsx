import { useState } from "react";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useTakePosition } from "../hooks/useContract";

interface TakePositionDialogProps {
  marketId: number;
  isYes: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TakePositionDialog({
  marketId,
  isYes,
  open,
  onOpenChange,
}: TakePositionDialogProps) {
  const [amount, setAmount] = useState("");
  const { takePosition, isLoading, isSuccess } = useTakePosition();
  
  const handleSubmit = () => {
    
    if (amount) {
      takePosition(marketId, isYes, amount);
      if (isSuccess) {
        onOpenChange(false);
        setAmount("");
      }
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange} >
      <DialogContent className="sm:max-w-[425px] text-white bg-gray-800">
        <DialogHeader>
          <DialogTitle>Place your prediction</DialogTitle>
          <DialogDescription>
            You are betting that the outcome will be {isYes ? "YES" : "NO"}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col items-start justify-start gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount 
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="col-span-3"
              placeholder="0.1"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit} disabled={isLoading} className="bg-gray-800 text-white border cursor-pointer border-gray-700">
            {isLoading ? "Confirming..." : `Bet ${isYes ? "YES" : "NO"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 