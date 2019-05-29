import Icons from "./icons";
import PropTypes from "prop-types";
import React from "react";
import {omit} from "ramda";
import styles from "./utility.module.css";
// import {usePlayers} from "../state";

export const Button = ({children, action}) => (
    <button onClick={action}>
        {children}
    </button>
);
Button.propTypes = {
    action: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired
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
        <div className={styles.panel} style={{...style}}>
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
            {props.children}
            {/* {React.Children.map(props.children, (child) => child)} */}
        </div>
    );
}
PanelContainer.propTypes = {
    children: PropTypes.node.isRequired
};

export function DateFormat(props) {
    const dateFormat = new Intl.DateTimeFormat(
        "en-US",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
    const cleanProps = omit(["date"], props);
    return (
        <time dateTime={props.date.toISOString()} {...cleanProps}>
            {dateFormat.format(props.date)}
        </time>
    );
}
DateFormat.propTypes = {
    date: PropTypes.instanceOf(Date)
};

export function Notification(props) {
    const [icon, className] = (function () {
        if (props.success) {
            return [<Icons.Check />, "notification__success"];
        } else if (props.warning) {
            return [<Icons.Alert />, "notification__warning"];
        } else if (props.error) {
            return [<Icons.X />, "notification__error"];
        } else {
            return [<Icons.Info />, "notification__generic"];
        }
    }());
    const cleanProps = omit(["warning", "error", "success"], props);
    return (
        <div {...cleanProps} className={"notification " + className}>
            <div className="notification__icon">
                {icon}
            </div>
            <div className="notification__text">
                {props.children}
            </div>
        </div>
    );
}
Notification.propTypes = {
    children: PropTypes.node.isRequired,
    error: PropTypes.bool,
    success: PropTypes.bool,
    warning: PropTypes.bool
};

/*******************************************************************************
 * Non-JSX functions
 ******************************************************************************/
export function findById(id, list) {
    return list.filter((x) => x.id === id)[0];
}

export function findIndexById(id, list) {
    return list.indexOf(findById(id, list));
}
