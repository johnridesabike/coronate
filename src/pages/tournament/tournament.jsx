import Crosstable from "./crosstable";
import NotFound from "../../components/404";
import {Notification} from "../../components/utility";
import PlayerSelect from "./player-select";
import PropTypes from "prop-types";
import React from "react";
import Round from "./round";
import {Router} from "@reach/router";
import Scores from "./scores";
import Setup from "./setup";
import Sidebar from "./sidebar";
import Status from "./status";
import TournamentData from "./tournament-data";
import {WindowBody} from "../../components/window";

function Footer({tournament}) {
    const {roundCount, tourney, isItOver, isNewRoundReady} = tournament;
    const {roundList} = tourney;
    const [tooltipText, tooltipWarn] = (function () {
        if (!isNewRoundReady) {
            return [
                "Round in progress.",
                true
            ];
        } else if (isItOver) {
            return ["All rounds have completed.", true];
        } else {
            return ["Ready to begin a new round.", false];
        }
    }());
    return (
        <>
            <label
                className="win__footer-block"
                style={{display: "inline-block"}}
            >
                Rounds completed:{" "}
                {roundList.length} <small>out of</small> {roundCount}
            </label>
            {/* <meter
                id="round-progress"
                max={roundCount}
                // optimum={roundCount}
                // low={roundCount - 1}
                style={{width: "200px"}}
                title={roundList.length + "/" + roundCount}
                value={roundList.length}
            >
                {roundList.length}/{roundCount}
            </meter> */}
            <hr className="win__footer-divider" />
            <Notification
                success={!tooltipWarn}
                tooltip={tooltipText}
                style={{
                    backgroundColor: "transparent",
                    display: "inline-flex",
                    margin: "0",
                    minHeight: "initial"
                }}
                className="win__footer-block"
            >
                {tooltipText}
            </Notification>
        </>
    );
}
Footer.propTypes = {
    tournament: PropTypes.object.isRequired
};

export default function Tournament({tourneyId, navigate}) {
    return (
        <TournamentData tourneyId={tourneyId}>
            {(tournament) =>
                <WindowBody
                    sidebar={
                        <Sidebar navigate={navigate} tournament={tournament}/>
                    }
                    footer={<Footer tournament={tournament} />}
                >
                    <Router>
                        <PlayerSelect path="/" tournament={tournament} />
                        <Status path="status" tournament={tournament} />
                        <Crosstable path="crosstable" tournament={tournament} />
                        <Scores path="scores" tournament={tournament}/>
                        <Round path="round/:roundId" tournament={tournament}/>
                        <Setup path="setup" tournament={tournament}/>
                        <NotFound default />
                    </Router>
                </WindowBody>
            }
        </TournamentData>
    );
}
Tournament.propTypes = {
    navigate: PropTypes.func,
    tourneyId: PropTypes.string
};
