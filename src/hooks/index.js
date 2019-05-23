import {
    TournamentProvider,
    useTournament
} from "./providers";
import {
    useAllPlayersDb,
    useOptionsDb,
    usePlayersDb,
    useTournamentDb
} from "./db";
import {difference} from "ramda";

export function useRound(tourney, roundId) {
    const matchList = tourney.roundList[roundId];
    const matched = matchList.reduce(
        (acc, match) => acc.concat(match.players),
        []
    );
    const unmatched = difference(tourney.players, matched);
    return {matchList, unmatched};
}

export {
    useAllPlayersDb,
    usePlayersDb,
    useOptionsDb,
    useTournament,
    useTournamentDb,
    TournamentProvider
};
