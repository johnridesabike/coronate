import {useState, useEffect} from "react";
import localforage from "localforage";
import "localforage-getitems";
import t from "tcomb";
import {curry} from "ramda";
import demoPlayers from "./state/demo-players.json";
import {getPlayerById} from "./pairing-scoring";

const DB_NAME = "Chessahoochee";

const playerStore = localforage.createInstance({
    name: DB_NAME,
    storeName: "Players"
});

demoPlayers.playerList.forEach(function (value) {
    playerStore.setItem(String(value.id), value);
});

export function usePlayers(ids) {
    t.list(t.Number)(ids);
    const [players, setPlayers] = useState([]);
    useEffect(
        function () {
            const idStrings = ids.map((id) => String(id));
            playerStore.getItems(idStrings).then(function (values) {
                setPlayers(values);
            });
        },
        [ids]
    );
    useEffect(
        function () {
            console.log("player list was updated", players);
        },
        [players]
    );
    const getPlayer = curry(getPlayerById)(players);
    return [players, getPlayer];
}

const optionStore = localforage.createInstance({
    name: DB_NAME,
    storeName: "Options"
});

export function useOption(key, defaultValue) {
    const [option, setOption] = useState(t.Number(defaultValue));
    useEffect(
        function () {
            optionStore.getItem(key).then(function (value) {
                console.log("getting " + key + " from localforage");
                (value === null)
                ? setOption(t.Number(defaultValue))
                : setOption(t.Number(value));
            }).catch(function (err) {
                console.log("error:", err);
            });
        },
        [key, defaultValue]
    );
    useEffect(
        function () {
            optionStore.setItem(key, option).then(
                function (value) {
                    console.log("updated", key, value);
                }
            ).catch(function (err) {
                console.log("error:", err);
            });
        },
        [key, option]
    );
    return [option, setOption];
}
