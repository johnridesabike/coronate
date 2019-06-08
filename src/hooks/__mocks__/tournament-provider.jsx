import React, {createContext, useContext, useReducer} from "react";
import {playersReducer,tournamentReducer} from "../reducers";
import PropTypes from "prop-types";
import demoData from "../../demo-data";
import {filter} from "ramda";
import {getPlayerMaybe} from "../../data-types";

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
    const activePlayers = filter(
        (p) => tourney.playerIds.includes(p.id),
        demoData.players
    );
    const [
        players,
        playersDispatch
    ] = useReducer(playersReducer, activePlayers);
    const getPlayer = (id) => getPlayerMaybe(players, id); // curry
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
