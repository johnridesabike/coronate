/*
let autoPair:
  (
    ~pairData: Data.Id.Map.t(Pairing.t),
    ~byeValue: Data.Config.ByeValue.t,
    ~playerMap: Data.Id.Map.t(Data.Player.t),
    ~byeQueue: array(Data.Id.t)
  ) =>
  list(Data.Match.t);
*/

@react.component
let make: (
  ~roundId: int,
  ~tournament: LoadTournament.t,
  ~scoreData: Data.Id.Map.t<Data.Scoring.t>,
  ~unmatched: Data.Id.Map.t<Data.Player.t>,
  ~unmatchedCount: int,
  ~unmatchedWithDummy: Data.Id.Map.t<Data.Player.t>,
) => React.element
