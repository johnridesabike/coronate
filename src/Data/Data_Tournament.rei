type t = {
  id: Data_Id.t,
  name: string,
  date: Js.Date.t,
  playerIds: list(Data_Id.t),
  scoreAdjustments: Data_Id.Map.t(float),
  byeQueue: array(Data_Id.t),
  tieBreaks: array(Data_Scoring.TieBreak.t),
  roundList: Data_Rounds.t,
};

let make: (~id: Data_Id.t, ~name: string) => t;

let encode: t => Js.Json.t;

let decode: Js.Json.t => t;
