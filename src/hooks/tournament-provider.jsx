import React, {
    createContext,
    useContext,
    useEffect,
    useReducer,
    useState
} from "react";
import {filter, symmetricDifference} from "ramda";
import {
    getAllPlayerIdsFromMatches,
    getPlayerMaybe,
    rounds2Matches
} from "../data-types";
import {playerStore, tourneyStore} from "./db";
import {playersReducer, tournamentReducer} from "./reducers";
import PropTypes from "prop-types";
import {useLoadingCursor} from "./hooks";

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
    const [isDbError, setIsDbError] = useState(false);
    useLoadingCursor(isPlayersLoaded && isTourneyLoaded);
    useEffect(
        function initTourneyFromDb() {
            tourneyStore.getItem(tourneyId).then(function (value) {
                console.log("loaded:", tourneyId);
                if (!value) {
                    setIsDbError(true);
                }
                tourneyDispatch({state: value || {}, type: "SET_STATE"});
                setIsTourneyLoaded(true);
            }).catch(function () {
                setIsDbError(true);
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
            const allTheIds = getAllPlayerIdsFromMatches(
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
            }).catch(function (error) {
                console.error("Couldn't load ids:", allTheIds);
                console.error(error);
            });
        },
        [tourney.roundList, players, tourney.playerIds]
    );
    useEffect(
        function saveTourneyToDb() {
            if (
                !isTourneyLoaded
                // The tourney length is 0 when it wasn't found in the DB
                || Object.keys(tourney).length === 0
                // I don't know why, but this happens sometimes with a bad URL
                || tourneyId !== tourney.id
            ) {
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
    const getPlayer = getPlayerMaybe(players);
    // `players` includes players in past matches who may have left
    // `activePlayers` is only players to be matched in future matches.
    const activePlayers = filter(
        (p) => tourney.playerIds.includes(p.id),
        players
    );
    if (isDbError) {
        return <div>Error: tournament not found.</div>;
    }
    if (!isTourneyLoaded || !isPlayersLoaded) {
        return <div>Loading...</div>;
    }
    return (
        <TournamentContext.Provider
            value={{
                activePlayers,
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
