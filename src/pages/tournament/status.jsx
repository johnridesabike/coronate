import React from "react";
import {Panel, PanelContainer} from "../../components/utility";
// import PropTypes from "prop-types";
import RoundTable from "./round/round-table";
import {ScoreTable} from "./scores";
import {TournamentType} from "./tournament-data";

export default function Status({tournament}) {
    const {tourney, getPlayer} = tournament;
    const lastRound = (function () {
        if (tourney.roundList.length === 0) {
            return <p>No rounds played yet.</p>;
        }
        const lastRoundId = tourney.roundList.length - 1;
        if (tourney.roundList[lastRoundId].length === 0) {
            return (
                <p>Matched players in the current round will be shown here.</p>
            );
        }
        return (
            <RoundTable
                roundId={lastRoundId}
                tournament={tournament}
                compact
            />
        );
    }());
    return (
        <>
            <h2 style={{textAlign: "center"}}>Tournament status</h2>
            <PanelContainer
                style={{justifyContent: "center"}}
            >
                <Panel>
                    {lastRound}
                </Panel>
                <Panel>
                    <ScoreTable
                        getPlayer={getPlayer}
                        title="Rankings"
                        tourney={tourney}
                        compact
                    />
                </Panel>
            </PanelContainer>
        </>
    );
}
Status.propTypes = {
    tournament: TournamentType
};
