import React, {useState} from "react";
import PropTypes from "prop-types";
import numeral from "numeral";
import SelectList  from "./pair-picker";
import Stage from "./stage";
import PlayerInfo from "./player-info";
import {PanelContainer, Panel} from "../../utility";
import {createPlayerStats} from "../../../pairing-scoring/scoring";
import {usePlayers, useTournament} from "../../../state";
import {calcPairIdeal, maxPriority} from "../../../pairing-scoring/pairing";

export default function PairPicker({tourneyId, roundId}) {
    /** @type {[number, number]} */
    const defaultPlayers = [null, null];
    const [stagedPlayers, setStagedPlayers] = useState(defaultPlayers);
    const {playerState} = usePlayers();
    const [tourney] = useTournament(tourneyId);
    const matchIdeal = React.useMemo(
        function () {
            if (stagedPlayers.includes(null)) {
                return null;
            }
            /** @param {number} player */
            const makeStats = (player) => createPlayerStats(
                player,
                playerState.players,
                playerState.avoid,
                tourney.roundList,
                roundId
            );
            const player0stats = makeStats(stagedPlayers[0]);
            const player1stats = makeStats(stagedPlayers[1]);
            const ideal = calcPairIdeal(player0stats, player1stats);
            return numeral(ideal / maxPriority).format("%");
        },
        [
            playerState.avoid,
            playerState.players,
            roundId,
            tourney.roundList,
            stagedPlayers
        ]
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
