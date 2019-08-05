open Data;
open Belt;
open Tournament;
module LocalForage = Externals.LocalForage;

let log2 = num => log(num) /. log(2.0);

let calcNumOfRounds = playerCount => {
  let roundCount = playerCount |> float_of_int |> log2 |> ceil;
  roundCount !== neg_infinity ? int_of_float(roundCount) : 0;
};

let emptyTourney = {
  name: "",
  playerIds: [],
  roundList: [||],
  date: Js.Date.fromFloat(0.0),
  id: Utils.nanoid(),
  tieBreaks: [|1|],
  byeQueue: [||],
};

let tournamentReducer = (_, action) => action;

type t = {
  activePlayers: Map.String.t(Player.t),
  getPlayer: string => Player.t,
  isItOver: bool,
  isNewRoundReady: bool,
  players: Map.String.t(Player.t),
  playersDispatch: Db.action(Player.t) => unit,
  roundCount: int,
  tourney: Tournament.t,
  setTourney: Tournament.t => unit,
};

type loadStatus =
  | NotLoaded
  | Loaded
  | Error;

let isLoadedDone = status =>
  switch (status) {
  | NotLoaded => false
  | Loaded
  | Error => true
  };

[@react.component]
let make = (~children, ~tourneyId) => {
  let (tourney, setTourney) =
    React.useReducer(tournamentReducer, emptyTourney);
  let {Tournament.name, playerIds, roundList} = tourney;
  let (players, playersDispatch, arePlayersLoaded) = Db.useAllPlayers();
  let (tourneyLoaded, setTourneyLoaded) = React.useState(() => NotLoaded);
  Hooks.useLoadingCursorUntil(
    isLoadedDone(tourneyLoaded) && arePlayersLoaded,
  );
  let (_, windowDispatch) = Window.useWindowContext();
  /*
   Set the document title.
   */
  React.useEffect2(
    () => {
      windowDispatch(Window.SetTitle(name));
      Some(() => windowDispatch(Window.SetTitle("")));
    },
    (name, windowDispatch),
  );
  /*
   Initialize the tournament from the database.
   */
  React.useEffect1(
    () => {
      let didCancel = ref(false);
      Db.Tournaments.getItem(tourneyId)
      ->Future.tapOk(value =>
          switch (value) {
          | _ when didCancel^ => ()
          | None => setTourneyLoaded(_ => Error)
          | Some(value) =>
            setTourney(value);
            setTourneyLoaded(_ => Loaded);
          }
        )
      ->Future.tapError(_ =>
          if (! didCancel^) {
            setTourneyLoaded(_ => Error);
          }
        )
      ->ignore;
      Some(() => didCancel := true);
    },
    [|tourneyId|],
  );
  /*
   Save tourney to DB.
   */
  React.useEffect3(
    () => {
      switch (tourneyLoaded) {
      | NotLoaded
      | Error => ()
      | Loaded =>
        /*
           If the tournament wasn't loaded then the id won't match. IDK if this
           is really necessary. At some point it fixed a weird bug.
         */
        // if (tourneyId === tourney.id) {
        Db.Tournaments.setItem(tourneyId, tourney)->ignore
      // }
      };
      None;
    },
    (tourneyLoaded, tourneyId, tourney),
  );
  switch (tourneyLoaded, arePlayersLoaded) {
  | (Loaded, true) =>
    /* `activePlayers` is only players to be matched in future matches. */
    let activePlayers =
      players->Map.String.keep((id, _) => playerIds->List.has(id, (===)));
    let roundCount = activePlayers->Map.String.size->calcNumOfRounds;
    let isItOver = Array.length(roundList) >= roundCount;
    let isNewRoundReady =
      Js.Array.(
        length(roundList) === 0
          ? true
          : Rounds.isRoundComplete(
              roundList,
              activePlayers,
              length(roundList) - 1,
            )
      );
    children({
      activePlayers,
      getPlayer: Player.getPlayerMaybe(players),
      isItOver,
      isNewRoundReady,
      players,
      playersDispatch,
      roundCount,
      tourney,
      setTourney,
    });
  | (Error, _) =>
    [%debugger];
    <Window.Body>
      {React.string("Error: tournament couldn't be loaded.")}
    </Window.Body>;
  | (NotLoaded, true)
  | (Loaded, false)
  | (NotLoaded, false) =>
    <Window.Body> {React.string("Loading...")} </Window.Body>
  };
};