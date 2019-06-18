import {BLACK, WHITE} from "../../../data-types";
import React, {Fragment} from "react";
import {
    calcPairIdeal,
    maxPriority
} from "../../../pairing-scoring";
import {lensIndex, set} from "ramda";
import {useOptionsDb, useTournament} from "../../../hooks";
import Icons from "../../../components/icons";
import PropTypes from "prop-types";
import numeral from "numeral";

export default function Stage({
    pairData,
    roundId,
    stagedPlayers,
    setStagedPlayers
}) {
    const {tourneyDispatch, getPlayer} = useTournament();
    const dispatch = tourneyDispatch;
    const [options] = useOptionsDb();
    const [white, black] = stagedPlayers;
    const whiteName = (
        white
        ? getPlayer(white).firstName + " " + getPlayer(white).lastName
        : ""
    );
    const blackName = (
        black
        ? getPlayer(black).firstName + " " + getPlayer(black).lastName
        : ""
    );

    function unstage(color) {
        setStagedPlayers((prevState) => set(lensIndex(color), null, prevState));
    }

    function match() {
        dispatch({
            byeValue: options.byeValue,
            pair: [getPlayer(white), getPlayer(black)],
            roundId,
            type: "MANUAL_PAIR"
        });
        setStagedPlayers([null, null]);
    }

    const matchIdeal = (function () {
        if (stagedPlayers.includes(null)) {
            return null;
        }
        const player0stats = pairData[stagedPlayers[0]];
        const player1stats = pairData[stagedPlayers[1]];
        if (!player0stats || !player1stats) {
            return null;
        }
        const ideal = calcPairIdeal(player0stats, player1stats);
        return numeral(ideal / maxPriority).format("%");
    }());

    return (
        <div>
            <h2>Selected for matching:</h2>
            <div className="content">
                <p>
                    White:{" "}
                    {white !== null &&
                        <Fragment>
                            {whiteName}{" "}
                            <button
                                aria-label={"remove " + whiteName}
                                className="button-micro"
                                onClick={() => unstage(WHITE)}
                            >
                                <Icons.UserMinus /> Remove
                            </button>
                        </Fragment>
                    }
                </p>
                <p>
                    Black:{" "}
                    {black !== null &&
                        <Fragment>
                            {blackName}{" "}
                            <button
                                aria-label={"remove " + blackName}
                                className="button-micro"
                                onClick={() => unstage(BLACK)}
                            >
                                <Icons.UserMinus /> Remove
                            </button>
                        </Fragment>
                    }
                </p>
                <p>Match ideal: {matchIdeal}</p>
            </div>
            <div className="toolbar">
                <button
                    disabled={
                        stagedPlayers.every((id) => id === null)
                    }
                    onClick={() => setStagedPlayers(
                        (prevState) => ([prevState[BLACK], prevState[WHITE]])
                    )}
                >
                    <Icons.Repeat/> Swap colors
                </button>{" "}
                <button
                    className="button-primary"
                    disabled={stagedPlayers.includes(null)}
                    onClick={match}
                >
                    <Icons.Check/> Match selected
                </button>
            </div>
        </div>
    );
}
Stage.propTypes = {
    pairData: PropTypes.object.isRequired,
    roundId: PropTypes.number,
    setStagedPlayers: PropTypes.func,
    stagedPlayers: PropTypes.arrayOf(PropTypes.string)
};
