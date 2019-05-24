import {assoc, dissoc} from "ramda";
import {createPlayer, createTournament} from "../../data-types";
import nanoid from "nanoid";
import t from "tcomb";

const ActionLoadState = t.interface({
    state: t.Any
});
const ActionDelItem = t.interface({
    id: t.String
});
const ActionAddItem = t.interface({
    item: t.Any
});
const ActionAddTourney = t.interface({
    name: t.String
});
const AdctionAddPlayer = t.interface({
    firstName: t.String,
    lastName: t.String,
    rating: t.Number
});
const ActionTypes = t.union([
    ActionLoadState,
    ActionDelItem,
    ActionAddItem,
    AdctionAddPlayer,
    ActionAddTourney
]);
ActionTypes.dispatch = function (x) {
    const typeToConstructor = {
        "ADD_ITEM": ActionAddItem,
        "ADD_PLAYER": AdctionAddPlayer,
        "ADD_TOURNEY": ActionAddTourney,
        "DEL_ITEM": ActionDelItem,
        "LOAD_STATE": ActionLoadState
    };
    return typeToConstructor[x.type];
};

export default function genericDbReducer(state, action) {
    ActionTypes(action);
    const nextId = nanoid();
    switch (action.type) {
    case "ADD_ITEM":
        console.warn("Use a more specific action instead, please.");
        return assoc(nextId, action.item, state);
    case "ADD_TOURNEY":
        return assoc(
            nextId,
            createTournament({id: nextId, name: action.name}),
            state
        );
    case "ADD_PLAYER":
        return assoc(
            nextId,
            createPlayer({
                firstName: action.firstName,
                id: nextId,
                lastName: action.lastName,
                rating: action.rating
            }),
            state
        );
    case "DEL_ITEM":
        return dissoc(action.id, state);
    case "LOAD_STATE":
        return action.state;
    default:
        throw new Error("Unexpected action type");
    }
}
