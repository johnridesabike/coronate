import {Player, Tournament} from "../data-types";
import options from "./options.json";
import players from "./players.json";
import t from "tcomb";
import tournaments from "./tournaments.json";

t.dict(t.String, Tournament)(tournaments);
t.dict(t.String, Player)(players);

export default {
    options,
    players,
    tournaments
};
