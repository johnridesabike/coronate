open Belt;
module Type = {
  /*
    These are mainly used for CSS styling.
   */
  type t =
    | Person
    | Dummy
    | Missing;
  let toString = data =>
    switch (data) {
    | Person => "person"
    | Dummy => "dummy"
    | Missing => "missing"
    };
  let fromString = str =>
    switch (str) {
    | "person" => Person
    | "dummy" => Dummy
    | "missing" => Missing
    | _ => Person
    };
  let encode = data => data |> toString |> Json.Encode.string;
  let decode = data => data |> Json.Decode.string |> fromString;
};

type t = {
  firstName: string,
  id: string,
  lastName: string,
  matchCount: int,
  rating: int,
  type_: Type.t,
};
let decode = json =>
  Json.Decode.{
    firstName: json |> field("firstName", string),
    id: json |> field("id", string),
    lastName: json |> field("lastName", string),
    matchCount: json |> field("matchCount", int),
    rating: json |> field("rating", int),
    type_: json |> field("type_", Type.decode),
  };
let encode = data =>
  Json.Encode.(
    object_([
      ("firstName", data.firstName |> string),
      ("id", data.id |> string),
      ("lastName", data.lastName |> string),
      ("matchCount", data.matchCount |> int),
      ("rating", data.rating |> int),
      ("type_", data.type_ |> Type.encode),
    ])
  );

/*
  This is used in by matches to indicate a dummy player. The `getPlayerMaybe`
  function returns a special dummy player profile when fetching this ID.
  This ID conforms to the NanoID regex, which currently has no purpose.
 */
let dummy_id = "________DUMMY________";
/* This are useful for passing to `filter()` methods.*/
let isDummyId = playerId => playerId === dummy_id;

/* This is the dummy profile that `getPlayerMaybe()` returns for bye rounds.*/
let dummyPlayer = {
  id: dummy_id,
  firstName: "Bye",
  lastName: "Player",
  type_: Type.Dummy,
  matchCount: 0,
  rating: 0,
};

/*
  If `getPlayerMaybe()` can't find a profile (e.g. if it was deleted) then it
  outputs this instead. The ID will be the same as missing player's ID.
 */
let makeMissingPlayer = id => {
  id,
  firstName: "Anonymous",
  lastName: "Player",
  type_: Type.Missing,
  matchCount: 0,
  rating: 0,
};

/* This function should always be used in components that *might* not be able to
   display current player information. This includes bye rounds with "dummy"
   players, or scoreboards where a player may have been deleted. */
let getPlayerMaybe = (playerMap, id) =>
  if (id === dummy_id) {
    dummyPlayer;
  } else {
    playerMap->Map.String.getWithDefault(id, makeMissingPlayer(id));
  };