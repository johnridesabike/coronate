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
import {assoc} from "ramda";

/**
 * This creates a filtered version of `players` with only the players that are
 * not matched for the specified round.
 * This isn't really a "hook" but multiple components use this logic.
 */
export function useUnmatched(tourney, players, roundId) {
    const matchList = tourney.roundList[roundId] || [];
    const matchedIds = matchList.reduce(
        (acc, match) => acc.concat(match.playerIds),
        []
    );
    const unmatched = Object.values(players).reduce(
        (acc, player) => (
            (matchedIds.includes(player.id))
            ? acc
            : assoc(player.id, player, acc)
        ),
        {}
    );
    return unmatched;
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
