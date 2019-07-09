type fileReader = {
  .
  [@bs.set] "onload": {. "target": {. "result": string}} => unit,
  [@bs.meth] "readAsText": string => unit,
};
[@bs.new] external makeFileReader: unit => fileReader = "FileReader";
[@bs.val] external node_env: string = "process.env.NODE_ENV";
let s = React.string;

let getDateForFile = () => {
  let date = Js.Date.make();
  [|
    date |> Js.Date.getFullYear |> Js.Float.toString,
    Utils.numeral((date |> Js.Date.getMonth) +. 1.0)##format("00"),
    Utils.numeral((date |> Js.Date.getDay) +. 1.0)##format("00"),
  |]
  |> Js.Array.joinWith("-");
};

let invalidAlert = () => {
  Utils.alert(
    "That data is invalid! A more helpful error message could not be "
    ++ "written yet.",
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
  let (tournaments, tourneysDispatch) = Hooks.Db.useAllTournaments();
  let (players, playersDispatch) = Hooks.Db.useAllPlayers();
  let (text, setText) = React.useState(() => "");
  let (options, optionsDispatch) = Hooks.Db.useOptions();
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
        [%obj
        {
          options,
          players: players->Utils.mapToDict,
          tournaments: tournaments->Utils.mapToDict,
        }],
      (options, tournaments, players),
    );
  let exportDataURI =
    switch (Js.Json.stringifyAny(exportData)) {
    | Some(str) =>
      "data:application/json," ++ str->Js.Global.encodeURIComponent
    | None => ""
    };
  React.useEffect2(
    () => {
      /* Using the raw JSON stringify because its formatting is better. */
      let json: string = [%raw "JSON.stringify(exportData, null, 4)"];
      setText(_ => json);
      None;
    },
    (exportData, setText),
  );

  let loadData = (~tourneys, ~players, ~options) => {
    /* TODO: implement `fromJSON` */
    tourneysDispatch(Hooks.Db.SetState(tourneys));
    optionsDispatch(Hooks.Db.SetState(options));
    playersDispatch(Hooks.Db.SetState(players));

    Utils.alert("Data loaded.");
  };
  let handleText = event => {
    event |> ReactEvent.Form.preventDefault;
    switch (text |> Js.Json.parseExn) {
    | exception _ => invalidAlert()
    | _ => () //loadData(importData)
    };
  };
  let handleFile = event => {
    event |> ReactEvent.Form.preventDefault;
    let reader = makeFileReader();
    let onload = ev => {
      let data = ev##target##result;
      switch (data |> Js.Json.parseExn) {
      | exception _ => invalidAlert()
      | _ => () //loadData(importData)
      };
    };
    reader##onload #= onload;
    reader##readAsText(event->ReactEvent.Form.currentTarget##files[0]);
    event->ReactEvent.Form.currentTarget##value #= ""; // so the filename won't linger onscreen
  };
  let reloadDemoData = event => {
    event |> ReactEvent.Mouse.preventDefault;
    loadData(
      ~tourneys=DemoData.tournaments->Utils.dictToMap,
      ~players=DemoData.players->Utils.dictToMap,
      ~options=DemoData.options,
    );
  };
  let loadTestData = event => {
    event |> ReactEvent.Mouse.preventDefault;
    loadData(
      ~tourneys=TestData.tournaments->Utils.dictToMap,
      ~players=TestData.players->Utils.dictToMap,
      ~options=TestData.options,
    );
  };
  let handleTextChange = event => {
    let newText = event->ReactEvent.Form.currentTarget##value;
    setText(_ => newText);
  };
  <Window.WindowBody>
    <div className="content-area">
      <h2> {s("Bye  settings")} </h2>
      <form>
        <p className="caption-30">
          {s("Select the default score for a bye round.")}
        </p>
        <label className="monospace body-30">
          {s("1 ")}
          <input
            checked={options->Data.byeValueGet === 1.0}
            type_="radio"
            onChange={_ => optionsDispatch(Hooks.Db.SetByeValue(1.0))}
          />
        </label>
        <label className="monospace body-30">
          {s({j|½ |j})}
          <input
            checked={options->Data.byeValueGet === 0.5}
            type_="radio"
            onChange={_ => optionsDispatch(Hooks.Db.SetByeValue(0.5))}
          />
        </label>
      </form>
      <h2> {s("Manage data")} </h2>
      <p className="caption-20">
        {s("Last export: ")}
        <LastBackupDate date={options->Data.lastBackupGet} />
      </p>
      <p>
        <a
          download={"coronate-" ++ getDateForFile() ++ ".json"}
          href=exportDataURI
          onClick={_ =>
            optionsDispatch(Hooks.Db.SetLastBackup(Js.Date.make()))
          }>
          <Icons.download />
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
  </Window.WindowBody>;
};