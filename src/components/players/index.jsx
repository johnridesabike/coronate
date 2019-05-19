import React from "react";
import PropTypes from "prop-types";
import PlayerInfo from "./info-box";
import PlayerList from "./list";

export default function Players(props) {
    return (
        <div>
            {props.children}
        </div>
    );
}
Players.propTypes = {
    children: PropTypes.node,
    path: PropTypes.string
};

export {PlayerInfo, PlayerList};
