export interface Match {
    id: string,
    players: [number, number],
    result: [number, number],
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
    matchCount: number,
    type: string
}
