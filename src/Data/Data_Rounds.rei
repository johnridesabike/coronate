/* This interface file exists to keep the `t` types opaque from the rest of the
   code. The fact that they're arrays can lead to dangerous situations. */
module Round: {
  type t;
  let fromArray: array(Data_Match.t) => t;
  let toArray: t => array(Data_Match.t);
  let empty: t;
  let encode: t => Js.Json.t;
  let decode: Js.Json.t => t;
  let size: t => int;
  let addMatches: (t, array(Data_Match.t)) => t;
  let getMatched: t => array(string);
  let getMatchById: (t, string) => option(Data_Match.t);
  let removeMatchById: (t, string) => t;
  let setMatch: (t, Data_Match.t) => option(t);
  let moveMatch: (t, string, int) => option(t);
};
type t;
let fromArray: array(Round.t) => t;
let toArray: t => array(Round.t);
let empty: t;
let encode: t => Js.Json.t;
let decode: Js.Json.t => t;
let size: t => int;
let getLastKey: t => int;
let get: (t, int) => option(Round.t);
let set: (t, int, Round.t) => option(t);
let setMatch: (t, int, Data_Match.t) => option(t);
let rounds2Matches: (t, ~lastRound: int=?, unit) => array(Data_Match.t);
let isRoundComplete: (t, Belt.Map.String.t(Data_Player.t), int) => bool;
let addRound: t => t;
let delLastRound: t => t;
let updateByeScores: (t, Data_Config.ByeValue.t) => t;