import React, {useState} from "react";
import PropTypes from "prop-types";
import numeral from "numeral";
import {pipe, map} from "ramda";
import SelectList  from "./select-list";
import Stage from "./stage";
import PlayerInfo from "./player-info";
import {PanelContainer, Panel} from "../../utility";
import {usePlayers, useTournament} from "../../../state";
import {getById} from "../../../pairing-scoring/helpers";
import {createPlayerStats} from "../../../pairing-scoring/scoring";
import {
    calcPairIdeal,
    maxPriority,
    sortPlayersForPairing,
    setUpperHalves
} from "../../../pairing-scoring/pairing";

export default function PairPicker({tourneyId, roundId}) {
    const [stagedPlayers, setStagedPlayers] = useState([null, null]);
    const {playerState} = usePlayers();
    const [tourney] = useTournament(tourneyId);
    const statsList = React.useMemo(
        () => (
            pipe(
                map((id) => (
                    createPlayerStats(
                        id,
                        playerState.players,
                        playerState.avoid,
                        tourney.roundList,
                        roundId
                    )
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
            const player0stats = getById(statsList, stagedPlayers[0]);
            const player1stats = getById(statsList, stagedPlayers[1]);
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
