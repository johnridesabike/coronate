import Icons from "./icons";
import PropTypes from "prop-types";
import React from "react";
import VisuallyHidden from "@reach/visually-hidden";
import classNames from "classnames";
import styles from "./utility.module.css";

export function Panel({children, ...rest}) {
    return (
        <div className={styles.panel} {...rest}>
            {children}
        </div>
    );
}
Panel.propTypes = {
    children: PropTypes.node.isRequired,
    style: PropTypes.object,
    blarg: PropTypes.bool
};

export function PanelContainer({children, className, ...rest}) {
    return (
        <div {...rest} className={classNames(styles.panels, className)}>
            {children}
        </div>
    );
}
PanelContainer.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string
};

const {format: dateFormat} = new Intl.DateTimeFormat(
    "en-US",
    {
        day: "2-digit",
        month: "short",
        year: "numeric"
    }
);
const {format: timeFormat} = new Intl.DateTimeFormat(
    "en-US",
    {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    }
);

function withDateFormatFunc(formatFunc) {
    const _DateFormat = ({date, ...rest}) => (
        <time dateTime={date.toISOString()} {...rest}>
            {formatFunc(date)}
        </time>
    );
    _DateFormat.propTypes = {
        date: PropTypes.instanceOf(Date).isRequired
    };
    return _DateFormat;
}

const DateFormat = withDateFormatFunc(dateFormat);
export {DateFormat};
const DateTimeFormat = withDateFormatFunc(timeFormat);
export {DateTimeFormat};

export function Notification({
    children,
    success,
    warning,
    error,
    className,
    tooltip,
    ...rest
}) {
    const [icon, notifClassName] = (function () {
        if (success) {
            return [<Icons.Check />, "notification__success"];
        } else if (warning) {
            return [<Icons.Alert />, "notification__warning"];
        } else if (error) {
            return [<Icons.X />, "notification__error"];
        } else {
            return [<Icons.Info />, "notification__generic"];
        }
    }());
    return (
        <div
            {...rest}
            className={classNames("notification", notifClassName, className)}
        >
            <div
                aria-label={tooltip}
                className="notification__icon"
                title={tooltip}
            >
                {icon}
            </div>
            <div className="notification__text">
                {children}
            </div>
        </div>
    );
}
Notification.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    error: PropTypes.bool,
    success: PropTypes.bool,
    tooltip: PropTypes.string,
    warning: PropTypes.bool
};

// This just creates empty space to balance the layout, e.g. if there's a button
// on one side of a centered element that's offsetting it.
const PlaceholderButton = () => (
    <button
        className="button-ghost placeholder"
        aria-hidden
        disabled
    />
);
export {PlaceholderButton};

export function SortButton({children, sortKey, data, dispatch}) {
    function setKeyOrToggleDir() {
        if (data.key === sortKey) {
            dispatch({isDescending: !data.isDescending});
        } else {
            dispatch({key: sortKey});
        }
    }
    const chevronStyle = data.key === sortKey ? {opacity: 1} : {opacity: 0};
    return (
        <button
            className="button-micro dont-hide button-text-ghost title-20"
            style={{width: "100%"}}
            onClick={setKeyOrToggleDir}
        >
            <Icons.ChevronUp style={{opacity: 0}} aria-hidden/>
            {children}{" "}
            {data.isDescending
            ? (
                <span style={chevronStyle}>
                    <Icons.ChevronUp />
                    <VisuallyHidden>Sort ascending.</VisuallyHidden>
                </span>
            ) : (
                <span style={chevronStyle}>
                    <Icons.ChevronDown />
                    <VisuallyHidden>Sort descending.</VisuallyHidden>
                </span>
            )}
        </button>
    );
}
SortButton.propTypes = {
    children: PropTypes.string.isRequired,
    data: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    sortKey: PropTypes.string.isRequired
};
