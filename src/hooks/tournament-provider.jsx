import React, {
    createContext,
    useContext,
    useEffect,
    useReducer,
    useState
} from "react";
import {curry, difference} from "ramda";
import {
    getAllPlayersFromMatches,
    getPlayerById,
    rounds2Matches
} from "../pairing-scoring";
import {playerStore, tourneyStore} from "./db";
import {playersReducer, tournamentReducer} from "./reducers";
import {DUMMY_ID} from "data-types";
import PropTypes from "prop-types";

const TournamentContext = createContext(null);

export function useTournament() {
    const state = useContext(TournamentContext);
    return state;
}

export function TournamentProvider({children, tourneyId}) {
    const [tourney, tourneyDispatch] = useReducer(tournamentReducer, {});
    const [players, playersDispatch] = useReducer(playersReducer, {});
    const [isTourneyLoaded, setIsTourneyLoaded] = useState(false);
    const [isPlayersLoaded, setIsPlayersLoaded] = useState(false);
    useEffect(
        function initTourneyFromDb() {
            tourneyStore.getItem(tourneyId).then(
                function tourneyWasLoaded(value) {
                    console.log("loaded:", tourneyId);
                    tourneyDispatch({state: value, type: "SET_STATE"});
                    setIsTourneyLoaded(true);
                }
            );
        },
        [tourneyId]
    );
    useEffect(
        function hydrateTourneyPlayersFromDb() {
            if (!tourney.roundList || !tourney.playerIds) {
                return; // the tournament hasn't been loaded yet
            }
            // This includes players who have played matches but left the
            // tournament, as well as players who are registered but havne't
            // played yet.
            const allTheIds = getAllPlayersFromMatches(
                rounds2Matches(tourney.roundList)
            ).concat(
                tourney.playerIds
            );
            // If we don't filter out the dummy, then this effect will always
            // fire and create a memory leak.
            const idsNoDummy = allTheIds.filter((id) => id !== DUMMY_ID);
            const changedPlayers = difference(idsNoDummy, Object.keys(players));
            if (changedPlayers.length > 0) {
                playerStore.getItems(idsNoDummy).then(function (values) {
                    console.log("hydrated player data");
                    playersDispatch({state: values, type: "LOAD_STATE"});
                    setIsPlayersLoaded(true);
                });
            } else {
                setIsPlayersLoaded(true);
            }
        },
        [tourney.roundList, players, tourney.playerIds]
    );
    useEffect(
        function saveTourneyToDb() {
            if (!isTourneyLoaded) {
                return;
            }
            tourneyStore.setItem(tourneyId, tourney).catch(function (error) {
                console.log("error saving tourney:", tourneyId, error);
            });
        },
        [tourneyId, tourney, isTourneyLoaded]
    );
    useEffect(
        function savePlayersToDb() {
            if (!isPlayersLoaded) {
                return;
            }
            playerStore.setItems(players).then(function (values) {
                console.log("saved player changes to DB:", values);
            }).catch(function (error) {
                console.log("couldn't save players to DB:", error);
            });
        },
        [players, isPlayersLoaded]
    );
    const getPlayer = curry(getPlayerById)(players);
    if (!isTourneyLoaded || !isPlayersLoaded) {
        return <div>Loading...</div>;
    }
    return (
        <TournamentContext.Provider
            value={{
                getPlayer,
                players,
                playersDispatch,
                tourney,
                tourneyDispatch
            }}
        >
            {children}
        </TournamentContext.Provider>
    );
}
TournamentProvider.propTypes = {
    children: PropTypes.node.isRequired,
    tourneyId: PropTypes.string.isRequired
};
