module Result: {
  type t =
    | WhiteWon
    | BlackWon
    | Draw
    | NotSet;

  type color =
    | White
    | Black;

  let toFloat: (t, color) => float;

  let toString: t => string;

  let fromString: string => t;
};

type t = {
  id: Data_Id.t,
  whiteId: Data_Id.t,
  blackId: Data_Id.t,
  whiteNewRating: int,
  blackNewRating: int,
  whiteOrigRating: int,
  blackOrigRating: int,
  result: Result.t,
};

let decode: Js.Json.t => t;

let encode: t => Js.Json.t;

let byeResultForPlayerColor:
  (Data_Config.ByeValue.t, Result.color) => Result.t;

let scoreByeMatch: (t, ~byeValue: Data_Config.ByeValue.t) => t;

let manualPair: ((Data_Player.t, Data_Player.t), Data_Config.ByeValue.t) => t;

let swapColors: t => t;
