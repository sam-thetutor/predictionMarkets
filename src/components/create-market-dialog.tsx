import { useState } from "react";
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

export function CreateMarketDialog() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const { createMarket, isLoading, isSuccess } = useCreateMarket();
  
  const handleSubmit = () => {
    if (question && endDate) {
      createMarket(question, new Date(endDate));
      if (isSuccess) {
        setOpen(false);
        setQuestion("");
        setEndDate("");
      }
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Prediction Market</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
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