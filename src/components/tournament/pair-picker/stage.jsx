import React, {Fragment} from "react";
import PropTypes from "prop-types";
import {set, lensIndex} from "ramda";
import Icons from "../../icons";
import {useTournament, usePlayers} from "../../../state";
import {WHITE, BLACK} from "../../../data-types";
import {useOption} from "../../../hooks";

export default function Stage({
    tourneyId,
    roundId,
    stagedPlayers,
    setStagedPlayers
}) {
    const {playerState, getPlayer} = usePlayers();
    const {players} = playerState;
    const dispatch = useTournament(tourneyId)[1];
    const [byeValue] = useOption("byeValue", 1);
    const [white, black] = stagedPlayers;

    function unstage(color) {
        setStagedPlayers((prevState) => set(lensIndex(color), null, prevState));
    }

    function match() {
        dispatch({
            type: "MANUAL_PAIR",
            pair: [white, black],
            tourneyId,
            roundId,
            byeValue,
            players
        });
        setStagedPlayers([null, null]);
    }

    return (
        <div>
            <h2>Selected for matching:</h2>
            <p>
                White:{" "}
                {white !== null &&
                    <Fragment>
                        {getPlayer(white).firstName}{" "}
                        {getPlayer(white).lastName}{" "}
                        <button onClick={() => unstage(WHITE)}>
                            <Icons.UserMinus /> Remove
                        </button>
                    </Fragment>
                }
            </p>
            <p>
                Black:{" "}
                {black !== null &&
                    <Fragment>
                        {getPlayer(black).firstName}{" "}
                        {getPlayer(black).lastName}{" "}
                        <button onClick={() => unstage(BLACK)}>
                            <Icons.UserMinus /> Remove
                        </button>
                    </Fragment>
                }
            </p>
            <button
                onClick={() => setStagedPlayers(
                    (prevState) => ([prevState[BLACK], prevState[WHITE]])
                )}
                disabled={
                    stagedPlayers.every((id) => id === null)
                }
            >
                <Icons.Repeat/> Swap colors
            </button>{" "}
            <button
                onClick={match}
                disabled={stagedPlayers.includes(null)}
            >
                <Icons.Check/> Match selected
            </button>{" "}
        </div>
    );
}
Stage.propTypes = {
    tourneyId: PropTypes.number,
    roundId: PropTypes.number,
    stagedPlayers: PropTypes.arrayOf(PropTypes.number),
    setStagedPlayers: PropTypes.func
};
