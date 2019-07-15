[@bs.val] external node_env: string = "process.env.NODE_ENV";
let s = React.string;

let getDateForFile = () => {
  let date = Js.Date.make();
  Externals.Numeral.(
    [|
      date |> Js.Date.getFullYear |> Js.Float.toString,
      ((date |> Js.Date.getMonth) +. 1.0)->numeral->format("00"),
      ((date |> Js.Date.getDay) +. 1.0)->numeral->format("00"),
    |]
    |> Js.Array.joinWith("-")
  );
};

let invalidAlert = () => {
  Utils.alert(
    "That data is invalid! A more helpful error message could not be "
    ++ "written yet.",
  );
};

/*
   Welcome to the world of JSON encoding and decoding! The next several functions
   make up a sort-of-safe-but-not-really way to load arbitrary JSON data. These
   only account for a few of the more major errors that could occur.
   THIS IS NOT EVEN CLOSE TO KIND OF SORT OF SAFE AND NEEDS TO BE REWRITTEN.
   WOW IS SECURITY AND JUST MAKING SURE THINGS GENERALLY WORK REALLY HARD.
 */
external unsafePlayerDecode: Js.Json.t => Data.Player.js = "%identity";
external unsafeTournamentDecode: Js.Json.t => Data.Tournament.json =
  "%identity";
external unsafeOptionsDecode:
  {
    .
    "avoidPairs": 'a,
    "byeValue": 'b,
    "lastBackup": 'c,
  } =>
  Data.Config.js =
  "%identity";

/* Pair this with a jsConverter function to turn a dict of JSON into a map of
   RE records */
let decodeWith = (json, func) => {
  json
  ->Belt.Option.mapWithDefault(None, Js.Json.decodeObject)
  ->Belt.Option.mapWithDefault(None, dict =>
      dict->Db.jsDictToReMap(func)->Some
    );
};

let decodePlayer = json => {
  json->unsafePlayerDecode->Data.Player.tFromJs;
};

let decodeTourney = json => {
  json->unsafeTournamentDecode->Data.Tournament.tFromJsonDeep;
};

/* Options get a special converter because their entries don't map to the same
   types*/
let decodeOptions = json => {
  Js.Dict.(
    Belt.Option.(
      Js.Json.(
        switch (json->decodeObject) {
        | None => None
        | Some(dict) =>
          switch (
            dict->get("byeValue")->mapWithDefault(None, decodeNumber),
            dict->get("avoidPairs")->mapWithDefault(None, decodeArray),
            dict->get("lastBackup")->mapWithDefault(None, decodeString),
          ) {
          | (Some(byeValue), Some(avoidPairs), Some(lastBackup)) =>
            {
              "byeValue": byeValue,
              "avoidPairs": avoidPairs,
              "lastBackup": Js.Date.fromString(lastBackup),
            }
            ->unsafeOptionsDecode
            ->Data.Config.tFromJs
            ->Some
          | _ => None
          }
        }
      )
    )
  );
};

let jsonToData = json => {
  Js.Json.(
    switch (json->decodeObject) {
    | None => (None, None, None)
    | Some(dict) =>
      Belt.Option.(
        dict->Js.Dict.get("options")->mapWithDefault(None, decodeOptions),
        dict->Js.Dict.get("players")->decodeWith(decodePlayer),
        dict->Js.Dict.get("tournaments")->decodeWith(decodeTourney),
      )
    }
  );
};

module LastBackupDate = {
  [@react.component]
  let make = (~date) => {
    switch (date |> Js.Date.getTime) {
    | 0.0 => s("Never")
    | _ => <Utils.DateTimeFormat date />
    };
  };
};

