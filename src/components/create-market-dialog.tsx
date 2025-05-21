import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useCreateMarket } from "../hooks/useContract";

interface CreateMarketDialogProps {
  onMarketCreated?: () => void;
}

export function CreateMarketDialog({ onMarketCreated }: CreateMarketDialogProps = {}) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const { createMarket, isLoading, isSuccess, error } = useCreateMarket();
  
  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setQuestion("");
      setEndDate("");
    }
  }, [open]);
  
  // Handle success state
  useEffect(() => {
    if (isSuccess && open) {
      setOpen(false);
      // Notify parent component to refresh markets
      if (onMarketCreated) {
        onMarketCreated();
      }
    }
  }, [isSuccess, open, onMarketCreated]);
  
  const handleSubmit = async () => {
    if (question && endDate) {
      await createMarket(question, new Date(endDate));
      //refresh the markets
      console.log("refreshing markets")
      //wait for 5 seconds
      await new Promise(resolve => setTimeout(resolve, 5000));
      if (onMarketCreated) {
        onMarketCreated();
      }
     
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-gray-800 text-white">
        <DialogHeader>
          <DialogTitle>Create a new prediction market</DialogTitle>
          <DialogDescription>
            Create a yes/no question for users to predict the outcome.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="question" className="text-right">
              Question
            </Label>
            <Input
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="col-span-3"
              placeholder="Will ETH reach $5000 by end of year?"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endDate" className="text-right">
              End Date
            </Label>
            <Input
              id="endDate"
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="col-span-3"
            />
          </div>
          {error && (
            <div className="text-red-400 text-sm mt-2">
              Error: {error.message}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Market"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 