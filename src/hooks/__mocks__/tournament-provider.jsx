import React, {createContext, useContext, useReducer} from "react";
import {curry, filter} from "ramda";
import {playersReducer,tournamentReducer} from "../reducers";
import PropTypes from "prop-types";
import demoData from "../../demo-data";
import {getPlayerMaybe} from "../../data-types";
import testData from "../../test-data";

// We're deprecating the `demo-data` in favor of `test-data`. Until old tests
// are updated, we'll merge them together.
const tournaments = Object.assign(
    {},
    demoData.tournaments,
    testData.tournaments
);
const playerData = Object.assign({}, demoData.players, testData.players);

const TournamentContext = createContext(null);

export function useTournament() {
    const state = useContext(TournamentContext);
    return state;
}

export function TournamentProvider({children, tourneyId}) {
    const [
        tourney,
        tourneyDispatch
    ] = useReducer(tournamentReducer, tournaments[tourneyId]);
    const activePlayers = filter(
        (p) => tourney.playerIds.includes(p.id),
        playerData
    );
    const [
        players,
        playersDispatch
    ] = useReducer(playersReducer, activePlayers);
    const getPlayer = curry(getPlayerMaybe)(players);
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
