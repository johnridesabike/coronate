import {BLACK, WHITE} from "../../../data-types";
import React, {Fragment} from "react";
import {lensIndex, set} from "ramda";
import {useOptionsDb, useTournament} from "../../../hooks";
import Icons from "../../../components/icons";
import PropTypes from "prop-types";

export default function Stage({
    roundId,
    stagedPlayers,
    setStagedPlayers
}) {
    const {tourneyDispatch, getPlayer} = useTournament();
    const dispatch = tourneyDispatch;
    const [options] = useOptionsDb();
    const [white, black] = stagedPlayers;

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

    return (
        <div>
            <h2>Selected for matching:</h2>
            <div className="content">
                <p>
                    White:{" "}
                    {white !== null &&
                        <Fragment>
                            {getPlayer(white).firstName}{" "}
                            {getPlayer(white).lastName}{" "}
                            <button
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
                            {getPlayer(black).firstName}{" "}
                            {getPlayer(black).lastName}{" "}
                            <button
                                className="button-micro"
                                onClick={() => unstage(BLACK)}
                            >
                                <Icons.UserMinus /> Remove
                            </button>
                        </Fragment>
                    }
                </p>
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
    roundId: PropTypes.number,
    setStagedPlayers: PropTypes.func,
    stagedPlayers: PropTypes.arrayOf(PropTypes.string)
};
