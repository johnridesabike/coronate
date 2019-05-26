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
import PlayerInfo from "./player-info";
import PropTypes from "prop-types";
import SelectList  from "./select-list";
import Stage from "./stage";
import {findById} from "../../utility";
import numeral from "numeral";

export default function PairPicker({roundId}) {
    const [stagedPlayers, setStagedPlayers] = useState([null, null]);
    const [options] = useOptionsDb();
    const {tourney, players} = useTournament();
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
    return (
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
    );
}
PairPicker.propTypes = {
    roundId: PropTypes.number,
    tourneyId: PropTypes.number
};
