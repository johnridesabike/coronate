import React, {useState} from "react";
import PropTypes from "prop-types";
import numeral from "numeral";
import {pipe, map} from "ramda";
import SelectList  from "./select-list";
import Stage from "./stage";
import PlayerInfo from "./player-info";
import {PanelContainer, Panel} from "../../utility";
import {usePlayers, useTournament} from "../../../state";
import {findById} from "../../utility";
import {
    calcPairIdeal,
    maxPriority,
    sortPlayersForPairing,
    setUpperHalves,
    createPlayerStats
} from "../../../pairing-scoring";

export default function PairPicker({tourneyId, roundId}) {
    const [stagedPlayers, setStagedPlayers] = useState([null, null]);
    const {playerState} = usePlayers();
    const [tourney] = useTournament(tourneyId);
    const statsList = React.useMemo(
        () => (
            pipe(
                map((id) => (
                    createPlayerStats({
                        id,
                        playerDataSource: playerState.players,
                        avoidList: playerState.avoid,
                        roundList: tourney.roundList,
                        roundId
                    })
                )),
                sortPlayersForPairing,
                setUpperHalves
            )(tourney.players)
        ),
        [
            tourney.players,
            tourney.roundList,
            playerState.avoid,
            playerState.players,
            roundId
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
    tourneyId: PropTypes.number,
    roundId: PropTypes.number
};
