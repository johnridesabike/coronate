import React, {useState} from "react";
import SelectList  from "./pair-picker";
import Stage from "./stage";
import PlayerInfo from "./player-info";
import {PanelContainer, Panel} from "../../utility";

/**
 * @param {Object} props
 * @param {number} props.tourneyId
 * @param {number} props.roundId
 */
export default function PairPicker({tourneyId, roundId}) {
    /** @type {[number, number]} */
    const defaultPlayers = [null, null];
    const [stagedPlayers, setStagedPlayers] = useState(defaultPlayers);
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
            </Panel>
        </PanelContainer>
    );
}
