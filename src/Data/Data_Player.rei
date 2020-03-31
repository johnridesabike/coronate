module Type: {
  type t =
    | Person
    | Dummy
    | Missing;

  let toString: t => string;
};

type t = {
  firstName: string,
  id: Data_Id.t,
  lastName: string,
  matchCount: int,
  rating: int,
  type_: Type.t,
};

let encode: t => Js.Json.t;

let decode: Js.Json.t => t;

/**
 * This is the dummy profile that `getPlayerMaybe()` returns for bye rounds.
 */
let dummy: t;

/**
 * This function should always be used in components that *might* not be able to
 * display current player information. This includes bye rounds with "dummy"
 * players, or scoreboards where a player may have been deleted.
 */
let getMaybe: (Data_Id.Map.t(t), Data_Id.t) => t;
