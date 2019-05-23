import React, {
    createContext,
    useContext,
    useEffect,
    useReducer
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
    useEffect(
        function initTourneyFromDb() {
            tourneyStore.getItem(String(props.tourneyId)).then(
                function (value) {
                    tourneyDispatch({state: value, type: "SET_STATE"});
                }
            );
        },
        [props.tourneyId]
    );
    useEffect(
        function hydrateTourneyPlayersFromDb() {
            if (!tourney.roundList) {
                return;
            }
            const ids = getAllPlayersFromMatches(
                rounds2Matches(tourney.roundList)
            );
            const idStrings = ids.map(
                (id) => String(id)
            ).filter(
                (id) => id !== String(DUMMY_ID)
            );
            // TODO: Make this smarter
            const changedPlayers = difference(idStrings, Object.keys(players));
            console.log(changedPlayers);
            if (changedPlayers.length > 0) {
                playerStore.getItems(idStrings).then(function (values) {
                    playersDispatch({state: values, type: "LOAD_STATE"});
                });
            }
        },
        [tourney.roundList, players]
    );
    useEffect(
        function saveTourneyToDb() {
            tourneyStore.setItem(String(props.tourneyId), tourney).catch(
                function (error) {
                    console.log("error saving tourney", error);
                    console.log(props.tourneyId, tourney);
                }
            );
        },
        [props.tourneyId, tourney]
    );
    useEffect(
        function savePlayersToDb() {
            playerStore.setItems(players).then(function (values) {
                console.log("saved player changes to DB", values);
            }).catch(function (error) {
                console.log("couldn't save players to db", error);
            });
        },
        [players]
    );
    const getPlayer = curry(getPlayerById)(players);
    if (Object.keys(tourney).length === 0) {
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
    tourneyId: PropTypes.number.isRequired
};
