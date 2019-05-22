import {useState, useEffect} from "react";
import localforage from "localforage";
import "localforage-getitems";
import t from "tcomb";
import {curry} from "ramda";
import demoPlayers from "../state/demo-players.json";
import demoTourneys from "../state/demo-tourney.json";
import {getPlayerById} from "../pairing-scoring";

const DB_NAME = "Chessahoochee";

const playerStore = localforage.createInstance({
    name: DB_NAME,
    storeName: "Players"
});

demoPlayers.playerList.forEach(function (value) {
    playerStore.setItem(String(value.id), value);
});

export function usePlayersDb(ids) {
    t.list(t.Number)(ids);
    const [players, setPlayers] = useState([]);
    useEffect(
        function () {
            const idStrings = ids.map((id) => String(id));
            if (idStrings.length > 0) {
                playerStore.getItems(idStrings).then(function (values) {
                    setPlayers(values);
                });
            }
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

export function useOptionDb(key, defaultValue) {
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

const tourneyStore = localforage.createInstance({
    name: DB_NAME,
    storeName: "Tournaments"
});

demoTourneys.forEach(function (value) {
    tourneyStore.setItem(String(value.id), value);
});

export function useTournamentDb(id) {
    const [tourney, setTourney] = useState({});
    useEffect(
        function () {
            tourneyStore.getItem(String(id)).then(function (value) {
                console.log("got tourney", id, value);
                setTourney(value);
            });
        },
        [id]
    );
    useEffect(
        function () {
            tourneyStore.setItem(String(id), tourney);
        },
        [id, tourney]
    );
    return [tourney, setTourney];
}
