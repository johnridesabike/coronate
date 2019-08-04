open Data;
open Belt;
open Tournament;
module LocalForage = Externals.LocalForage;

let log2 = num => log(num) /. log(2.0);

let getAllPlayerIdsFromMatches = matchList => {
  open Match;
  let allPlayers =
    Js.Array.(
      matchList
      |> reduce(
           (acc, match) => acc |> concat([|match.whiteId, match.blackId|]),
           [||],
         )
    );
  allPlayers;
};

let calcNumOfRounds = playerCount => {
  let roundCount = playerCount |> float_of_int |> log2 |> ceil;
  roundCount !== neg_infinity ? int_of_float(roundCount) : 0;
};

let emptyTourney = {
  name: "",
  playerIds: [||],
  roundList: [||],
  date: Js.Date.fromFloat(0.0),
  id: Utils.nanoid(),
  tieBreaks: [|1|],
  byeQueue: [||],
};

let tournamentReducer = (_, action) => action;

type action('a) =
  | Set(string, 'a)
  | Del(string)
  | SetAll(Map.String.t('a));

let playersReducer = (state, action) => {
  Map.String.(
    switch (action) {
    | Set(id, player) => state->set(id, player)
    /*You should delete all avoid-pairs with the id too.*/
    | Del(id) => state->remove(id)
    | SetAll(state) => state
    }
  );
};

type t = {
  activePlayers: Map.String.t(Player.t),
  getPlayer: string => Player.t,
  isItOver: bool,
  isNewRoundReady: bool,
  players: Map.String.t(Player.t),
  playersDispatch: action(Player.t) => unit,
  roundCount: int,
  tourney: Tournament.t,
  setTourney: Tournament.t => unit,
};

type loadStatus =
  | NothingIsLoaded
  | TourneyIsLoaded
  | TourneyAndPlayersAreLoaded
  | Error;

let isLoadedDone = status =>
  switch (status) {
  | NothingIsLoaded
  | TourneyIsLoaded => false
  | TourneyAndPlayersAreLoaded
  | Error => true
  };

[@react.component]
let make = (~children, ~tourneyId) => {
  let (tourney, setTourney) =
    React.useReducer(tournamentReducer, emptyTourney);
  let {Tournament.name, Tournament.playerIds, Tournament.roundList} = tourney;
  let (players, playersDispatch) =
    React.useReducer(playersReducer, Map.String.empty);
  let (loadStatus, setLoadStatus) = React.useState(() => NothingIsLoaded);
  Hooks.useLoadingCursorUntil(isLoadedDone(loadStatus));
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
      |> Repromise.map(value =>
           switch (value) {
           | None => setLoadStatus(_ => Error)
           | Some(_) when didCancel^ => ()
           | Some(value) =>
             setTourney(value);
             setLoadStatus(_ => TourneyIsLoaded);
           }
         )
      |> ignore;

      Some(() => didCancel := true);
    },
    [|tourneyId|],
  );
  /*
   Hydrate players from DB.
   */
  React.useEffect4(
    () => {
      let didCancel = ref(false);
      /* Don't run this without loading the tourney first. Otherwise, it
         will interpret the placeholder `roundList` data as meaning there
         are no active players and load an empty object.*/
      switch (loadStatus) {
      | NothingIsLoaded => ()
      | TourneyIsLoaded
      | TourneyAndPlayersAreLoaded
      | Error =>
        /* Include players who have played matches but left the tournament,
           as well as players who are registered but havne't played yet. */
        let allTheIds =
          Rounds.rounds2Matches(~roundList, ())
          |> getAllPlayerIdsFromMatches
          |> Js.Array.concat(playerIds);
        /* If there are no ids, update the player state and exit early.*/
        if (Js.Array.length(allTheIds) === 0) {
          /* This check prevents an infinite loop & memory leak: */
          if (Map.String.size(players) !== 0) {
            playersDispatch(SetAll(players));
          };
          setLoadStatus(_ => TourneyAndPlayersAreLoaded);
        } else {
          Db.Players.getItems(allTheIds)
          |> Repromise.map(values =>
               switch (values) {
               | Result.Error(_) => setLoadStatus(_ => Error)
               | Ok(_) when didCancel^ => ()
               | Ok(values) =>
                 /* This safeguards against trying to fetch dummy IDs or IDs
                    from deleted players. If we updated without this condition,
                    then this `useEffect` would trigger an infinite loop and a
                    memoryleak. */
                 let newIds =
                   values->Map.String.keysToArray->Set.String.fromArray;
                 let oldIds =
                   players->Map.String.keysToArray->Set.String.fromArray;
                 let changedPlayers =
                   Set.String.(
                     union(diff(newIds, oldIds), diff(newIds, oldIds))->size
                   );
                 if (changedPlayers !== 0) {
                   playersDispatch(SetAll(values));
                   setLoadStatus(_ => TourneyAndPlayersAreLoaded);
                 };
               }
             )
          |> ignore;
        };
      };
      Some(() => didCancel := false);
    },
    (roundList, players, playerIds, loadStatus),
  );
  /*
   Save tourney to DB.
   */
  React.useEffect3(
    () => {
      switch (loadStatus) {
      | NothingIsLoaded
      | Error => ()
      | TourneyIsLoaded
      | TourneyAndPlayersAreLoaded =>
        /*
           If the tournament wasn't loaded then the id won't match. IDK if this
           is really necessary. At some point it fixed a weird bug.
         */
        // if (tourneyId === tourney.id) {
        Db.Tournaments.setItem(tourneyId, tourney) |> ignore
      // }
      };
      None;
    },
    (loadStatus, tourneyId, tourney),
  );
  /*
   Save players to DB.
   */
  React.useEffect2(
    () => {
      switch (loadStatus) {
      | NothingIsLoaded
      | TourneyIsLoaded
      | Error => ()
      | TourneyAndPlayersAreLoaded => Db.Players.setItems(players) |> ignore
      };
      None;
    },
    (loadStatus, players),
  );
  let getPlayer = Player.getPlayerMaybe(players);
  /* `players` includes players in past matches who may have left
     `activePlayers` is only players to be matched in future matches. */
  let activePlayers =
    Map.String.(
      players->reduce(empty, (acc, key, player) =>
        if (tourney.playerIds |> Js.Array.includes(key)) {
          acc->set(key, player);
        } else {
          acc;
        }
      )
    );

  let roundCount = activePlayers->Map.String.size->calcNumOfRounds;
  let isItOver = Array.length(roundList) >= roundCount;
  let isNewRoundReady =
    Js.Array.(
      roundList |> length === 0
        ? true
        : Rounds.isRoundComplete(
            roundList,
            activePlayers,
            (roundList |> length) - 1,
          )
    );
  switch (loadStatus) {
  | TourneyAndPlayersAreLoaded =>
    children({
      activePlayers,
      getPlayer,
      isItOver,
      isNewRoundReady,
      players,
      playersDispatch,
      roundCount,
      tourney,
      setTourney,
    })
  | Error =>
    [%debugger];
    <Window.Body>
      {React.string("Error: tournament couldn't be loaded.")}
    </Window.Body>;
  | NothingIsLoaded
  | TourneyIsLoaded =>
    <Window.Body> {React.string("Loading...")} </Window.Body>
  };
};