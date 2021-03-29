open Belt
open Data

@val external node_env: string = "process.env.NODE_ENV"

let getDateForFile = () => {
  let date = Js.Date.make()
  [
    date->Js.Date.getFullYear->Float.toString,
    (Js.Date.getMonth(date) +. 1.0)->Numeral.make->Numeral.format("00"),
    Js.Date.getDate(date)->Numeral.make->Numeral.format("00"),
  ]->Js.Array2.joinWith("-")
}

let invalidAlert = () =>
  Utils.alert("That data is invalid! A more helpful error message could not be written yet.")

let dictToMap = dict => dict->Js.Dict.entries->Data.Id.Map.fromStringArray
let mapToDict = map => map->Data.Id.Map.toStringArray->Js.Dict.fromArray

type input_data = {
  config: Config.t,
  players: Data.Id.Map.t<Player.t>,
  tournaments: Data.Id.Map.t<Tournament.t>,
}

let decodeOptions = json => {
  open Json.Decode
  {
    config: json |> field("config", Config.decode),
    players: json |> field("players", dict(Player.decode)) |> dictToMap,
    tournaments: json |> field("tournaments", dict(Tournament.decode)) |> dictToMap,
  }
}

let encodeOptions = data => {
  open Json.Encode
  object_(list{
    ("config", Config.encode(data.config)),
    ("players", Map.map(data.players, Player.encode)->mapToDict->jsonDict),
    ("tournaments", Map.map(data.tournaments, Tournament.encode)->mapToDict->jsonDict),
  })
}

module LastBackupDate = {
  @react.component
  let make = (~date) =>
    if Js.Date.getTime(date) == 0.0 {
      React.string("Never")
    } else {
      <Utils.DateTimeFormat date />
    }
}

@react.component
let make = (~windowDispatch=_ => ()) => {
  let {items: tournaments, dispatch: tourneysDispatch, _} = Db.useAllTournaments()
  let {items: players, dispatch: playersDispatch, _} = Db.useAllPlayers()
  let (text, setText) = React.useState(() => "")
  let (config, configDispatch) = Db.useConfig()
  React.useEffect1(() => {
    windowDispatch(Window.SetTitle("Options"))
    Some(() => windowDispatch(SetTitle("")))
  }, [windowDispatch])
  /* memoize this so the `useEffect` hook syncs with the correct states */
  let exportData = React.useMemo3(
    () => {config: config, players: players, tournaments: tournaments},
    (config, tournaments, players),
  )
  let exportDataURI = exportData->encodeOptions->Json.stringify->Js.Global.encodeURIComponent
  React.useEffect2(() => {
    let encoded = encodeOptions(exportData)
    let json = Js.Json.stringifyWithSpace(encoded, 2)
    setText(_ => json)
    None
  }, (exportData, setText))

  let loadData = (~tournaments, ~players, ~config) => {
    tourneysDispatch(SetAll(tournaments))
    configDispatch(SetState(config))
    playersDispatch(SetAll(players))
    Utils.alert("Data loaded.")
  }
  let handleText = event => {
    ReactEvent.Form.preventDefault(event)
    switch Json.parse(text) {
    | None => invalidAlert()
    | Some(rawJson) =>
      switch decodeOptions(rawJson) {
      | exception Json.Decode.DecodeError(_) => invalidAlert()
      | {config, players, tournaments} => loadData(~tournaments, ~players, ~config)
      }
    }
  }
  let handleFile = event => {
    module FileReader = Externals.FileReader
    ReactEvent.Form.preventDefault(event)
    let reader = FileReader.make()
    let onload = ev => {
      let data = ev["target"]["result"]
      switch Json.parse(data) {
      | None => invalidAlert()
      | Some(rawJson) =>
        switch decodeOptions(rawJson) {
        | exception Json.Decode.DecodeError(_) => invalidAlert()
        | {config, players, tournaments} => loadData(~tournaments, ~players, ~config)
        }
      }
    }
    FileReader.setOnLoad(reader, onload)
    FileReader.readAsText(reader, ReactEvent.Form.currentTarget(event)["files"]->Array.getExn(0))
    /* so the filename won't linger onscreen */
    /* https://github.com/BuckleScript/bucklescript/issues/4391 */
    @warning("-20") ReactEvent.Form.currentTarget(event)["value"] = ""
  }
  let reloadDemoData = event => {
    ReactEvent.Mouse.preventDefault(event)
    loadData(~tournaments=DemoData.tournaments, ~players=DemoData.players, ~config=DemoData.config)
  }
  let loadTestData = event => {
    ReactEvent.Mouse.preventDefault(event)
    loadData(~tournaments=TestData.tournaments, ~players=TestData.players, ~config=TestData.config)
  }
  let handleTextChange = event => {
    let newText = ReactEvent.Form.currentTarget(event)["value"]
    setText(_ => newText)
  }
  <Window.Body windowDispatch>
    <div className="content-area">
      <h2> {React.string("Bye  settings")} </h2>
      <form>
        <p className="caption-30"> {React.string("Select the default score for a bye round.")} </p>
        <div style={ReactDOMRe.Style.make(~display="flex", ())}>
          <label
            className="monospace body-30" style={ReactDOMRe.Style.make(~marginRight="16px", ())}>
            {React.string("1 ")}
            <input
              checked={switch config.byeValue {
              | Full => true
              | Half => false
              }}
              type_="radio"
              onChange={_ => configDispatch(SetByeValue(Full))}
            />
          </label>
          <label className="monospace body-30">
            {React.string(j`½ `)}
            <input
              checked={switch config.byeValue {
              | Full => false
              | Half => true
              }}
              type_="radio"
              onChange={_ => configDispatch(SetByeValue(Half))}
            />
          </label>
        </div>
      </form>
      <h2> {React.string("Manage data")} </h2>
      <p className="caption-20">
        {React.string("Last export: ")} <LastBackupDate date=config.lastBackup />
      </p>
      <p>
        <a
          download={"coronate-" ++ (getDateForFile() ++ ".json")}
          href={"data:application/json," ++ exportDataURI}
          onClick={_ => configDispatch(SetLastBackup(Js.Date.make()))}>
          <Icons.Download /> {React.string(" Export all data")}
        </a>
      </p>
      <label htmlFor="file"> {React.string("Load data file:")} </label>
      <input id="file" name="file" type_="file" onChange=handleFile />
      <h2> {React.string("Danger zone")} </h2>
      <p className="caption-30"> {React.string("I hope you know what you're doing...")} </p>
      <button onClick=reloadDemoData>
        {React.string("Reset demo data (this erases everything else)")}
      </button>
      {React.string(" ")}
      {node_env != "production"
        ? <button onClick=loadTestData> {React.string("Load testing data")} </button>
        : React.null}
      <h3> {React.string("Advanced: manually edit data")} </h3>
      <form onSubmit=handleText>
        <textarea
          className="pages__text-json"
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
  </Window.Body>
}
