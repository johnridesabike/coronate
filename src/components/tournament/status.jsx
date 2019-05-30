import {Panel, PanelContainer} from "../utility";
import React from "react";
import RoundTable from "./round/round-table";
import {ScoreTable} from "./scores";
import {useTournament} from "../../hooks";

export default function Status() {
    const {tourney} = useTournament();
    const lastRound = (function () {
        if (tourney.roundList.length === 0) {
            return <p>No rounds played yet.</p>;
        }
        const lastRoundId = tourney.roundList.length - 1;
        if (tourney.roundList[lastRoundId].length === 0) {
            return <p>Matched players will be shown here.</p>;
        }
        return (
            <RoundTable
                roundId={lastRoundId}
                compact
            />
        );
    }());
    return (
        <div className="content-area" style={{width: "712px"}}>
            <h2 style={{textAlign: "center"}}>Tournament status</h2>
            <PanelContainer>
                <Panel>
                    <ScoreTable title="Rankings" compact />
                </Panel>
                <Panel>
                    {lastRound}
                </Panel>
            </PanelContainer>
        </div>
    );
}
