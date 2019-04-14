// @ts-check
import React from "react";

export function MainNav({children}) {
    return (
        <nav className="main-nav">
            {children}
        </nav>
    );
}

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