import React, {Fragment} from "react";
import {set, lensIndex} from "ramda";
import {useTournament, usePlayers, useOptions} from "../../../../state";
import {WHITE, BLACK} from "../../../../data/constants";

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
    // eslint-disable-next-line no-unused-vars
    const [{players}, ignore, getPlayer] = usePlayers();
    const dispatch = useTournament(tourneyId)[1];
    const [{byeValue}] = useOptions();
    const [white, black] = stagedPlayers;
    /** @param {typeof WHITE | typeof BLACK} color */
    function unstage(color) {
        setStagedPlayers((prevState) => set(lensIndex(color), null, prevState));
    }
    function swap() {
        setStagedPlayers((prevState) => ([prevState[BLACK], prevState[WHITE]]));
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
                {white &&
                    <Fragment>
                        {getPlayer(white).firstName}{" "}
                        {getPlayer(white).lastName}
                        <button onClick={() => unstage(WHITE)}>
                            Remove
                        </button>
                    </Fragment>
                }
            </p>
            <p>
                Black:{" "}
                {black &&
                    <Fragment>
                        {getPlayer(black).firstName}{" "}
                        {getPlayer(black).lastName}
                        <button onClick={() => unstage(BLACK)}>
                            Remove
                        </button>
                    </Fragment>
                }
            </p>
            <button
                onClick={swap}
                disabled={
                    stagedPlayers.every((id) => id === null)
                }
            >
                Swap colors
            </button>{" "}
            <button
                onClick={match}
                disabled={stagedPlayers.includes(null)}
            >
                Match selected
            </button>{" "}
        </div>
    );
}
