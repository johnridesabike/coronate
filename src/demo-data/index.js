import fromJSON from "tcomb/lib/fromJSON";
import options from "./options.json";
import players from "./players.json";
import t from "tcomb";
import tournaments from "./tournaments.json";
import {types} from "../data-types";

export default {
    options,
    players: t.dict(types.Id, types.Player)(players),
    tournaments: fromJSON(tournaments, t.dict(types.Id, types.Tournament))
};
