import {useAllPlayersDb, useOptionsDb, useSortedTable} from "../../hooks";
import PlayerInfo from "./info-box";
import PlayerList from "./player-list";
import React from "react";
import {Router} from "@reach/router";

export default function Players(props) {
    const [players, playersDispatch] = useAllPlayersDb();
    const sorted = useSortedTable(Object.values(players), "firstName", false);
    const [options, optionsDispatch] = useOptionsDb();
    const childProps = {options, optionsDispatch, players, playersDispatch};
    return (
        <Router basepath="players">
            <PlayerList path="/" sorted={sorted} {...childProps} />
            <PlayerInfo path=":playerId" {...childProps} />
        </Router>
    );
}
Players.propTypes = {};

export {PlayerInfo, PlayerList};
