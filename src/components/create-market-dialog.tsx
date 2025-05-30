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

const CATEGORIES = ["Politics", "Sports", "Health", "Science"];

export function CreateMarketDialog({ onMarketCreated }: CreateMarketDialogProps = {}) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [endDate, setEndDate] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  
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
  
  const handleSubmit = async (e:any) => {
    e.preventDefault();
    if (question && description && endDate) {
      await createMarket(question, description, category, new Date(endDate));
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
        <Button className="bg-gray-800 text-white border cursor-pointer border-gray-700">Create</Button>
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
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3 w-full mb-4 px-3 py-2 border rounded bg-gray-900 text-white"
              placeholder="Describe the market in detail..."
              rows={4}
              required
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="col-span-3 w-full mb-4 px-3 py-2 border rounded"
              required
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
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