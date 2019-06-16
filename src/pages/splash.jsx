import Caution from "../components/caution";
import HasSidebar from "../components/sidebar-default";
import Icons from "../components/icons";
import {Notification} from "../components/utility";
import React from "react";
import {loadDemoDB} from "../hooks/db";
import styles from "./splash.module.css";

const Splash = (props) => (
    <HasSidebar>
        <div className={styles.splash}>
            <aside className={styles.hint}>
                <ol>
                    <li>
                        <button
                            className="button-primary"
                            onClick={loadDemoDB}
                        >
                            Click here to load the demo data
                        </button>{" "}
                        (optional)
                    </li>
                    <li>
                        <Icons.ArrowLeft /> Select a menu item.
                    </li>
                    <li>
                        Start creating your tournaments!
                    </li>
                </ol>
                <Notification warning>
                    If you experience any glitches or crashes,<br />
                    clear your browser cache and try again.
                </Notification>
            </aside>
            <div className={styles.title}>
                <div className={styles.titleIcon}>
                    <Icons.Logo />
                </div>
                <div className={styles.titleText}>
                    <h1 className="title">
                        Chessahoochee
                    </h1>
                    <p className={styles.subtitle + " caption-30"}>
                        a chess tournament app
                    </p>
                </div>
            </div>
            <footer className={"body-20 " + styles.footer}>
                <div style={{display: "flex", justifyContent: "space-between"}}>
                    <div style={{textAlign: "left"}}>
                        <p>
                            Copyright &copy; 2019 John Jackson.
                        </p>
                        <p>
                            Chessahoochee is free software.<br/>
                            <a
                                // eslint-disable-next-line max-len
                                href="https://github.com/johnridesabike/chessahoochee"
                            >
                                Source code is available
                            </a>
                            {" "}under the{" "}
                            <a
                                // eslint-disable-next-line max-len
                                href="https://github.com/johnridesabike/chessahoochee/blob/master/LICENSE"
                            >
                                AGPL v3.0 license
                            </a>.
                        </p>
                    </div>
                    <div style={{textAlign: "right"}}>
                        <p>
                            <a
                                // eslint-disable-next-line max-len
                                href="https://github.com/johnridesabike/chessahoochee/issues/new"
                            >
                                Suggetions and bug reports are welcome.
                            </a>
                        </p>
                        <p>
                            Built with JavaScript and{" "}
                            <a href="https://reactjs.org/">React</a>.{" "}
                            <span style={{fontSize: "16px"}}>
                                <Icons.Javascript /> <Icons.React />
                            </span>
                        </p>
                    </div>
                </div>
                <Caution
                    style={{margin: "0 -16px", width: "calc(100% + 32px"}}
                />
            </footer>
        </div>
    </HasSidebar>
);
export default Splash;
