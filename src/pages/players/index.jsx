import React, {useEffect} from "react";
import {useAllPlayersDb, useOptionsDb, useSortedTable} from "../../hooks";
import HasSidebar from "../../components/sidebar-default";
import PlayerList from "./player-list";
import PlayerProfile from "./player-profile";
import {Router} from "@reach/router";

export default function Players(props) {
    const [players, playersDispatch] = useAllPlayersDb();
    // Memoize'd because calling `Object.values()` directly inside the
    // `useSortedTable` hook will trigger an infinite render loop.
    const sorted = useSortedTable(Object.values(players), "firstName", false);
    const {setSourceTable} = sorted;
    useEffect(
        function () {
            setSourceTable(Object.values(players));
        },
        [players, setSourceTable]
    );
    const [options, optionsDispatch] = useOptionsDb();
    const childProps = {options, optionsDispatch, players, playersDispatch};
    return (
        <HasSidebar>
            <Router basepath="players">
                <PlayerList path="/" sorted={sorted} {...childProps} />
                <PlayerProfile path=":playerId" {...childProps} />
            </Router>
        </HasSidebar>
    );
}
Players.propTypes = {};

export {PlayerProfile, PlayerList};
