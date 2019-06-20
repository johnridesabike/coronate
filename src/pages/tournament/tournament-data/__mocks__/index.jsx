import {curry, filter} from "ramda";
import PropTypes from "prop-types";
import demoData from "../../../../demo-data";
import {getPlayerMaybe} from "../../../../data-types";
import playersReducer from "../players-reducer";
import testData from "../../../../test-data";
import tournamentReducer from "../tournament-reducer";
import {useReducer} from "react";

// We're deprecating the `demo-data` in favor of `test-data`. Until old tests
// are updated, we'll merge them together.
const tournaments = {...demoData.tournaments, ...testData.tournaments};
const playerData = {...demoData.players, ...testData.players};

export default function TournamentData({children, tourneyId}) {
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
    return children({
        activePlayers,
        getPlayer,
        players,
        playersDispatch,
        tourney,
        tourneyDispatch
    });
}
TournamentData.propTypes = {
    children: PropTypes.func.isRequired,
    tourneyId: PropTypes.string.isRequired
};
