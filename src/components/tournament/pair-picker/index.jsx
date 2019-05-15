import React, {useState} from "react";
import List from "react-feather/dist/icons/list";
import SelectList  from "./pair-picker";
import Stage from "./stage";
import PlayerInfo from "./player-info";
import {useRound} from "../../../state";
import {PanelContainer, Panel} from "../../utility";

/**
 * @param {Object} props
 * @param {number} props.tourneyId
 * @param {number} props.roundId
 * @param {React.Dispatch<React.SetStateAction<boolean>>} props.setIsPickView
 */
export default function PairPicker({tourneyId, roundId, setIsPickView}) {
    /** @type {[number, number]} */
    const defaultPlayers = [null, null];
    const [stagedPlayers, setStagedPlayers] = useState(defaultPlayers);
    const {matchList} = useRound(tourneyId, roundId);
    return (
        <PanelContainer>
            <Panel>
                <button onClick={() => setIsPickView(false)}>
                    <List/> View matches ({matchList.length})
                </button>
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
