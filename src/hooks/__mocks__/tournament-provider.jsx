import React, {createContext, useContext, useReducer} from "react";
import {playersReducer,tournamentReducer} from "../reducers";
import PropTypes from "prop-types";
import demoData from "../../demo-data";
import {getPlayerMaybe} from "../../pairing-scoring";

const TournamentContext = createContext(null);

export function useTournament() {
    const state = useContext(TournamentContext);
    return state;
}

export function TournamentProvider({children, tourneyId}) {
    const [
        tourney,
        tourneyDispatch
    ] = useReducer(tournamentReducer, demoData.tournaments[tourneyId]);
    const [
        players,
        playersDispatch
    ] = useReducer(playersReducer, demoData.players);
    const getPlayer = (id) => getPlayerMaybe(players, id); // curry
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
