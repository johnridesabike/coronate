import React from "react";
import styles from "./index.module.css";

const Caution = () => (
    <aside className={styles.caution}>
        <p className={styles.caution__text}>
            This is beta software. Want to help make it better? Check out the
            {" "}
            <span role="img" aria-hidden>👉</span>
            &nbsp;
            <a
                className={styles.caution__link}
                href="https://github.com/johnridesabike/chessahoochee"
            >
                Git repository
            </a>.
        </p>
    </aside>
);

export default Caution;
