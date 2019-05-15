import React, {Fragment} from "react";
import {set, lensIndex} from "ramda";
import Repeat from "react-feather/dist/icons/repeat";
import Check from "react-feather/dist/icons/check";
import UserMinus from "react-feather/dist/icons/user-minus";
import {useTournament, usePlayers, useOptions} from "../../../state";
import {WHITE, BLACK} from "../../../data/constants";

/**
 * @param {Object} props
 * @param {number} props.tourneyId
 * @param {number} props.roundId
 * @param {[number, number]} props.stagedPlayers
 * @param {React.Dispatch<React.SetStateAction<[number, number]>>} props.setStagedPlayers
 */
export default function Stage({
    tourneyId,
    roundId,
    stagedPlayers,
    setStagedPlayers
}) {
    const {playerState, getPlayer} = usePlayers();
    const {players} = playerState;
    const dispatch = useTournament(tourneyId)[1];
    const [{byeValue}] = useOptions();
    const [white, black] = stagedPlayers;
    /** @param {typeof WHITE | typeof BLACK} color */
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
                            <UserMinus /> Remove
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
                            <UserMinus /> Remove
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
                <Repeat/> Swap colors
            </button>{" "}
            <button
                onClick={match}
                disabled={stagedPlayers.includes(null)}
            >
                <Check/> Match selected
            </button>{" "}
        </div>
    );
}