[@react.component]
let make = () => {
  let (tournaments, tourneysDispatch) = Db.useAllTournaments();
  let (players, playersDispatch) = Db.useAllPlayers();
  let (text, setText) = React.useState(() => "");
  let (config, configDispatch) = Db.useConfig();
  let (_, windowDispatch) = Window.useWindowContext();
  React.useEffect1(
    () => {
      windowDispatch(Window.SetTitle("Options"));
      Some(() => windowDispatch(Window.SetTitle("")));
    },
    [|windowDispatch|],
  );
  /* memoize this so the `useEffect` hook syncs with the correct states */
  let exportData =
    React.useMemo3(
      () =>
        {
          "config": config->Data.Config.tToJs,
          "players": players->Db.reMapToJsDict(Data.Player.tToJs),
          "tournaments":
            tournaments->Db.reMapToJsDict(Data.Tournament.tToJsDeep),
        },
      (config, tournaments, players),
    );
  let exportDataURI =
    switch (Js.Json.stringifyAny(exportData)) {
    | Some(str) =>
      "data:application/json," ++ str->Js.Global.encodeURIComponent
    | None => ""
    };
  React.useEffect2(
    () => {
      /* Using the raw JSON stringify because its formatting is prettier. */
      let json: string = [%raw "JSON.stringify(exportData, null, 4)"];
      setText(_ => json);
      None;
    },
    (exportData, setText),
  );

  let loadData = (~tourneys, ~players, ~config) => {
    /* TODO: implement `fromJSON` */
    tourneysDispatch(Db.SetState(tourneys));
    configDispatch(Db.SetState(config));
    playersDispatch(Db.SetState(players));

    Utils.alert("Data loaded.");
  };
  let handleText = event => {
    event |> ReactEvent.Form.preventDefault;
    switch (text |> Js.Json.parseExn) {
    | exception _ => invalidAlert()
    | rawJson =>
      switch (rawJson->jsonToData) {
      | (Some(config), Some(players), Some(tourneys)) =>
        loadData(~tourneys, ~players, ~config)
      | _ => invalidAlert()
      }
    };
  };
  let handleFile = event => {
    event |> ReactEvent.Form.preventDefault;
    let reader = Externals.makeFileReader();
    let onload = ev => {
      let data = ev##target##result;
      switch (data |> Js.Json.parseExn) {
      | exception _ => invalidAlert()
      | rawJson =>
        switch (rawJson->jsonToData) {
        | (Some(config), Some(players), Some(tourneys)) =>
          loadData(~tourneys, ~players, ~config)
        | _ => invalidAlert()
        }
      };
    };
    reader##onload #= onload;
    reader##readAsText(event->ReactEvent.Form.currentTarget##files[0]);
    event->ReactEvent.Form.currentTarget##value #= ""; // so the filename won't linger onscreen
  };
  let reloadDemoData = event => {
    event |> ReactEvent.Mouse.preventDefault;
    loadData(
      ~tourneys=DemoData.tournaments,
      ~players=DemoData.players,
      ~config=DemoData.config,
    );
  };
  let loadTestData = event => {
    event |> ReactEvent.Mouse.preventDefault;
    loadData(
      ~tourneys=TestData.tournaments,
      ~players=TestData.players,
      ~config=TestData.config,
    );
  };
  let handleTextChange = event => {
    let newText = event->ReactEvent.Form.currentTarget##value;
    setText(_ => newText);
  };
  <Window.Body>
    <div className="content-area">
      <h2> {s("Bye  settings")} </h2>
      <form>
        <p className="caption-30">
          {s("Select the default score for a bye round.")}
        </p>
        <label className="monospace body-30">
          {s("1 ")}
          <input
            checked={config.byeValue === 1.0}
            type_="radio"
            onChange={_ => configDispatch(Db.SetByeValue(1.0))}
          />
        </label>
        <label className="monospace body-30">
          {s({j|½ |j})}
          <input
            checked={config.byeValue === 0.5}
            type_="radio"
            onChange={_ => configDispatch(Db.SetByeValue(0.5))}
          />
        </label>
      </form>
      <h2> {s("Manage data")} </h2>
      <p className="caption-20">
        {s("Last export: ")}
        <LastBackupDate date={config.lastBackup} />
      </p>
      <p>
        <a
          download={"coronate-" ++ getDateForFile() ++ ".json"}
          href=exportDataURI
          onClick={_ =>
            configDispatch(Db.SetLastBackup(Js.Date.make()))
          }>
          <Icons.Download />
          {s(" Export all data")}
        </a>
      </p>
      <label htmlFor="file"> {s("Load data file:")} </label>
      <input id="file" name="file" type_="file" onChange=handleFile />
      <h2> {s("Danger zone")} </h2>
      <p className="caption-30">
        {s("I hope you know what you're doing...")}
      </p>
      <button onClick=reloadDemoData>
        {s("Reset demo data (this erases everything else)")}
      </button>
      {s(" ")}
      {node_env !== "production"
         ? <button onClick=loadTestData> {s("Load testing data")} </button>
         : React.null}
      <h3> {s("Advanced: manually edit data")} </h3>
      <form onSubmit=handleText>
        <textarea
          className="json"
          cols=50
          name="playerdata"
          rows=25
          spellCheck=false
          value=text
          onChange=handleTextChange
        />
        <p> <input type_="submit" value="Load" /> </p>
      </form>
    </div>
  </Window.Body>;
};