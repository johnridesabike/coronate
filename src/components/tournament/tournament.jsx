import Crosstable from "./crosstable";
import Header from "./header";
import PlayerSelect from "./player-select";
import PropTypes from "prop-types";
import React from "react";
import Round from "./round";
import {Router} from "@reach/router";
import Scores from "./scores";
import Sidebar from "./sidebar";
import Status from "./status";
import {TournamentProvider} from "../../hooks";
import styles from "./tournament.module.css";

export default function Tournament(props) {
    return (
        <TournamentProvider tourneyId={props.tourneyId}>
            <div className={styles.tournament}>
                <Header className={styles.header} />
                <Sidebar className={styles.sidebar} navigate={props.navigate} />
                <div className={styles.contentFrame}>
                    <Router>
                        <PlayerSelect path="/" />
                        <Status path="status" />
                        <Crosstable path="crosstable" />
                        <Scores path="scores" />
                        <Round path=":roundId" />
                    </Router>
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
