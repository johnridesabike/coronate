import React from "react";
import styles from "./index.module.css";

const Caution = () => (
    <aside className={styles.caution}>
        <p className={styles.caution__text}>
            <span role="img" aria-label="WARNING.">⚠️</span>
            &nbsp;
            This is beta software.
            &nbsp;
            <span role="img" aria-label="WARNING.">⚠️</span>
            {" "}
            Want to help make it better? Check out the
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
