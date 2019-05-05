// @ts-check
import React, {useState} from "react";
import PlayerList from "./list";
import PlayerInfoBox from "./info-box";

export default function PlayerView() {
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
