import React from "react";
import {Link} from "@reach/router";
import {usePlayers} from "../state";
import {dummyPlayer} from "../data/player";
import styles from "./utility.module.css";

/**
 * @typedef {(event: React.MouseEvent | React.KeyboardEvent) => void} Action
 */

/** @param {{children: JSX.Element | string, action: Action}} props */
export const Button = ({children, action}) => (
    <button onClick={action}>
        {children}
    </button>
);

/** @param {{action: Action}} action */
export const BackButton = ({action}) => (
    <Button action={action}>&lt; Back</Button>
);

/** @param {{action: Action}} action */
export const OpenButton = ({action}) => (
    <Button action={action}>Open &gt;</Button>
);

/**
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @param {React.CSSProperties} [props.style]
 */
export function Panel({children, style}) {
    return (
        <div style={{...style}} className={styles.panel}>
            {children}
        </div>
    );
}

/**
 *
 * @param {object} props
 */
export function PanelContainer(props) {
    return (
        <div {...props} className={styles.panels}>
            {React.Children.map(props.children, (child) => child)}
        </div>
    );
}

/**
 * @param {Object} props
 */
export function PlayerLink({id, firstName, lastName}) {
    const getPlayer = usePlayers()[2];
    let name = "";
    if (firstName) {
        name += getPlayer(id).firstName + " ";
    }
    if (lastName) {
        name += getPlayer(id).lastName;
    }
    if (id === dummyPlayer.id) {
        return <span>{name}</span>; // there's no bye player profile
    }
    return (
        <Link to={"/players/" + id}>
            {name}
        </Link>
    );
}
