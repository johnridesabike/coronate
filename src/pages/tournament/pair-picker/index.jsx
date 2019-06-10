import {Panel, PanelContainer} from "../../../components/utility";
import React, {useState} from "react";
import {
    calcPairIdeal,
    createPairingData,
    matches2ScoreData,
    maxPriority,
    setUpperHalves,
    sortDataForPairing
} from "../../../pairing-scoring";
import {
    getUnmatched,
    rounds2Matches
} from "../../../data-types";
import {useOptionsDb, useTournament} from "../../../hooks";
import {Dialog} from "@reach/dialog";
import PlayerInfo from "./player-info";
import PropTypes from "prop-types";
import SelectList  from "./select-list";
import Selecting from "../player-select/selecting";
import Stage from "./stage";
import {findById} from "../../../components/utility";
import numeral from "numeral";
import {pipe} from "ramda";

export default function PairPicker({roundId}) {
    const [stagedPlayers, setStagedPlayers] = useState([null, null]);
    const [options] = useOptionsDb();
    const {tourney, activePlayers, tourneyDispatch} = useTournament();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const statsList = React.useMemo(
        () => (
            pipe(
                (rounds) => rounds2Matches(rounds, roundId),
                matches2ScoreData,
                (data) => createPairingData(
                    activePlayers,
                    options.avoidPairs,
                    data
                ),
                sortDataForPairing,
                setUpperHalves
            )(tourney.roundList)
        ),
        [
            tourney.roundList,
            roundId,
            options.avoidPairs,
            activePlayers
        ]
    );
    const matchIdeal = React.useMemo(
        function () {
            if (stagedPlayers.includes(null)) {
                return null;
            }
            const player0stats = findById(stagedPlayers[0], statsList);
            const player1stats = findById(stagedPlayers[1], statsList);
            if (!player0stats || !player1stats) {
                return null;
            }
            const ideal = calcPairIdeal(player0stats, player1stats);
            return numeral(ideal / maxPriority).format("%");
        },
        [stagedPlayers, statsList]
    );
    const unmatched = (roundId === tourney.roundList.length - 1)
        ? getUnmatched(tourney.roundList, activePlayers, roundId)
        : {};
    const unmatchedCount = Object.keys(unmatched).length;
    return (
        <div className="content-area">
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
                <Panel style={{flexGrow: "1"}}>
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
                    {!stagedPlayers.includes(null) &&
                        <span>Match ideal: {matchIdeal}</span>
                    }
                </Panel>
            </PanelContainer>
            <Dialog isOpen={isModalOpen}>
                <button
                    className="button-micro"
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
