let loadDemoDB: unit => unit;

module Config : (module type of LocalForage.Id.MakeEncodable(Coronate.Data.Config));

module Tournament : (module type of LocalForage.Id.MakeEncodable(Coronate.Data.Tournament));

module Player : (module type of LocalForage.Id.MakeEncodable(Coronate.Data.Player));

let tournaments: LocalForage.Map.t(Data.Tournament.t, Tournament.identity);

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
  | AddAvoidPair(Data.Config.Pair.t)
  | DelAvoidPair(Data.Config.Pair.t)
  | DelAvoidSingle(Data.Id.t)
  | SetAvoidPairs(Data.Config.Pair.Set.t)
  | SetByeValue(Data.Config.ByeValue.t)
  | SetState(Data.Config.t)
  | SetLastBackup(Js.Date.t);

let useConfig: unit => (Data.Config.t, actionConfig => unit);
