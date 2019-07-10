[@bs.val] [@bs.scope "Math"] external ceil: float => float = "ceil";
[@bs.val] [@bs.scope "Math"] external log2: float => float = "log2";
[@bs.val] [@bs.scope "Number"] external isFinite: float => bool = "isFinite";
open Data;

let getAllPlayerIdsFromMatches = matchList => {
  open Match;
  let whiteGet = x => x->playerIdsGet->whiteIdGet;
  let blackGet = x => x->playerIdsGet->blackIdGet;
  let allPlayers =
    Js.Array.(
      matchList
      |> reduce(
           (acc, match) =>
             acc |> concat([|match->whiteGet, match->blackGet|]),
           [||],
         )
    );
  /* Note: Not a set. Does it need to be? */
  allPlayers;
};

let calcNumOfRounds = playerCount => {
  let roundCount = playerCount->float_of_int->log2->ceil;
  roundCount->isFinite ? roundCount->int_of_float : 0;
};

type action =
  | SetState(Tournament.t);

let tempReducer = (_, action: action) => {
  switch (action) {
  | SetState(tourney) => tourney
  };
};

let tempReducer2 = (_, action) => action;

open Tournament;
let emptyTourney =
  t(
    ~name="",
    ~playerIds=[||],
    ~roundList=[||],
    ~date=Js.Date.fromFloat(0.0),
    ~id=Utils.nanoid(),
    ~tieBreaks=[|1|],
    ~byeQueue=[||],
  );

type childrenProps = {
  activePlayers: Js.Dict.t(Player.t),
  getPlayer: string => Player.t,
  isItOver: bool,
  isNewRoundReady: bool,
  players: Js.Dict.t(Player.t),
  playersDispatch: Js.Dict.t(Player.t) => unit,
  roundCount: int,
  tourney: Tournament.t,
  tourneyDispatch: action => unit,
};

[@react.component]
let make = (~children, ~tourneyId) => {
  let (tourney, tourneyDispatch) =
    React.useReducer(tempReducer, emptyTourney);
  let name = tourney->nameGet;
  let playerIds = tourney->playerIdsGet;
  let roundList = tourney->roundListGet;
  let (players, playersDispatch) =
    React.useReducer(tempReducer2, Js.Dict.empty());
  let (isTourneyLoaded, setIsTourneyLoaded) = React.useState(() => false);
  let (isPlayersLoaded, setIsPlayersLoaded) = React.useState(() => false);
  let (isDbError, setIsDbError) = React.useState(() => false);
  Hooks.useLoadingCursor(isPlayersLoaded && isTourneyLoaded);
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
  React.useEffect4(
    () => {
      let didCancel = ref(false);
      let _ =
        Js.Promise.(
          Hooks.Db.tourneyStore##getItem(tourneyId)
          |> then_(value => {
               if (! didCancel^) {
                 switch (value->Js.Nullable.toOption) {
                 | None => setIsDbError(_ => true)
                 | Some(value) =>
                   tourneyDispatch(SetState(value));
                   setIsTourneyLoaded(_ => true);
                 };
               };
               resolve(value);
             })
        );
      Some(() => didCancel := true);
    },
    (tourneyId, tourneyDispatch, setIsTourneyLoaded, setIsDbError),
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
      if (isTourneyLoaded) {
        /* Include players who have played matches but left the tournament,
           as well as players who are registered but havne't played yet. */
        let allTheIds =
          rounds2Matches(~roundList, ())
          |> getAllPlayerIdsFromMatches
          |> Js.Array.concat(playerIds);
        /* If there are no ids, update the player state and exit early.*/
        switch (allTheIds |> Js.Array.length) {
        | 0 =>
          /* This check prevents an infinite loop & memory leak. */
          if (players |> Js.Dict.keys |> Js.Array.length !== 0) {
            playersDispatch(players);
          };
          setIsPlayersLoaded(_ => true);
        | _ =>
          let _ =
            Js.Promise.(
              Hooks.Db.playerStore##getItems(Js.Nullable.return(allTheIds))
              |> then_(values => {
                   /* This safeguards against trying to fetch dummy IDs or IDs from
                      deleted players. If we updated without this condition, then
                      this `useEffect` would trigger an infinite loop and a memory
                      leak. */
                   let newIds = values |> Js.Dict.keys;
                   let oldIds = players |> Js.Dict.keys;
                   let changedPlayers =
                     Js.Array.(
                       newIds
                       |> filter(x => !(oldIds |> includes(x)))
                       |> concat(
                            oldIds |> filter(x => !(newIds |> includes(x))),
                          )
                     );
                   Js.log("changed players:");
                   Js.log(changedPlayers |> Js.Array.length);
                   if (changedPlayers |> Js.Array.length !== 0 && ! didCancel^) {
                     playersDispatch(values);
                     setIsPlayersLoaded(_ => true);
                   };
                   resolve(values);
                 })
            );
          ();
        };
      };
      Some(() => didCancel := false);
    },
    (roundList, players, playerIds, isTourneyLoaded),
  );
  /*
   Save tourney to DB.
   */
  React.useEffect3(
    () => {
      /* If the tournament wasn't loaded then the id won't match. */
      if (isTourneyLoaded && tourneyId === tourney->idGet) {
        let _ = Hooks.Db.tourneyStore##setItem(tourneyId, tourney);
        ();
      };
      None;
    },
    (isTourneyLoaded, tourneyId, tourney),
  );
  /*
   Save players to DB.
   */
  React.useEffect2(
    () => {
      if (isPlayersLoaded) {
        let _ = Hooks.Db.playerStore##setItems(players);
        ();
      };
      None;
    },
    (isPlayersLoaded, players),
  );
  let getPlayer = Player.getPlayerMaybe(players);
  /* `players` includes players in past matches who may have left
     `activePlayers` is only players to be matched in future matches. */
  let activePlayers = Js.Dict.empty();
  let _ =
    Js.Dict.(
      Js.Array.(
        players
        |> values
        |> forEach(player =>
             if (tourney->playerIdsGet |> includes(player->Player.idGet)) {
               activePlayers->set(player->Player.idGet, player);
             }
           )
      )
    );
  let roundCount =
    Js.(activePlayers |> Dict.keys |> Array.length |> calcNumOfRounds);
  let isItOver = roundList |> Js.Array.length >= roundCount;
  let isNewRoundReady =
    Js.Array.(
      roundList |> length === 0
        ? true
        : isRoundComplete(roundList, activePlayers, roundList |> length)
    );
  if (isDbError) {
    <div> {React.string("Error: tournament not found.")} </div>;
  } else if (!isTourneyLoaded || !isPlayersLoaded) {
    <div> {React.string("Loading...")} </div>;
  } else {
    children({
      activePlayers,
      getPlayer,
      isItOver,
      isNewRoundReady,
      players,
      playersDispatch,
      roundCount,
      tourney,
      tourneyDispatch,
    });
  };
};