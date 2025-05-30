"use client"
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { useResolveMarket } from "../hooks/useContract";

interface ResolveMarketDialogProps {
  marketId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResolveMarketDialog({
  marketId,
  open,
  onOpenChange,
}: ResolveMarketDialogProps) {
  const { resolveMarket, isLoading, isSuccess } = useResolveMarket();
  
  const handleResolve = (outcome: boolean) => {
    resolveMarket(marketId, outcome);
    if (isSuccess) {
      onOpenChange(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Resolve Market</DialogTitle>
          <DialogDescription>
            As the creator of this market, you need to resolve it with the correct outcome.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center gap-4 py-4">
          <Button 
            onClick={() => handleResolve(true)} 
            disabled={isLoading}
            className="w-24"
          >
            YES
          </Button>
          <Button 
            onClick={() => handleResolve(false)} 
            disabled={isLoading}
            className="w-24"
          >
            NO
          </Button>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 