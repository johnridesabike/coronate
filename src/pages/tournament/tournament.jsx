import Crosstable from "./crosstable";
import Header from "./header";
import NotFound from "../../components/404";
import Options from "./options";
import PlayerSelect from "./player-select";
import PropTypes from "prop-types";
import React from "react";
import Round from "./round";
import {Router} from "@reach/router";
import Scores from "./scores";
import Sidebar from "./sidebar";
import Status from "./status";
import {TournamentProvider} from "../../hooks";
import styles from "./index.module.css";

export default function Tournament(props) {
    return (
        <TournamentProvider tourneyId={props.tourneyId}>
            <div className={styles.tournament + " has-sidebar"}>
                <Header className={styles.header} />
                <Sidebar
                    className={styles.sidebar + " has-sidebar__sidebar"}
                    navigate={props.navigate}
                />
                <div className={styles.contentFrame + " has-sidebar__content"}>
                    <Router>
                        <PlayerSelect path="/" />
                        <Status path="status" />
                        <Crosstable path="crosstable" />
                        <Scores path="scores" />
                        <Round path="round/:roundId" />
                        <Options path="options" />
                        <NotFound default />
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
