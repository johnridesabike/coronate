// @ts-check
import React, {useReducer} from "react";
import {dataReducer, defaultData, DataContext} from "../state/global-state";

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

/** @param {{action: Action}} props */
export const InfoButton = ({action}) => (
    <Button action={action}>Info</Button>
);

/**
 * @param {*[]} arr
 * @param {number} pos
 * @param {number} dir
 */
export function moveArrItem(arr, pos, dir) {
    const newPos = pos + dir;
    const newArr = [...arr];
    const movedMethod = newArr.splice(pos, 1)[0];
    newArr.splice(newPos, 0, movedMethod);
    return newArr;
}

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

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export function TestApp({children}) {
    const [data, dispatch] = useReducer(dataReducer, defaultData);
    return (
        <DataContext.Provider value={{data, dispatch}}>
            {children}
        </DataContext.Provider>
    );
}
