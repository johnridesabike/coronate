// @ts-check
import React from "react";
import {FaArrowsAltV} from "react-icons/fa";

/**
 * @param {Object} props
 * @param {JSX.Element | string} [props.children]
 * @param {(event: React.MouseEvent | React.KeyboardEvent) => void} props.action
 */
export function Button({children, action}
) {
    return (
        <nav>
            <button onClick={action}>
                {children}
            </button>
        </nav>
    );
}

/**
 * @param {Object} props
 * @param {(event: React.MouseEvent | React.KeyboardEvent) => void} props.action
 */
export function BackButton({action}) {
    return <Button action={action}>&lt; Back</Button>;
}

/**
 * @param {Object} props
 * @param {(event: React.MouseEvent | React.KeyboardEvent) => void} props.action
 */
export function OpenButton({action}) {
    return <Button action={action}>Open &gt;</Button>;
}

/**
 * @param {Object} props
 * @param {boolean} props.isDragged
 */
export function DragIcon({isDragged}) {
    return (
        <FaArrowsAltV style={{cursor: isDragged ? 'grabbing' : 'grab'}}
        tabIndex={-1}/>
    );

}

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