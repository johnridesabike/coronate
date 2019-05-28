import {Panel, PanelContainer} from "../../utility";
import React, {useState} from "react";
import {
    calcPairIdeal,
    createPlayerStats,
    maxPriority,
    setUpperHalves,
    sortPlayersForPairing
} from "../../../pairing-scoring";
import {map, pipe} from "ramda";
import {useOptionsDb, useTournament} from "../../../hooks";
import {Dialog} from "@reach/dialog";
import PlayerInfo from "./player-info";
import PropTypes from "prop-types";
import SelectList  from "./select-list";
import Selecting from "../player-select/selecting";
import Stage from "./stage";
import {findById} from "../../utility";
import {getUnmatched} from "../../../pairing-scoring";
import numeral from "numeral";

export default function PairPicker({roundId}) {
    const [stagedPlayers, setStagedPlayers] = useState([null, null]);
    const [options] = useOptionsDb();
    const {tourney, players, tourneyDispatch} = useTournament();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const statsList = React.useMemo(
        () => (
            pipe(
                Object.values,
                map((player) => (
                    createPlayerStats({
                        avoidList: options.avoidPairs,
                        id: player.id,
                        players,
                        roundId,
                        roundList: tourney.roundList
                    })
                )),
                sortPlayersForPairing,
                setUpperHalves
            )(players)
        ),
        [
            tourney.roundList,
            roundId,
            options.avoidPairs,
            players
        ]
    );
    const matchIdeal = React.useMemo(
        function () {
            if (stagedPlayers.includes(null)) {
                return null;
            }
            const player0stats = findById(stagedPlayers[0], statsList);
            const player1stats = findById(stagedPlayers[1], statsList);
            const ideal = calcPairIdeal(player0stats, player1stats);
            return numeral(ideal / maxPriority).format("%");
        },
        [stagedPlayers, statsList]
    );
    const unmatched = (roundId === tourney.roundList.length - 1)
        ? getUnmatched(tourney, players, roundId)
        : {};
    const unmatchedCount = Object.keys(unmatched).length;
    return (
        <div>
            <div className="toolbar">
                <button
                    className="button-primary"
                    disabled={unmatchedCount === 0}
                    onClick={() => tourneyDispatch({
                        avoidList: options.avoidPairs,
                        byeValue: options.byeValue,
                        players: unmatched,
                        roundId,
                        type: "AUTO_PAIR"
                    })}
                >
                    Auto-pair unmatched players
                </button>{" "}
                <button onClick={() => setIsModalOpen(true)}>
                    Add or remove players from the roster.
                </button>
            </div>
            <PanelContainer>
                <Panel>
                    <SelectList
                        roundId={roundId}
                        setStagedPlayers={setStagedPlayers}
                        stagedPlayers={stagedPlayers}
                    />
                </Panel>
                <Panel>
                    <Stage
                        roundId={roundId}
                        setStagedPlayers={setStagedPlayers}
                        stagedPlayers={stagedPlayers}
                    />
                    <PanelContainer>
                        {stagedPlayers.map((id) =>
                            id !== null && (
                                <Panel key={id}>
                                    <PlayerInfo
                                        playerId={id}
                                        roundId={roundId}
                                    />
                                </Panel>
                            )
                        )}
                    </PanelContainer>
                    Match ideal: {matchIdeal}
                </Panel>
            </PanelContainer>
            <Dialog isOpen={isModalOpen}>
                <button
                    className="micro"
                    onClick={() => setIsModalOpen(false)}
                >
                    Done
                </button>
                <Selecting />
            </Dialog>
        </div>
    );
}
PairPicker.propTypes = {
    roundId: PropTypes.number,
    tourneyId: PropTypes.number
};
