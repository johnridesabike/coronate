import Icons from "./icons";
import React from "react";
import {loadDemoDB} from "../hooks/db";
import styles from "./splash.module.css";

const Splash = (props) => (
    <div className={styles.splash}>
        <aside className={styles.hint}>
            <ol>
                <li>
                    <button
                        className="button-primary"
                        onClick={() => loadDemoDB()}
                    >
                        Click here to load the demo data
                    </button>{" "}
                    (optional)
                </li>
                <li>
                    <Icons.ArrowUpLeft />
                    Select a menu item above.
                </li>
                <li>
                    Start creating your tournaments!
                </li>
            </ol>
        </aside>
        <h1 className={styles.title}>
            <span aria-hidden={true}>♘</span>{" "}
            Chessahoochee: <small>a chess tournament app</small>
        </h1>
        <footer className={"body-20 " + styles.footer}>
            <p>
                This is an early, proof-of-concept chess tournament app.{" "}
                <a href="https://github.com/johnridesabike/chessahoochee">
                    Suggetions, bug reports, and contributions are welcome.
                </a>
            </p>
            <p style={{textAlign: "right"}}>
                Built with JavaScript and{" "}
                <a href="https://reactjs.org/">React</a>.{" "}
                <span style={{fontSize: "1.125em"}}>
                    <Icons.Javascript /> <Icons.React />
                </span>
            </p>
        </footer>
    </div>
);
export default Splash;
