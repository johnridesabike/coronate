import PlayerInfo from "./info-box";
import PlayerList from "./list";
import PropTypes from "prop-types";
import React from "react";

export default function Players(props) {
    return (
        <div>
            {props.children}
        </div>
    );
}
Players.propTypes = {
    children: PropTypes.node
};

export {PlayerInfo, PlayerList};
