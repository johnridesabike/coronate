export type MatchScore = 0 | 1 | 0.5;
export interface Match {
    players: [number, number],
    result: [MatchScore, MatchScore],
    origRating: [number, number],
    newRating: [number, number]
}
export type Round = Match[];
export interface Tournament {
    name: string,
    tieBreaks: number[],
    byeQueue: number[],
    players: number[],
    roundList: Round[]
}
export interface Player {
    id: number,
    firstName: string,
    lastName: string,
    rating: number,
    matchCount: number
}
export interface PlayerData {
    id: number,
    score: number,
    dueColor?: number,
    colorBalance: number,
    opponentHistory: number[],
    upperHalf: boolean,
    rating: number,
    avoidList: number[]
}
export type ScoreCalculator = (
    playerId: number,
    roundList: Round[],
    roundId?: number
) => any
export interface Standing {
    id: number,
    score: number,
    tieBreaks: number[]
}
