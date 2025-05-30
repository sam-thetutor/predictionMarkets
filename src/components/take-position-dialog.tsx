"use client"
import { useState } from 'react';
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
  const { takePosition } = useTakePosition();
  const [amount, setAmount] = useState("");

  const handleSubmit = async () => {
    try {
      await takePosition(marketId, isYes, amount);
      onOpenChange(false);
    } catch (error) {
      console.error('Error taking position:', error);
    }
  };

  return (
    open && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">{isYes ? 'Bet YES' : 'Bet NO'}</h2>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg shadow hover:bg-indigo-600 transition"
            >
              Confirm
            </button>
            <button
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg shadow hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  );
} 