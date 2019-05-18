import {Match} from "..";

export interface PlayerStats {
    profile: Player,
    id: number,
    score: number,
    dueColor?: number,
    colorBalance: number,
    opponentHistory: number[],
    upperHalf: boolean,
    rating: number,
    avoidList: number[],
    hasHadBye: boolean
}
export interface Standing {
    id: number,
    score: number,
    tieBreaks: number[]
}
export type ScoreCalculator = (
    playerId: number,
    roundList: Match[][],
    roundId?: number
) => any
