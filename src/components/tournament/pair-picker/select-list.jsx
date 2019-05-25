import {BLACK, DUMMY_ID, WHITE, dummyPlayer} from "../../../data-types";
import React, {useState} from "react";
import {assoc, lensIndex, set} from "ramda";
import {useOptionsDb, useTournament} from "../../../hooks";
import {Dialog} from "@reach/dialog";
import Hidden from "@reach/visually-hidden";
import Icons from "../../icons";
import PropTypes from "prop-types";
import Selecting from "../player-select/selecting";
import {getUnmatched} from "../../../pairing-scoring";

export default function SelectList({
    tourneyId,
    roundId,
    stagedPlayers,
    setStagedPlayers
}) {
    const {tourney, players, tourneyDispatch} = useTournament();
    const dispatch = tourneyDispatch;
    // only use unmatched players if this is the last round.
    const unmatched = (roundId === tourney.roundList.length - 1)
        ? getUnmatched(tourney, players, roundId)
        : {};
    const [options] = useOptionsDb();
    const [isModalOpen, setIsModalOpen] = useState(false);

    function selectPlayer(id) {
        if (stagedPlayers[WHITE] === null) {
            setStagedPlayers(
                (prevState) => set(lensIndex(WHITE), id, prevState)
            );
        } else if (stagedPlayers[BLACK] === null) {
            setStagedPlayers(
                (prevState) => set(lensIndex(BLACK), id, prevState)
            );
        }
        // else... nothing happens
    }

    // make a new list so as not to affect auto-pairing
    const unmatchedWithDummy = (
        (Object.keys(unmatched).length % 2 !== 0)
        ? assoc(DUMMY_ID, dummyPlayer, unmatched)
        : unmatched
    );
    if (Object.keys(unmatched).length === 0) {
        return null;
    }
    console.log("unmatched players", unmatched);
    return (
        <div>
            <button
                disabled={Object.keys(unmatched).length === 0}
                onClick={() => dispatch({
                    avoidList: options.avoidPairs,
                    byeValue: options.byeValue,
                    players: unmatched,
                    roundId,
                    type: "AUTO_PAIR"
                })}
            >
                Auto-pair unmatched players
            </button><br/>
            <button onClick={() => setIsModalOpen(true)}>
                Add or remove players from the roster.
            </button>
            <ul>
                {Object.values(unmatchedWithDummy).map(
                    ({id, firstName, lastName}) => (
                        <li key={id}>
                            {stagedPlayers.includes(id)
                            ? <button disabled>Selected</button>
                            : (
                                <button
                                    disabled={!stagedPlayers.includes(null)}
                                    onClick={() => selectPlayer(id)}
                                >
                                    <Icons.UserPlus/>
                                    <Hidden>
                                        Select {firstName} {lastName}
                                    </Hidden>
                                </button>
                            )}{" "}
                            {firstName} {lastName}
                        </li>
                    )
                )}
            </ul>
            <Dialog isOpen={isModalOpen}>
                <button onClick={() => setIsModalOpen(false)}>Done</button>
                <Selecting tourneyId={tourneyId} />
            </Dialog>
        </div>
    );
}
SelectList.propTypes = {
    roundId: PropTypes.number,
    setStagedPlayers: PropTypes.func,
    stagedPlayers: PropTypes.arrayOf(PropTypes.string),
    tourneyId: PropTypes.number
};
