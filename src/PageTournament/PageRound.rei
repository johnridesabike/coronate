module RoundTable: {
  [@react.component]
  let make:
    (
      ~isCompact: bool=?,
      ~roundId: int,
      ~matches: array(Data.Match.t),
      ~selectedMatch: Data.Id.t=?,
      ~setSelectedMatch: ('a => option(Data_Id.t)) => unit=?,
      ~tournament: LoadTournament.t,
      ~scoreData: Data.Id.Map.t(Data_Scoring.t)=?
    ) =>
    React.element;
};

[@react.component]
let make: (~roundId: int, ~tournament: LoadTournament.t) => React.element;
