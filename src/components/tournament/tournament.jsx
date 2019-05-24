import Header from "./header";
import PropTypes from "prop-types";
import React from "react";
import Sidebar from "./sidebar";
import {TournamentProvider} from "../../hooks";
import styles from "./tournament.module.css";

export default function Tournament(props) {
    return (
        <TournamentProvider tourneyId={props.tourneyId}>
            <div className={styles.tournament}>
                <Header className={styles.header} />
                <Sidebar className={styles.sidebar} navigate={props.navigate} />
                <div className={styles.content}>
                    {props.children}
                </div>
            </div>
        </TournamentProvider>
    );
}
Tournament.propTypes = {
    children: PropTypes.node,
    navigate: PropTypes.func,
    path: PropTypes.string,
    tourneyId: PropTypes.string
};
