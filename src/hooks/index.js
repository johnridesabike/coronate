import {
    TournamentProvider,
    useTournament
} from "./tournament-provider";
import {
    useAllPlayersDb,
    useAllTournamentsDb,
    useOptionsDb,
    usePlayersDb,
    useTournamentDb
} from "./db";
import {difference} from "ramda";

export function useRound(tourney, roundId) {
    const matchList = tourney.roundList[roundId];
    // TODO: make this return a dict instead
    const matched = matchList.reduce(
        (acc, match) => acc.concat(match.playerIds),
        []
    );
    const unmatched = difference(tourney.playerIds, matched);
    return {matchList, unmatched};
}

export {
    useAllPlayersDb,
    usePlayersDb,
    useAllTournamentsDb,
    useOptionsDb,
    useTournament,
    useTournamentDb,
    TournamentProvider
};
