import React, {useState} from "react";
import PlayerList from "./list";
import PlayerInfoBox from "./info-box";

/**
 * @param {Object} props
 */
export default function PlayerView(props) {
    /** @type {number} */
    const defaultOpen = null;
    const [openPlayer, setOpenPlayer] = useState(defaultOpen);
    if (openPlayer !== null) {
        return (
            <PlayerInfoBox
                key={openPlayer}
                playerId={openPlayer}
                setOpenPlayer={setOpenPlayer} />
        );
    } else {
        return (
            <PlayerList setOpenPlayer={setOpenPlayer}/>
        );
    }
}
