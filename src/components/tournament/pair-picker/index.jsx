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

export default function PairPicker({tourneyId, roundId}) {
    const [stagedPlayers, setStagedPlayers] = useState([null, null]);
    const [options] = useOptionsDb();
    const {tourney, players} = useTournament();
    const statsList = React.useMemo(
        () => (
            pipe(
                map((id) => (
                    createPlayerStats({
                        avoidList: options.avoidPairs,
                        id,
                        playerDataSource: Object.values(players),
                        roundId,
                        roundList: tourney.roundList
                    })
                )),
                sortPlayersForPairing,
                setUpperHalves
            )(tourney.players)
        ),
        [
            tourney.players,
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
                    tourneyId={tourneyId}
                    roundId={roundId}
                    stagedPlayers={stagedPlayers}
                    setStagedPlayers={setStagedPlayers}
                />
            </Panel>
            <Panel>
                <Stage
                    tourneyId={tourneyId}
                    roundId={roundId}
                    stagedPlayers={stagedPlayers}
                    setStagedPlayers={setStagedPlayers}
                />
                <PanelContainer>
                    {stagedPlayers.map((id) =>
                        id !== null && (
                            <Panel key={id}>
                                <PlayerInfo
                                    playerId={id}
                                    tourneyId={tourneyId}
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
