import {
    TournamentProvider,
    useTournament
} from "./tournament-provider";
import {
    useAllPlayersDb,
    useAllTournamentsDb,
    useOptionsDb
    // usePlayersDb,
    // useTournamentDb
} from "./db";
import {useEffect} from "react";

export function useDocumentTitle(title) {
    useEffect(
        function () {
            const origTitle = document.title;
            document.title = "Chessahoochee: " + title;
            return function () {
                document.title = origTitle;
            };
        },
        [title]
    );
}

export {
    useAllPlayersDb,
    useAllTournamentsDb,
    useOptionsDb,
    useTournament,
    TournamentProvider
};
