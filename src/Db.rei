let loadDemoDB: unit => unit;

let tournaments: LocalForage.Map.t(Data.Tournament.t);

type action('a) =
  | Del(Data.Id.t)
  | Set(Data.Id.t, 'a)
  | SetAll(Data.Id.Map.t('a));

type state('a) = {
  items: Data.Id.Map.t('a),
  dispatch: action('a) => unit,
  loaded: bool,
};

let useAllPlayers: unit => state(Data.Player.t);

let useAllTournaments: unit => state(Data.Tournament.t);

type actionConfig =
  | AddAvoidPair(Data.Config.AvoidPairs.pair)
  | DelAvoidPair(Data.Config.AvoidPairs.pair)
  | DelAvoidSingle(Data.Id.t)
  | SetAvoidPairs(Data.Config.AvoidPairs.t)
  | SetByeValue(Data.Config.ByeValue.t)
  | SetState(Data.Config.t)
  | SetLastBackup(Js.Date.t);

let useConfig: unit => (Data.Config.t, actionConfig => unit);
