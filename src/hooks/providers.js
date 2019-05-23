import React, {
    createContext,
    useContext,
    useEffect,
    useReducer,
    useState
} from "react";
import {
    getAllPlayersFromMatches,
    getPlayerById,
    rounds2Matches
} from "../pairing-scoring";
import {playerStore, tourneyStore} from "./db";
import PropTypes from "prop-types";
import {curry} from "ramda";
import {tournamentReducer} from "./reducers";

const TournamentContext = createContext(null);

export function useTournament() {
    const state = useContext(TournamentContext);
    return state;
}

export function TournamentProvider(props) {
    const [tourney, tourneyDispatch] = useReducer(tournamentReducer, {});
    const [players, setPlayers] = useState([]);
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
            const idStrings = ids.map((id) => String(id));
            if (idStrings.length > 0) {
                playerStore.getItems(idStrings).then(function (values) {
                    setPlayers(values);
                });
            }
        },
        [tourney.roundList]
    );
    useEffect(
        function saveTourneyToDb() {
            tourneyStore.setItem(String(props.tourneyId), tourney);
        },
        [props.tourneyId, tourney]
    );
    const getPlayer = curry(getPlayerById)(players);
    const value = {getPlayer, players, tourney, tourneyDispatch};
    if (Object.keys(tourney).length === 0) {
        return <div>Loading...</div>;
    }
    return (
        <TournamentContext.Provider value={value}>
            {props.children}
        </TournamentContext.Provider>
    );
}
TournamentProvider.propTypes = {
    children: PropTypes.node.isRequired,
    tourneyId: PropTypes.number.isRequired
};
