import React, {
    useEffect,
    useReducer,
    useState
} from "react";
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
        (acc, match) => acc.concat(match.playerIds),
        []
    );
    return Array.from(new Set(allPlayers));
}

function calcNumOfRounds(playerCount) {
    const roundCount = Math.ceil(Math.log2(playerCount));
    // If there aren't any players then `roundCount` === `-Infinity`.
    return (Number.isFinite(roundCount)) ? roundCount : 0;
}

const emptyTourney = {
    name: "",
    roundList: []
};

// eslint-disable-next-line complexity
export default function TournamentData({children, tourneyId}) {
    const [tourney, tourneyDispatch] = useReducer(tourneyReducer, emptyTourney);
    const [players, playersDispatch] = useReducer(playersReducer, {});
    const [isTourneyLoaded, setIsTourneyLoaded] = useState(false);
    const [isPlayersLoaded, setIsPlayersLoaded] = useState(false);
    const [isDbError, setIsDbError] = useState(false);
    useLoadingCursor(isPlayersLoaded && isTourneyLoaded);
    const {winDispatch} = useWindowContext();
    useEffect(
        function setDocumentTitle() {
            if (!tourney.name) {
                return;
            }
            winDispatch({title: tourney.name});
            return function () {
                winDispatch({action: "RESET_TITLE"});
            };
        },
        [tourney.name, winDispatch]
    );
    useEffect(
        function initTourneyFromDb() {
            let didCancel = false;
            (async function () {
                const value = await tourneyStore.getItem(tourneyId);
                console.log("loaded:", tourneyId);
                if (!value) {
                    setIsDbError(true);
                } else if(!didCancel) {
                    tourneyDispatch({state: value || {}, type: "SET_STATE"});
                    setIsTourneyLoaded(true);
                }
            }());
            return function unMount() {
                didCancel = true;
            };
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
                console.log("unchanged players:", unChangedPlayers);
                if (unChangedPlayers.length !== 0 && !didCancel) {
                    console.log("hydrated player data");
                    playersDispatch({state: values, type: "LOAD_STATE"});
                }
                if (!didCancel) {
                    setIsPlayersLoaded(true);
                }
            }());
            return function unMount() {
                didCancel = true;
            };
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
            (async function () {
                const values = await playerStore.setItems(players);
                console.log("saved player changes to DB:", Object.keys(values));
            }());
        },
        [players, isPlayersLoaded]
    );
    const getPlayer = curry(getPlayerMaybe)(players);
    // `players` includes players in past matches who may have left
    // `activePlayers` is only players to be matched in future matches.
    const activePlayers = filter(
        (p) => tourney.playerIds.includes(p.id),
        players
    );
    const roundCount = calcNumOfRounds(Object.keys(activePlayers).length);
    const isItOver = tourney.roundList.length >= roundCount;
    const isNewRoundReady = (
        tourney.roundList.length === 0
        ? true
        : isRoundComplete(
            tourney.roundList,
            activePlayers,
            tourney.roundList.length - 1
        )
    );
    if (isDbError) {
        return <div>Error: tournament not found.</div>;
    }
    if (!isTourneyLoaded || !isPlayersLoaded) {
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
