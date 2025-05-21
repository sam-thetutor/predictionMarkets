export interface Market {
  id: number;
  question: string;
  endTime: Date;
  resolved: boolean;
  outcome: 0 | 1 | 2; // 0 = unresolved, 1 = yes, 2 = no
  creator: string;
  totalYesAmount: bigint;
  totalNoAmount: bigint;
}

export interface UserPosition {
  yesAmount: bigint;
  noAmount: bigint;
}


export interface MarketWithUserPosition extends Market {
  userPosition: UserPosition;
} 