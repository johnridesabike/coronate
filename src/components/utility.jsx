import React from "react";

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
        <div style={{...style}}>
            {children}
        </div>
    );
}

/**
 *
 * @param {object} props
 */
export function PanelContainer({children}) {
    return (
        <div style={{display: "flex"}}>
            {React.Children.map(children, (child) => child)}
        </div>
    );
}
