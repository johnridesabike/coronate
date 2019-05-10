import React from "react";
import PlayerInfo from "./info-box";
import PlayerList from "./list";

/**
 * @param {Object} props
 */
export default function Players(props) {
    return (
        <div>
            {props.children}
        </div>
    );
}

export {PlayerInfo, PlayerList};
