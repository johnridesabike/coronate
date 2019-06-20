import React, {useEffect} from "react";
import {useAllPlayersDb, useOptionsDb, useSortedTable} from "../../hooks";
import PlayerList from "./player-list";
import PlayerProfile from "./player-profile";
import {Router} from "@reach/router";
import {WindowBody} from "../../components/window";

export default function Players(props) {
    const [players, playersDispatch] = useAllPlayersDb();
    const [sorted, sortDispatch] = useSortedTable(
        Object.values(players),
        "firstName",
        false
    );
    useEffect(
        function () {
            sortDispatch({table: Object.values(players)});
        },
        [players, sortDispatch]
    );
    const [options, optionsDispatch] = useOptionsDb();
    const childProps = {options, optionsDispatch, players, playersDispatch};
    return (
        <WindowBody>
            <Router basepath="players">
                <PlayerList
                    path="/"
                    sorted={sorted}
                    sortDispatch={sortDispatch}
                    {...childProps}
                />
                <PlayerProfile path=":playerId" {...childProps} />
            </Router>
        </WindowBody>
    );
}
Players.propTypes = {};

export {PlayerProfile, PlayerList};
