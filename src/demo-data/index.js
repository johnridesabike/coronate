import {Id, Player, Tournament} from "../data-types";
import fromJSON from "tcomb/lib/fromJSON";
import options from "./options.json";
import players from "./players.json";
import t from "tcomb";
import tournaments from "./tournaments.json";

export default {
    options,
    players: t.dict(Id, Player)(players),
    tournaments: fromJSON(tournaments, t.dict(t.String, Tournament))
};
