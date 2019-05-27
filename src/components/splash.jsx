import Icons from "./icons";
import React from "react";
import styles from "./splash.module.css";

export default function Splash(props) {
    return (
        <div className={styles.splash}>
            <aside className={styles.hint}>
                <Icons.ArrowUp /> Select a menu item.
            </aside>
            <h1 className={styles.title}>
                <span aria-hidden={true}>♘</span>{" "}
                Chessahoochee: <small>a chess tournament app</small>
            </h1>
            <footer className={styles.footer}>
                Enjoy this demo.{" "}
                <a href="https://github.com/johnridesabike/chessahoochee">
                    GitHub.
                </a>
            </footer>
        </div>
    );
}
