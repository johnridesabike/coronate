// @ts-check
import React from "react";

/**
 * @param {Object} props
 * @param {JSX.Element[]} props.children
 */
export function MainNav({children}) {
    return (
        <nav className="main-nav">
            {children}
        </nav>
    );
}

/**
 * @param {Object} props
 * @param {string} props.name
 * @param {(event: React.MouseEvent | React.KeyboardEvent) => void} props.action
 * @param {boolean} props.isOpen
 */
export function NavItem({name, action, isOpen}) {
    let classNames = "main-nav__item";
    if (isOpen) {
        classNames += " is-open";
    }
    return (
        <span className={classNames} role="menuitem" tabIndex={0}
            onClick={action} onKeyPress={action}>
            {name}
        </span>
    );
}
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

