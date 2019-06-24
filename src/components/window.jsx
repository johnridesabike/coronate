import {
    IfElectron,
    electron,
    ifElectron,
    macOSDoubleClick
} from "../electron-utils";
import React, {createContext, useContext, useEffect, useReducer} from "react";
import About from "./about-dialog";
import {Dialog} from "@reach/dialog";
import Icons from "./icons";
import PropTypes from "prop-types";
import Sidebar from "./sidebar-default";
import VisuallyHidden from "@reach/visually-hidden";
import WindowsControls from "./windows-controls";
import classNames from "classnames";
import logo from "../icon-min.svg";

const WindowContext = createContext(null);

export function useWindowContext() {
    return useContext(WindowContext);
}

const GLOBAL_TITLE = "Coronate";

function formatTitle(title) {
    if (!title) {
        return GLOBAL_TITLE;
    }
    return title + " - " + GLOBAL_TITLE;
}

const initialWinState = {
    action: "",
    isBlur: false,
    isDialogOpen: false,
    isFullScreen: false,
    isMaximized: false,
    isSidebarOpen: true,
    title: ""
};

function windowReducer(oldState, newState) {
    return {...oldState, ...newState};
}

const isMac = navigator.appVersion.includes("Mac");
const isWin = navigator.appVersion.includes("Windows");
const toolbarClasses = classNames(
    {"macos-button-toolbar": isMac && electron},
    {"button-ghost": !electron}
);

const WindowTitleBar = ({state, dispatch}) => (
    <header
        className={classNames(
            "app__header",
            "double-click-control",
            {"traffic-light-padding": electron && isMac && !state.isFullScreen}
        )}
        onDoubleClick={macOSDoubleClick}
    >
        <div>
            <IfElectron onlyWin>
                <span
                    style={{
                        alignItems: "center",
                        display: "inline-flex",
                        marginLeft: "4px",
                        marginRight: "8px"}
                    }
                >
                    <img src={logo} alt="" height="16" width="16" />
                </span>
            </IfElectron>
            <button
                className={toolbarClasses}
                onClick={() => dispatch({isSidebarOpen: !state.isSidebarOpen})}
            >
                <Icons.Sidebar/>
                <VisuallyHidden>Toggle sidebar</VisuallyHidden>
            </button>
            <button
                className={toolbarClasses}
                onClick={() => dispatch({isDialogOpen: true})}
            >
                <Icons.Help />
                <VisuallyHidden>About Coronate</VisuallyHidden>
            </button>
        </div>
        <div
            className={classNames(
                "body-20",
                "double-click-control",
                {"disabled": state.isBlur}
            )}
            style={{
                left: "0",
                marginLeft: "auto",
                marginRight: "auto",
                position: "absolute",
                right: "0",
                textAlign: "center",
                width: "50%"
            }}
        >
            {formatTitle(state.title)}
        </div>
        <IfElectron onlyWin><WindowsControls state={state}/></IfElectron>
    </header>
);
WindowTitleBar.propTypes = {
    dispatch: PropTypes.func,
    state: PropTypes.object
};

export function Window(props) {
    const [state, dispatch] = useReducer(windowReducer, initialWinState);
    useEffect(
        function setDocumentTitle() {
            document.title = formatTitle(state.title);
        },
        [state.title]
    );
    useEffect(
        function addEventListeners() {
            ifElectron(function () {
                const win = electron.remote.getCurrentWindow();
                // This will ensure that stale event listeners aren't persisted.
                // That typically won't be relevant to production builds, but
                // in a dev environment, where the page reloads frequently,
                // stale listeners will accumulate. Note that this can cause
                // side effects if other listeners are added elsewhere.
                function unregisterListeners() {
                    win.removeAllListeners("enter-full-screen");
                    win.removeAllListeners("leave-full-screen");
                    win.removeAllListeners("blur");
                    win.removeAllListeners("focus");
                    win.removeAllListeners("maximize");
                    win.removeAllListeners("unmaximize");
                }
                unregisterListeners();
                win.on(
                    "enter-full-screen",
                    () => dispatch({isFullScreen: true}));
                win.on(
                    "leave-full-screen",
                    () => dispatch({isFullScreen: false})
                );
                win.on("maximize", () => dispatch({isMaximized: true}));
                win.on("unmaximize", () => dispatch({isMaximized: false}));
                win.on("blur", () => dispatch({isBlur: true}));
                win.on("focus", () => dispatch({isBlur: false}));
                dispatch({
                    isBlur: !win.isFocused(),
                    isFullScreen: win.isFullScreen(),
                    isMaximized: win.isMaximized()
                });
                // I don't think this ever really fires, but can it hurt?
                return unregisterListeners;
            });
        },
        []
    );
    return (
        <div
            {...props}
            className={classNames(
                props.className,
                {"open-sidebar": state.isSidebarOpen},
                {"closed-sidebar": !state.isSidebarOpen},
                {"window-blur": state.isBlur},
                {"isWindows": isWin},
                {"isMacOS": isMac},
                {"isElectron": electron}
            )}
        >
            <WindowTitleBar state={state} dispatch={dispatch} />
            <WindowContext.Provider
                value={{winDispatch: dispatch, winState: state}}
            >
                {props.children}
            </WindowContext.Provider>
            <Dialog
                isOpen={state.isDialogOpen}
                onDismiss={() => dispatch({isDialogOpen: false})}
                style={{backgroundColor: "var(--grey-20)"}}
            >
                <button
                    className="button-micro"
                    onClick={() => dispatch({isDialogOpen: false})}
                >
                    Close
                </button>
                <About/>
            </Dialog>
        </div>
    );
}
Window.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string
};

export function WindowBody({children, footer, sidebar, footerProps = {}}) {
    return (
        <div className={classNames("winBody", {"winBody-hasFooter": footer})}>
            <div className="win__sidebar">
                {sidebar || <Sidebar />}
            </div>
            <div className="win__content">
                {children}
            </div>
            {footer && (
                <footer
                    {...footerProps}
                    className={classNames("win__footer", footerProps.className)}
                >
                    {footer}
                </footer>
            )}
        </div>
    );
}
WindowBody.propTypes = {
    children: PropTypes.node.isRequired,
    footer: PropTypes.node,
    footerProps: PropTypes.object,
    sidebar: PropTypes.node
};
