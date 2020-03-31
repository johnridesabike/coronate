type t = {
  id: Data_Id.t,
  name: string,
  date: Js.Date.t,
  playerIds: list(Data_Id.t),
  byeQueue: array(Data_Id.t),
  tieBreaks: array(Scoring.TieBreak.t),
  roundList: Data_Rounds.t,
};

let encode: t => Js.Json.t;

let decode: Js.Json.t => t;
