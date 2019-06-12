import {
    DUMMY_ID,
    getUnmatched,
    rounds2Matches
} from "../../../data-types";
import {Panel, PanelContainer} from "../../../components/utility";
import React, {useEffect, useState} from "react";
import {assoc, pipe} from "ramda";
import {
    calcPairIdeal,
    createPairingData,
    matches2ScoreData,
    maxPriority,
    setUpperHalves,
    sortDataForPairing
} from "../../../pairing-scoring";
import {useOptionsDb, useTournament} from "../../../hooks";
import {Dialog} from "@reach/dialog";
import PlayerInfo from "./player-info";
import PropTypes from "prop-types";
import SelectList  from "./select-list";
import Selecting from "../player-select/selecting";
import Stage from "./stage";
import {findById} from "../../../components/utility";
import numeral from "numeral";

export default function PairPicker({roundId}) {
    const [stagedPlayers, setStagedPlayers] = useState([null, null]);
    const [options] = useOptionsDb();
    const {
        tourney,
        activePlayers,
        getPlayer,
        tourneyDispatch
    } = useTournament();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [scoreData, pairData] = React.useMemo(
        function memoizedGetStats() {
            const matches = rounds2Matches(tourney.roundList, roundId);
            const _scoreData = matches2ScoreData(matches);
            const _pairData = pipe(
                createPairingData(activePlayers, options.avoidPairs),
                sortDataForPairing,
                setUpperHalves
            )(_scoreData);
            return [_scoreData, _pairData];
        },
        [tourney.roundList, activePlayers, roundId, options.avoidPairs]
    );
    const unmatched = (roundId === tourney.roundList.length - 1)
        ? getUnmatched(tourney.roundList, activePlayers, roundId)
        : {};
    const unmatchedCount = Object.keys(unmatched).length;
    // make a new list so as not to affect auto-pairing
    const unmatchedWithDummy = (
        (unmatchedCount % 2 !== 0)
        ? assoc(DUMMY_ID, getPlayer(DUMMY_ID), unmatched)
        : unmatched
    );
    useEffect(
        function cleanPlayersThatWereRemoved() {
            const [p1, p2] = stagedPlayers;
            if (!unmatchedWithDummy[p1] && p1 !== null) {
                setStagedPlayers((pair) => [null, pair[1]]);
            }
            if (!unmatchedWithDummy[p2] && p2 !== null) {
                setStagedPlayers((pair) => [pair[0], null]);
            }
        },
        [unmatchedWithDummy, stagedPlayers]
    );
    const matchIdeal = (function () {
        if (stagedPlayers.includes(null)) {
            return null;
        }
        const player0stats = findById(stagedPlayers[0], pairData);
        const player1stats = findById(stagedPlayers[1], pairData);
        if (!player0stats || !player1stats) {
            return null;
        }
        const ideal = calcPairIdeal(player0stats, player1stats);
        return numeral(ideal / maxPriority).format("%");
    }());

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
                        setStagedPlayers={setStagedPlayers}
                        stagedPlayers={stagedPlayers}
                        unmatched={unmatchedWithDummy}
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
                                        scoreData={scoreData}
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
