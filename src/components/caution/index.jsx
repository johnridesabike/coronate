import React from "react";
import styles from "./index.module.css";

const Caution = () => (
    <aside className={styles.caution}>
        <p className={styles.caution__text}>
            <span role="img" aria-label="warning">⚠️</span>
            &nbsp;
            This is an unstable demo build.
            &nbsp;
            <span role="img" aria-label="warning">⚠️</span>
            {" "}
            Want to help make it better? Head to the
            {" "}
            <span role="img" aria-label="finger pointing right">👉</span>
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
