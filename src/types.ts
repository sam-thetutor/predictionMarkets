export interface Market {
  id: number;
  question: string;
  endTime: bigint;
  resolved: boolean;
  outcome: number;
  creator: string;
  totalYesAmount: bigint;
  totalNoAmount: bigint;
  userYesAmount?: bigint; // Optional field for user's position
  userNoAmount?: bigint;  // Optional field for user's position
  category: string;
  description: string;
} 


export interface UserPosition {
  yesAmount: bigint;
  noAmount: bigint;
}
