import React, {
    createContext,
    useContext,
    useEffect,
    useReducer,
    useState
} from "react";
import {
    getAllPlayersFromMatches,
    getPlayerMaybe,
    rounds2Matches
} from "../pairing-scoring";
import {playerStore, tourneyStore} from "./db";
import {playersReducer, tournamentReducer} from "./reducers";
import PropTypes from "prop-types";
import {symmetricDifference} from "ramda";

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
            document.body.style.cursor = "wait";
            tourneyStore.getItem(tourneyId).then(function (value) {
                console.log("loaded:", tourneyId);
                tourneyDispatch({state: value, type: "SET_STATE"});
                setIsTourneyLoaded(true);
                document.body.style.cursor = "auto";
            }).catch(function () {
                document.body.style.cursor = "auto";
            });
        },
        [tourneyId]
    );
    useEffect(
        function hydrateTourneyPlayersFromDb() {
            if (!tourney.roundList || !tourney.playerIds) {
                return; // the tournament hasn't been loaded yet
            }
            // Include players who have played matches but left the tournament,
            // as well as players who are registered but havne't played yet.
            const allTheIds = getAllPlayersFromMatches(
                rounds2Matches(tourney.roundList)
            ).concat(
                tourney.playerIds
            );
            // If there are no ids, update the player state and exit early.
            if (allTheIds.length === 0) {
                // This check prevents an infinite loop & memory leak.
                if (Object.keys(players).length !== 0) {
                    playersDispatch({state: {}, type: "LOAD_STATE"});
                }
                setIsPlayersLoaded(true);
                return;
            }
            document.body.style.cursor = "wait";
            playerStore.getItems(allTheIds).then(function (values) {
                // This safeguards against trying to fetch dummy IDs or IDs from
                // deleted players. If we updated without this condition, then
                // this `useEffect` would trigger an infinite loop and a memory
                // leak.
                const unChangedPlayers = symmetricDifference(
                    Object.keys(values),
                    Object.keys(players)
                );
                console.log("unchanged players:", unChangedPlayers);
                if (unChangedPlayers.length !== 0) {
                    console.log("hydrated player data");
                    playersDispatch({state: values, type: "LOAD_STATE"});
                }
                setIsPlayersLoaded(true);
                document.body.style.cursor = "auto";
            }).catch(function (error) {
                console.error("Couldn't load ids:", allTheIds);
                console.error(error);
                document.body.style.cursor = "auto";
            });
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
    const getPlayer = (id) => getPlayerMaybe(players, id); // curry
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
