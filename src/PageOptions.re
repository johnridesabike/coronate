type fileReader = {
  .
  [@bs.set] "onload": {. "target": {. "result": string}} => unit,
  [@bs.meth] "readAsText": string => unit,
};
[@bs.new] external makeFileReader: unit => fileReader = "FileReader";

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
    | 0.0 => React.null
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
  React.useEffect2(
    () =>
      switch (exportData->Js.Json.stringifyAny) {
      | Some(str) =>
        setText(_ => str);
        None;
      | None => None
      },
    (exportData, setText),
  );

  let loadData = _ => {
    /* TODO: implement `fromJSON` */
    /*
      tourneysDispatch(Hooks.Db.SetState(data##tournaments->Utils.dictToMap));
      optionsDispatch(Hooks.Db.SetState(data##options));
      playersDispatch(Hooks.Db.SetState(data##players->Utils.dictToMap));
     */
    Utils.alert(
      "Data loaded!",
    );
  };
  let handleText = event => {
    event |> ReactEvent.Form.preventDefault;
    switch (text |> Js.Json.parseExn) {
    | exception _ => invalidAlert()
    | importData => loadData(importData)
    };
  };
  let handleFile = event => {
    event |> ReactEvent.Form.preventDefault;
    let reader = makeFileReader();
    let onload = ev => {
      let data = ev##target##result;
      switch (data |> Js.Json.parseExn) {
      | exception _ => invalidAlert()
      | importData => loadData(importData)
      };
    };
    reader##onload #= onload;
    reader##readAsText(event->ReactEvent.Form.currentTarget##files[0]);
    event->ReactEvent.Form.currentTarget##value #= ""; // so the filename won't linger onscreen
  };
  let reloadDemoData = event => {
    event |> ReactEvent.Form.preventDefault;
    loadData(
      [%obj
        {
          options: DemoData.options,
          players: DemoData.players,
          tournaments: DemoData.tournaments,
        }
      ],
    );
  };
  let loadTestData = event => {
    event |> ReactEvent.Form.preventDefault;
    loadData(
      [%obj
        {
          options: TestData.options,
          players: TestData.players,
          tournaments: TestData.tournaments,
        }
      ],
    );
  };
  <Window.WindowBody>
    <div
      className="content-area"
      /*<h2>Bye  settings</h2>
        <form>
            <p className="caption-30">
                Select the default score for a bye round.
            </p>
            <label className="monospace body-30">
                1{" "}
                <input
                    checked={options.byeValue === 1}
                    type="radio"
                    onChange={() => optionsDispatch({
                        option: "byeValue",
                        type: "SET_OPTION",
                        value: 1
                    })}
                />
            </label>
            <label className="monospace body-30">
                ½{" "}
                <input
                    checked={options.byeValue === 0.5}
                    type="radio"
                    onChange={() => optionsDispatch({
                        option: "byeValue",
                        type: "SET_OPTION",
                        value: 0.5
                    })}
                />
            </label>
        </form>
        <h2>Manage data</h2>
        <p className="caption-20">
            Last export: <LastBackupDate date={options.lastBackup}/>
        </p>
        <p>
            <a
                download={"coronate-" + getDateForFile() + ".json"}
                href={
                    "data:application/json,"
                    + encodeURIComponent(JSON.stringify(exportData))
                }
                onClick={() => optionsDispatch({
                    type: "SET_OPTION",
                    option: "lastBackup",
                    value: new Date()
                })}
            >
                <Icons.Download /> Export all data
            </a>
        </p>
        <label htmlFor="file">Load data file:</label>
        <input
            id="file"
            name="file"
            type="file"
            onChange={handleFile}
        />
        <h2>Danger zone</h2>
        <p className="caption-30">
            I hope you know what you're doing...
        </p>
        <button onClick={reloadDemoData}>
            Reset demo data (this erases everything else)
        </button>
        {" "}
        {process.env.NODE_ENV !== "production" &&
            <button onClick={loadTestData}>Load testing data</button>
        }
        <h3>Advanced: manually edit data</h3>
        <form onSubmit={handleText}>
            <textarea
                className="json"
                cols={50}
                name="playerdata"
                rows={25}
                spellCheck={false}
                value={text}
                onChange={(event) => setText(event.currentTarget.value)}
            />
            <p>
                <input type="submit" value="Load" />
            </p>
        </form> */
    />
  </Window.WindowBody>;
};