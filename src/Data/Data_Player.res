module Type = {
  type t =
    | Person
    | Dummy
    | Missing

  let toString = data =>
    switch data {
    | Person => "person"
    | Dummy => "dummy"
    | Missing => "missing"
    }

  let fromString = str =>
    switch str {
    | "person" => Person
    | "dummy" => Dummy
    | "missing" => Missing
    | _ => Person
    }

  let encode = data => data->toString->Json.Encode.string

  let decode = data => data->Json.Decode.string->fromString
}

type t = {
  firstName: string,
  id: Data_Id.t,
  lastName: string,
  matchCount: int,
  rating: int,
  type_: Type.t,
}

let fullName = t => t.firstName ++ " " ++ t.lastName

let decode = json => {
  open Json.Decode
  {
    firstName: json |> field("firstName", string),
    id: json |> field("id", Data_Id.decode),
    lastName: json |> field("lastName", string),
    matchCount: json |> field("matchCount", int),
    rating: json |> field("rating", int),
    type_: json |> field("type_", Type.decode),
  }
}

let encode = data => {
  open Json.Encode
  object_(list{
    ("firstName", data.firstName |> string),
    ("id", data.id |> Data_Id.encode),
    ("lastName", data.lastName |> string),
    ("matchCount", data.matchCount |> int),
    ("rating", data.rating |> int),
    ("type_", data.type_ |> Type.encode),
  })
}

let dummy = {
  id: Data_Id.dummy,
  firstName: "Bye",
  lastName: "Player",
  type_: Dummy,
  matchCount: 0,
  rating: 0,
}

@ocaml.doc("
 * If `getMaybe` can't find a profile (e.g. if it was deleted) then it
 * outputs this instead. The ID will be the same as missing player's ID.
 ")
let makeMissing = id => {
  id: id,
  firstName: "Anonymous",
  lastName: "Player",
  type_: Missing,
  matchCount: 0,
  rating: 0,
}

let getMaybe = (playerMap, id) =>
  if Data_Id.isDummy(id) {
    dummy
  } else {
    Belt.Map.getWithDefault(playerMap, id, makeMissing(id))
  }
