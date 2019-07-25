open Belt;
[@bs.val] external node_env: string = "process.env.NODE_ENV";
let s = React.string;

let getDateForFile = () => {
  let date = Js.Date.make();
  Numeral.(
    [|
      date |> Js.Date.getFullYear |> Js.Float.toString,
      ((date |> Js.Date.getMonth) +. 1.0)->make->format("00"),
      ((date |> Js.Date.getDay) +. 1.0)->make->format("00"),
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

let dictToMap = dict => dict |> Js.Dict.entries |> Map.String.fromArray;
let mapToDict = map => map |> Map.String.toArray |> Js.Dict.fromArray;

type input_data = {
  config: Data.Config.t,
  players: Map.String.t(Data.Player.t),
  tournaments: Map.String.t(Data.Tournament.t),
};

let decodeOptions = json =>
  Json.Decode.{
    config: json |> field("config", Data.Config.decode),
    players: json |> field("players", dict(Data.Player.decode)) |> dictToMap,
    tournaments:
      json |> field("tournaments", dict(Data.Tournament.decode)) |> dictToMap,
  };

let encodeOptions = data =>
  Json.Encode.(
    object_([
      ("config", data.config |> Data.Config.encode),
      (
        "players",
        data.players->Map.String.map(Data.Player.encode) |> mapToDict |> dict,
      ),
      (
        "tournaments",
        data.tournaments->Map.String.map(Data.Tournament.encode)
        |> mapToDict
        |> dict,
      ),
    ])
  );

module LastBackupDate = {
  [@react.component]
  let make = (~date) => {
    switch (date |> Js.Date.getTime) {
    | 0.0 => s("Never")
    | _ => <Utils.DateTimeFormat date />
    };
  };
};
/* Using the raw JSON stringify because its formatting is prettier. */
[@bs.scope "JSON"] [@bs.val]
external stringify: (Js.Json.t, Js.null(unit), int) => string = "stringify";

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
      () => {config, players, tournaments},
      (config, tournaments, players),
    );
  let exportDataURI =
    exportData
    |> encodeOptions
    |> Json.stringify
    |> Js.Global.encodeURIComponent;
  React.useEffect2(
    () => {
      let encoded = exportData |> encodeOptions;
      let json = stringify(encoded, Js.null, 4);
      setText(_ => json);
      None;
    },
    (exportData, setText),
  );

  let loadData = (~tournaments, ~players, ~config) => {
    /* TODO: implement `fromJSON` */
    tourneysDispatch(Db.SetState(tournaments));
    configDispatch(Db.SetState(config));
    playersDispatch(Db.SetState(players));

    Utils.alert("Data loaded.");
  };
  let handleText = event => {
    event |> ReactEvent.Form.preventDefault;
    switch (text |> Json.parse) {
    | None => invalidAlert()
    | Some(rawJson) =>
      switch (rawJson |> decodeOptions) {
      | exception (Json.Decode.DecodeError(_)) => invalidAlert()
      | {config, players, tournaments} =>
        loadData(~tournaments, ~players, ~config)
      }
    };
  };
  let handleFile = event => {
    module FileReader = Externals.FileReader;
    event |> ReactEvent.Form.preventDefault;
    let reader = FileReader.make();
    let onload = ev => {
      let data = ev##target##result;
      switch (data |> Json.parse) {
      | None => invalidAlert()
      | Some(rawJson) =>
        switch (rawJson |> decodeOptions) {
        | exception (Json.Decode.DecodeError(_)) => invalidAlert()
        | {config, players, tournaments} =>
          loadData(~tournaments, ~players, ~config)
        }
      };
    };
    reader->FileReader.setOnLoad(onload);
    reader->FileReader.readAsText(
      event->ReactEvent.Form.currentTarget##files->Array.getExn(0),
    );
    // so the filename won't linger onscreen
    event->ReactEvent.Form.currentTarget##value #= "";
  };
  let reloadDemoData = event => {
    event |> ReactEvent.Mouse.preventDefault;
    loadData(
      ~tournaments=DemoData.tournaments,
      ~players=DemoData.players,
      ~config=DemoData.config,
    );
  };
  let loadTestData = event => {
    event |> ReactEvent.Mouse.preventDefault;
    loadData(
      ~tournaments=TestData.tournaments,
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
          href={"data:application/json," ++ exportDataURI}
          onClick={_ => configDispatch(Db.SetLastBackup(Js.Date.make()))}>
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