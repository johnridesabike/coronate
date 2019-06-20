import PropTypes from "prop-types";
import React from "react";
import classNames from "classnames";
import {ifElectronOpen} from "../../electron-utils";
import styles from "./index.module.css";

const GITHUB_URL = "https://github.com/johnridesabike/chessahoochee";

const Caution = (props) => (
    <aside
        {...props}
        className={classNames(styles.caution, "body-20", props.className)}
    >
        <p className={styles.caution__text}>
            This is beta software. Want to help make it better? Check out the
            {" "}
            <span role="img" aria-hidden>👉</span>
            &nbsp;
            <a
                className={styles.caution__link}
                href={GITHUB_URL}
                onClick={(e) => ifElectronOpen(e, GITHUB_URL)}

            >
                Git repository
            </a>.
        </p>
    </aside>
);
Caution.propTypes = {
    className: PropTypes.string
};

export default Caution;
