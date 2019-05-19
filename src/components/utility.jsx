import React from "react";
import PropTypes from "prop-types";
import {Link} from "@reach/router";
import {usePlayers} from "../state";
import styles from "./utility.module.css";
import {DUMMY_ID} from "../pairing-scoring/constants";

/**
 * @typedef {(event: React.MouseEvent | React.KeyboardEvent) => void} Action
 */

export const Button = ({children, action}) => (
    <button onClick={action}>
        {children}
    </button>
);
Button.propTypes = {
    children: PropTypes.node.isRequired,
    action: PropTypes.func.isRequired
};

export const BackButton = ({action}) => (
    <Button action={action}>&lt; Back</Button>
);
BackButton.propTypes = {
    action: PropTypes.func.isRequired
};

export const OpenButton = ({action}) => (
    <Button action={action}>Open &gt;</Button>
);
OpenButton.propTypes = {
    action: PropTypes.func.isRequired
};

export function Panel({children, style}) {
    return (
        <div style={{...style}} className={styles.panel}>
            {children}
        </div>
    );
}
Panel.propTypes = {
    children: PropTypes.node.isRequired,
    style: PropTypes.object
};

export function PanelContainer(props) {
    return (
        <div {...props} className={styles.panels}>
            {React.Children.map(props.children, (child) => child)}
        </div>
    );
}
PanelContainer.propTypes = {
    children: PropTypes.node.isRequired
};

export function PlayerLink({id, firstName, lastName}) {
    const {getPlayer} = usePlayers();
    if (id === DUMMY_ID) {
        return ( // there's no bye player profile
            <span>
                {firstName && getPlayer(id).firstName}{" "}
                {lastName && getPlayer(id).lastName}
            </span>
        );
    }
    return (
        <Link to={"/players/" + id}>
            {firstName && getPlayer(id).firstName}{" "}
            {lastName && getPlayer(id).lastName}
        </Link>
    );
}
PlayerLink.propTypes = {
    id: PropTypes.number.isRequired,
    firstName: PropTypes.bool,
    lastName: PropTypes.bool
};
