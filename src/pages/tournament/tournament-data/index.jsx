import React, {useEffect, useReducer} from "react";
import {curry, filter, symmetricDifference} from "ramda";
import {
    getPlayerMaybe,
    isRoundComplete,
    rounds2Matches
    // types
} from "../../../data-types";
import {playerStore, tourneyStore} from "../../../hooks/db";
import PropTypes from "prop-types";
import playersReducer from "./players-reducer";
// import t from "tcomb";
import tourneyReducer from "./tournament-reducer";
import {useLoadingCursor} from "../../../hooks";
import {useWindowContext} from "../../../components/window";

function getAllPlayerIdsFromMatches(matchList) {
    const allPlayers = matchList.reduce(
        (acc, {playerIds}) => acc.concat(playerIds),
        []
    );
    return Array.from(new Set(allPlayers));
}

function calcNumOfRounds(playerCount) {
    const roundCount = Math.ceil(Math.log2(playerCount));
    // If there aren't any players then `roundCount` === `-Infinity`.
    return Number.isFinite(roundCount) ? roundCount : 0;
}

const emptyTourney = {
    name: "",
    playerIds: [],
    roundList: []
};
const loadReducer = (oldState, newState) => ({...oldState, ...newState});
// Usually I would be more comfortable with `dbError: false` instead of the
// opposite, `noDbError: true`, since the latter leads to awkward logical
// statements like "if there is not no db error." However, `noDbError` is
// consistent with the rest of this state's properties in that `true` means
// something is good, and `false` means something isn't. It allows shortcuts
// like calling `.includes(false)` on the values.
const initLoading = {noDbError: true, players: false, tourney: false};

export default function TournamentData({children, tourneyId}) {
    const [tourney, tourneyDispatch] = useReducer(tourneyReducer, emptyTourney);
    const {name, playerIds, roundList} = tourney;
    const [players, playersDispatch] = useReducer(playersReducer, {});
    const [isLoaded, loadedDispatch] = useReducer(loadReducer, initLoading);
    useLoadingCursor(isLoaded.players && isLoaded.tourney);
    const {winDispatch} = useWindowContext();
    useEffect(
        function setDocumentTitle() {
            if (!name) {
                return;
            }
            winDispatch({title: name});
            return () => winDispatch({title: ""});
        },
        [name, winDispatch]
    );
    useEffect(
        function initTourneyFromDb() {
            let didCancel = false;
            (async function () {
                const value = await tourneyStore.getItem(tourneyId);
                console.log("loaded:", tourneyId);
                if (!value) {
                    loadedDispatch({noDbError: false});
                } else if(!didCancel) {
                    tourneyDispatch({state: value || {}, type: "SET_STATE"});
                    loadedDispatch({tourney: true});
                }
            }());
            return () => didCancel = true;
        },
        [tourneyId]
    );
    useEffect(
        function hydrateTourneyPlayersFromDb() {
            // Don't run this without loading the tourney first. Otherwise, it
            // will interpret the placeholder `roundList` data as meaning there
            // are no active players and load an empty object.
            if (!isLoaded.tourney) {
                return;
            }
            // Include players who have played matches but left the tournament,
            // as well as players who are registered but havne't played yet.
            const allTheIds = getAllPlayerIdsFromMatches(
                rounds2Matches(roundList)
            ).concat(
                playerIds
            );
            // If there are no ids, update the player state and exit early.
            if (allTheIds.length === 0) {
                // This check prevents an infinite loop & memory leak.
                if (Object.keys(players).length !== 0) {
                    playersDispatch({state: {}, type: "LOAD_STATE"});
                }
                loadedDispatch({players: true});
                return;
            }
            let didCancel = false;
            (async function () {
                const values = await playerStore.getItems(allTheIds);
                // This safeguards against trying to fetch dummy IDs or IDs from
                // deleted players. If we updated without this condition, then
                // this `useEffect` would trigger an infinite loop and a memory
                // leak.
                const unChangedPlayers = symmetricDifference(
                    Object.keys(values),
                    Object.keys(players)
                );
                console.log(
                    "unchanged players:",
                    Object.keys(unChangedPlayers).length
                );
                if (unChangedPlayers.length !== 0 && !didCancel) {
                    console.log("hydrated player data");
                    playersDispatch({state: values, type: "LOAD_STATE"});
                    loadedDispatch({players: true});
                }
            }());
            return () => didCancel = true;
        },
        [roundList, players, playerIds, isLoaded.tourney]
    );
    useEffect(
        function saveTourneyToDb() {
            if (
                !isLoaded.tourney
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
        [tourneyId, tourney, isLoaded.tourney]
    );
    useEffect(
        function savePlayersToDb() {
            if (!isLoaded.players) {
                return;
            }
            (async function () {
                const values = await playerStore.setItems(players);
                console.log(
                    "saved player changes to DB:",
                    Object.keys(values).length
                );
            }());
        },
        [players, isLoaded.players]
    );
    const getPlayer = curry(getPlayerMaybe)(players);
    // `players` includes players in past matches who may have left
    // `activePlayers` is only players to be matched in future matches.
    // Use Ramda's `filter` because it can filter objects.
    const activePlayers = filter(({id}) => playerIds.includes(id), players);
    const roundCount = calcNumOfRounds(Object.keys(activePlayers).length);
    const isItOver = roundList.length >= roundCount;
    const isNewRoundReady = (
        roundList.length === 0
        ? true
        : isRoundComplete(roundList, activePlayers, roundList.length - 1)
    );
    if (!isLoaded.noDbError) {
        return <div>Error: tournament not found.</div>;
    }
    if (Object.values(isLoaded).includes(false)) {
        return <div>Loading...</div>;
    }
    return children({
        activePlayers,
        getPlayer,
        isItOver,
        isNewRoundReady,
        players,
        playersDispatch,
        roundCount,
        tourney,
        tourneyDispatch
    });
}
TournamentData.propTypes = {
    children: PropTypes.func.isRequired,
    tourneyId: PropTypes.string.isRequired
};

const TournamentType = PropTypes.shape({
    activePlayers: PropTypes.object,
    getPlayer: PropTypes.func,
    isItOver: PropTypes.bool,
    isNewRoundReady: PropTypes.bool,
    players: PropTypes.object,
    playersDispatch: PropTypes.func,
    roundCount: PropTypes.number,
    tourney: PropTypes.object,
    tourneyDispatch: PropTypes.func
});
export {TournamentType};
