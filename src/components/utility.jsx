import React from "react";
import {Link} from "@reach/router";
import numeral from "numeral";
import {usePlayers} from "../state";
import styles from "./utility.module.css";
import {DUMMY_ID} from "../data/constants";

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

// let's make a custom numeral format. I don't really know how this works.
numeral.register("format", "half", {
    regexps: {
        format: /(1\/2)/,
        unformat: /(1\/2)/
    },
    // @ts-ignore
    // eslint-disable-next-line no-unused-vars
    format: function (value, format, roundingFunction) {
        /** @type {number | string} */
        let whole = Math.floor(value);
        /** @type {number | string} */
        let remainder = value - whole;
        if (remainder === 0.5) {
            remainder = "½";
        } else if (remainder === 0) {
            remainder = "";
        }
        if (whole === 0 && remainder) {
            whole = "";
        }
        // let output = numeral._.numberToFormat(value, format, roundingFunction);
        // return output;
        return String(whole) + remainder;
    },
    /** @param {string} value */
    unformat: function (value) {
        return Number(value); // doesn't work... todo?
    }
});
