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

export function TournamentProvider(props) {
    const [tourney, tourneyDispatch] = useReducer(tournamentReducer, {});
    const [players, playersDispatch] = useReducer(playersReducer, {});
    const [isTourneyLoaded, setIsTourneyLoaded] = useState(false);
    const [isPlayersLoaded, setIsPlayersLoaded] = useState(false);
    useEffect(
        function initTourneyFromDb() {
            tourneyStore.getItem(props.tourneyId).then(
                function tourneyWasLoaded(value) {
                    console.log("loaded", props.tourneyId, value);
                    tourneyDispatch({state: value, type: "SET_STATE"});
                    setIsTourneyLoaded(true);
                }
            );
        },
        [props.tourneyId]
    );
    useEffect(
        function hydrateTourneyPlayersFromDb() {
            if (!tourney.roundList || !tourney.playerIds) {
                return; // the tournament hasn't been loaded yet
            }
            const allTheIds = getAllPlayersFromMatches(
                rounds2Matches(tourney.roundList)
            ).concat(
                tourney.playerIds
            );
            const idsNoDummy = allTheIds.filter((id) => id !== DUMMY_ID);
            // TODO: Make this smarter
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
            tourneyStore.setItem(props.tourneyId, tourney).catch(
                function (error) {
                    console.log("error saving tourney", error);
                    console.log(props.tourneyId, tourney);
                }
            );
        },
        [props.tourneyId, tourney, isTourneyLoaded]
    );
    useEffect(
        function savePlayersToDb() {
            if (!isPlayersLoaded) {
                return;
            }
            playerStore.setItems(players).then(function (values) {
                console.log("saved player changes to DB", values);
            }).catch(function (error) {
                console.log("couldn't save players to db", error);
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
            {props.children}
        </TournamentContext.Provider>
    );
}
TournamentProvider.propTypes = {
    children: PropTypes.node.isRequired,
    tourneyId: PropTypes.string.isRequired
};
