import { Color, Role } from 'shogiops/types';

export type Type = 'outcomes' | 'moves' | 'opponents' | 'times' | 'analysis' | 'custom';

export interface Result {
  nbOfGames: number;
}
export interface CustomResult extends Result {
  data?: {
    labels: string[];
    dataset: Record<string, Record<string, number>>;
  };
  error?: string;
}
export interface OutcomeResult extends Result {
  winrate: WinRate;
  winStatuses: CounterObj<Status>;
  lossStatuses: CounterObj<Status>;
}
export interface MovesResult extends Result {
  nbOfMoves: number;
  nbOfDrops: number;
  nbOfCaptures: number;
  nbOfPromotions: number;
  nbOfMovesByRole: CounterObj<Role>;
  nbOfDropsByRole: CounterObj<Role>;
  nbOfCapturesByRole: CounterObj<Role>;
  winrateByFirstMove: {
    sente: Record<string, WinRate>;
    gote: Record<string, WinRate>;
  };
}
export interface OpponentResult extends Result {
  avgOpponentRating: number;
  avgOpponentRatingDiff: number;
  winrateByMostPlayedOpponent: Record<string, WinRate>;
}
export interface TimesResult extends Result {
  totalTime: number;
  avgTimePerMoveAndDrop: number;
  avgTimePerMove: number;
  avgTimePerDrop: number;
  avgTimePerGame: number;
  sumOfTimesByMoveRole: PartialRecord<Role, Centis>;
  sumOfTimesByDropRole: PartialRecord<Role, Centis>;
  nbOfMovesByRole: CounterObj<Role>;
  nbOfDropsByRole: CounterObj<Role>;
}
export interface AnalysisResult extends Result {
  accuracy: Accuracy;
  accuracyByOutcome: [Accuracy, Accuracy, Accuracy];
  accuracyByOutcomeCount: [number, number, number];
  accuracyByMoveNumber: Record<number, Accuracy>;
  accuracyByMoveNumberCount: CounterObj<number>;
  accuracyByMoveRole: PartialRecord<Role, Accuracy>;
  accuracyByMoveRoleCount: PartialRecord<Role, number>;
  accuracyByDropRole: PartialRecord<Role, Accuracy>;
  accuracyByDropRoleCount: PartialRecord<Role, number>;
  accuracyByRole: PartialRecord<Role, Accuracy>; // total
  accuracyByRoleCount: PartialRecord<Role, number>;
}

export interface Filter {
  since: Date;
  variant: Variant;
  color: Color | 'both';
  rated: 'yes' | 'no' | 'both';
  speeds: Speed[];
  computer: 'yes' | 'no' | 'both';
  custom: Custom;
}
export interface Custom {
  type: 'game' | 'moves';
  x: string;
  y: string;
  tmz?: string;
}

export interface Game {
  id: string;
  color: Color;
  variant: Variant;
  outcome: Outcome;
  status: Status;
  speed: Speed;
  rated: boolean;
  date: Date;
  computer: boolean;
  usis: Usi[];
  clockConfig?: ClockConfig;
  movetimes?: Centis[];
  // moves
  nbOfMoves: number;
  nbOfDrops: number;
  nbOfCaptures: number;
  nbOfPromotions: number;
  nbOfMovesByRole: CounterObj<RoleIndex>;
  nbOfDropsByRole: CounterObj<RoleIndex>;
  nbOfCapturesByRole: CounterObj<RoleIndex>;
  initialLine?: Usi[]; // for gote this is two moves
  earlyBishopExchange?: boolean; // only for standard
  // opponent
  opponent?: string;
  opponentRating?: number;
  opponentRatingDiff?: number;
  // times
  totalTimeOfMoves: Centis;
  totalTimeOfDrops: Centis;
  sumOfTimesByMoveRole: PartialRecord<RoleIndex, Centis>;
  sumOfTimesByDropRole: PartialRecord<RoleIndex, Centis>;
  // analysis
  accuracy: Accuracy | undefined;
  accuracies: Accuracy[];
  sumOfAccuracyByMoveRole: PartialRecord<RoleIndex, Accuracy>;
  sumOfAccuracyByDropRole: PartialRecord<RoleIndex, Accuracy>;
}

export type WinRate = [number, number, number];

export type CounterObj<TKey extends PropertyKey> = PartialRecord<TKey, number>;
export type PartialRecord<TKey extends PropertyKey, TValue> = {
  [key in TKey]?: TValue;
};

export type Accuracy = number;

// centipawns or mate
export type Eval = [number, undefined] | [undefined, number] | undefined;

export type Centis = number;

export interface ClockConfig {
  limit: Centis;
  byo: Centis;
  inc: Centis;
  per: number;
}

export type RoleIndex = number;

export type Usi = string;

export enum Variant {
  Standard = 1,
  Minishogi = 2,
  Chushogi = 3,
  Annanshogi = 4,
  Kyotoshogi = 5,
  Checkshogi = 6,
}

export enum Outcome {
  Win,
  Draw,
  Loss,
}

export enum Status {
  Checkmate = 30,
  Resign = 31,
  Stalemate = 32,
  Timeout = 33,
  Draw = 34,
  Outoftime = 35,
  Cheat = 36,
  NoStart = 37,
  UnknownFinish = 38,
  TryRule = 39,
  PerpetualCheck = 40,
  Impasse27 = 41,
  RoyalsLost = 42,
  BareKing = 43,
  Repetition = 44,
  SpecialVariantEnd = 45,
}

export enum Speed {
  UltraBullet = 0,
  Bullet = 1,
  Blitz = 2,
  Rapid = 5,
  Classical = 3,
  Correspondence = 4,
}
