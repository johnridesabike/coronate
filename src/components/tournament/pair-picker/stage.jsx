import {BLACK, WHITE} from "../../../data-types";
import React, {Fragment} from "react";
import {lensIndex, set} from "ramda";
import {useOptionDb, useTournament} from "../../../hooks";
import Icons from "../../icons";
import PropTypes from "prop-types";

export default function Stage({
    roundId,
    stagedPlayers,
    setStagedPlayers
}) {
    const {tourneyDispatch, players} = useTournament();
    const dispatch = tourneyDispatch;
    const [byeValue] = useOptionDb("byeValue", 1);
    const [white, black] = stagedPlayers;

    function unstage(color) {
        setStagedPlayers((prevState) => set(lensIndex(color), null, prevState));
    }

    function match() {
        dispatch({
            byeValue,
            pair: [white, black],
            players,
            roundId,
            type: "MANUAL_PAIR"
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
                        {players[white].firstName}{" "}
                        {players[white].lastName}{" "}
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
                        {players[black].firstName}{" "}
                        {players[black].lastName}{" "}
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
    roundId: PropTypes.number,
    setStagedPlayers: PropTypes.func,
    stagedPlayers: PropTypes.arrayOf(PropTypes.number)
};
