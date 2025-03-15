/*
  Copyright (c) 2022 John Jackson.

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
// TODO Somehow couldn't get the warning suppression working locally :(
@@warning("-20")
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
  Webapi.Dom.Window.alert(
    Webapi.Dom.window,
    "That data is invalid! A more helpful error message could not be written yet.",
  )

let dictToMap = dict => dict->Js.Dict.entries->Data.Id.Map.fromStringArray
let mapToDict = map => map->Data.Id.Map.toStringArray->Js.Dict.fromArray

type input_data = {
  config: Config.t,
  players: Data.Id.Map.t<Player.t>,
  tournaments: Data.Id.Map.t<Tournament.t>,
}

@raises(Not_found)
let decodeOptions = json => {
  let d = Js.Json.decodeObject(json)->Option.getExn
  {
    config: d->Js.Dict.get("config")->Option.getExn->Config.decode,
    players: d
    ->Js.Dict.get("players")
    ->Option.flatMap(Js.Json.decodeObject)
    ->Option.getExn
    ->dictToMap
    ->Map.map(Player.decode),
    tournaments: d
    ->Js.Dict.get("tournaments")
    ->Option.flatMap(Js.Json.decodeObject)
    ->Option.getExn
    ->dictToMap
    ->Map.map(Tournament.decode),
  }
}

let encodeOptions = data =>
  Js.Dict.fromArray([
    ("config", Config.encode(data.config)),
    ("players", Map.map(data.players, Player.encode)->mapToDict->Js.Json.object_),
    ("tournaments", Map.map(data.tournaments, Tournament.encode)->mapToDict->Js.Json.object_),
  ])->Js.Json.object_

module LastBackupDate = {
  @react.component
  let make = (~date) =>
    if Js.Date.getTime(date) == 0.0 {
      React.string("Never")
    } else {
      <Utils.DateTimeFormat date />
    }
}

module GistOpts = {
  let dateFormatter = {
    DateTimeFormat.make(
      ["en-US"],
      DateTimeFormat.Options.make(
        ~day=#"2-digit",
        ~month=#"2-digit",
        ~year=#"2-digit",
        ~hour=#"2-digit",
        ~minute=#"2-digit",
        (),
      ),
    )
  }

  @val external github_app_id: string = "process.env.GITHUB_APP_ID"
  @val external netlify_id: option<string> = "process.env.NETLIFY_ID"

  let netlifyopts = switch netlify_id {
  | Some(site_id) => {"site_id": site_id}
  | None => Js.Obj.empty()
  }

  let savedAlert = () => Webapi.Dom.Window.alert(Webapi.Dom.window, "Data saved.")

  @react.component
  let make = (~exportData, ~configDispatch: Db.actionConfig => unit, ~loadJson) => {
    let (auth, authDispatch) = Db.useAuth()
    let minify = Hooks.useBool(true)
    let (gists, setGists) = React.useState(() => [])
    let cancelAllEffects = ref(false)

    let handleAuthError = e => {
      Js.Console.error(e)
      if !cancelAllEffects.contents {
        authDispatch(Reset)
      }
      Promise.resolve()
    }

    let loadGistList = (auth: Data.Auth.t) =>
      switch auth.github_token {
      | "" => Promise.resolve(setGists(_ => []))
      | token =>
        Octokit.Gist.list(~token)
        ->Promise.thenResolve((data: array<Octokit.Gist.file>) => {
          if !cancelAllEffects.contents {
            setGists(_ => data)
            if !Array.some(data, x => x.id == auth.github_gist_id) {
              authDispatch(RemoveGistId)
            }
          }
        })
        ->Promise.catch(handleAuthError)
      }

    React.useEffect1(() => {
      loadGistList(auth)->ignore
      Some(() => cancelAllEffects := true)
    }, [auth.github_token])

    <div>
      <h3> {"Backup to GitHub"->React.string} </h3>
      <p className="caption-30">
        {"With a GitHub account, you can save your data to a "->React.string}
        <a href="https://gist.github.com/">
          {"gist "->React.string}
          <Icons.ExternalLink />
        </a>
        {`. Note that gists can be ${HtmlEntities.ldquo}secret${HtmlEntities.rdquo} but are always 
        publicly accessible. For more information, `->React.string}
        <a href="https://docs.github.com/en/github/writing-on-github/creating-gists">
          {"refer to the gist documentation on GitHub "->React.string}
          <Icons.ExternalLink />
        </a>
        {"."->React.string}
      </p>
      <p>
        {switch auth.github_token {
        | "" =>
          <button
            onClick={e => {
              ReactEvent.Mouse.preventDefault(e)
              NetlifyAuth.make(netlifyopts)->NetlifyAuth.authenticate(
                {"provider": #github, "scope": "gist"},
                (err, data) =>
                  switch (Js.Nullable.toOption(err), data) {
                  | (_, Some({token})) =>
                    if !cancelAllEffects.contents {
                      authDispatch(SetGitHubToken(token))
                    }
                  | (Some(err), _) => Js.Console.error(err)
                  | (None, None) => Js.Console.error("Something wrong happened.")
                  },
              )
            }}>
            {"Log in with GitHub"->React.string}
          </button>
        | _ =>
          <a href={"https://github.com/settings/connections/applications/" ++ github_app_id}>
            {"Change or remove your GitHub access "->React.string}
            <Icons.ExternalLink />
          </a>
        }}
      </p>
      {switch auth.github_token {
      | "" => React.null
      | github_token =>
        <div>
          <button
            onClick={_ => {
              Octokit.Gist.create(
                ~token=github_token,
                ~data=encodeOptions(exportData),
                ~minify=minify.state,
              )
              ->Promise.thenResolve((newGist: Octokit.response<_, _>) => {
                if !cancelAllEffects.contents {
                  authDispatch(SetGistId(newGist.data["id"]))
                  configDispatch(SetLastBackup(Js.Date.make()))
                }
                savedAlert()
              })
              ->Promise.then(() => loadGistList(auth))
              ->Promise.catch(e => {
                Webapi.Dom.Window.alert(
                  Webapi.Dom.window,
                  "Backup failed. Check your GitHub credentials.",
                )
                handleAuthError(e)
              })
              ->ignore
            }}>
            {"Create a new gist"->React.string}
          </button>
          <p className="caption-30"> {"Or select an existing gist."->React.string} </p>
          <select
            value={auth.github_gist_id}
            onBlur={e => {
              let id = ReactEvent.Focus.currentTarget(e)["value"]
              authDispatch(SetGistId(id))
            }}
            onChange={e => {
              let id = ReactEvent.Form.currentTarget(e)["value"]
              authDispatch(SetGistId(id))
            }}>
            <option value=""> {"No gist selected."->React.string} </option>
            {gists
            ->Array.map(({name, id, updated_at}) =>
              <option key=id value=id>
                {name->React.string}
                {" | updated "->React.string}
                {DateTimeFormat.format(dateFormatter, updated_at)->React.string}
              </option>
            )
            ->React.array}
          </select>
          <p>
            <button
              onClick={_ => {
                switch auth.github_gist_id {
                | "" => Js.Console.error("Gist ID is blank.")
                | id =>
                  Octokit.Gist.write(
                    ~id,
                    ~token=github_token,
                    ~data=encodeOptions(exportData),
                    ~minify=minify.state,
                  )
                  ->Promise.thenResolve(_ => {
                    if !cancelAllEffects.contents {
                      configDispatch(SetLastBackup(Js.Date.make()))
                    }
                    savedAlert()
                  })
                  ->Promise.then(() => loadGistList(auth))
                  ->Promise.catch(e => {
                    Webapi.Dom.Window.alert(
                      Webapi.Dom.window,
                      "Backup failed. Check your GitHub credentials or try a different gist.",
                    )
                    handleAuthError(e)
                  })
                  ->ignore
                }
              }}
              disabled={auth.github_gist_id == ""}>
              {"Backup to this gist"->React.string}
            </button>
            {" "->React.string}
            <button
              onClick={_ => {
                switch auth.github_gist_id {
                | "" => Js.Console.error("Gist ID is blank.")
                | id =>
                  Octokit.Gist.read(~id, ~token=github_token)
                  ->Promise.thenResolve(result => {
                    loadJson(result)
                  })
                  ->Promise.catch(e => {
                    invalidAlert()
                    handleAuthError(e)
                  })
                  ->ignore
                }
              }}
              disabled={auth.github_gist_id == ""}>
              {"Load from this gist"->React.string}
            </button>
          </p>
          <p className="caption-30">
            <label>
              <input
                type_="checkbox"
                checked=minify.state
                onChange={_ =>
                  switch minify.state {
                  | true => minify.setFalse()
                  | false => minify.setTrue()
                  }}
              />
              {" Minify output."->React.string}
            </label>
          </p>
        </div>
      }}
    </div>
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
    () => {config, players, tournaments},
    (config, tournaments, players),
  )
  let exportDataURI = exportData->encodeOptions->Js.Json.stringify->Js.Global.encodeURIComponent
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
    Webapi.Dom.Window.alert(Webapi.Dom.window, "Data loaded.")
  }

  let loadJson = json =>
    try {
      let {config, players, tournaments} = json->Js.Json.parseExn->decodeOptions
      loadData(~tournaments, ~players, ~config)
    } catch {
    | e =>
      Js.Console.error(e)
      invalidAlert()
    }

  let handleText = event => {
    ReactEvent.Form.preventDefault(event)
    loadJson(text)
  }

  let handleFile = event => {
    module FileReader = Externals.FileReader
    ReactEvent.Form.preventDefault(event)
    let reader = FileReader.make()

    let onload = ev => {
      ignore(ev)
      let data = ev["target"]["result"]
      try {
        let {config, players, tournaments} = data->Js.Json.parseExn->decodeOptions
        loadData(~tournaments, ~players, ~config)
      } catch {
      | e =>
        Js.Console.error(e)
        invalidAlert()
      }
    }
    FileReader.setOnLoad(reader, onload)
    FileReader.readAsText(
      reader,
      ReactEvent.Form.currentTarget(event)["files"]->Array.get(0)->Option.getWithDefault(""),
    )
    /* so the filename won't linger onscreen */
    /* https://github.com/BuckleScript/bucklescript/issues/4391 */
    // TODO remove file-scoped @warning("-20") and fix this locally
    ReactEvent.Form.currentTarget(event)["value"] = ""
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
      <h2> {React.string("Bye settings")} </h2>
      <form>
        <p className="caption-30">
          {React.string("Select the default score given to a player who takes a bye.")}
        </p>
        <div style={{display: "flex"}}>
          <label className="body-20" style={{marginRight: "16px"}}>
            {React.string("Full (")}
            <span className="monospace"> {React.string("1")} </span>
            {React.string(") ")}
            <input
              checked={switch config.byeValue {
              | Full => true
              | Half | Zero => false
              }}
              type_="radio"
              onChange={_ => configDispatch(SetByeValue(Full))}
            />
          </label>
          <label className="body-20" style={{marginRight: "16px"}}>
            {React.string("Half (")}
            <span className="monospace"> {React.string("½")} </span>
            {React.string(") ")}
            <input
              checked={switch config.byeValue {
              | Half => true
              | Full | Zero => false
              }}
              type_="radio"
              onChange={_ => configDispatch(SetByeValue(Half))}
            />
          </label>
          <label className="body-20">
            {React.string("None (")}
            <span className="monospace"> {React.string("0")} </span>
            {React.string(") ")}
            <input
              checked={switch config.byeValue {
              | Zero => true
              | Full | Half => false
              }}
              type_="radio"
              onChange={_ => configDispatch(SetByeValue(Zero))}
            />
          </label>
        </div>
      </form>
      <h2> {React.string("Player labels")} </h2>
      <form>
        <p className="caption-30"> {React.string("Use custom labels for opposing players.")} </p>
        <label className="body-20">
          {React.string("Player 1: ")}
          <input
            type_="text"
            placeholder={Config.aliasToStringWhite(Config.default)}
            value={switch Config.aliasToOption(config.whiteAlias) {
            | None => ""
            | Some(s) => s
            }}
            onChange={event => {
              configDispatch(SetWhiteAlias((event->ReactEvent.Form.target)["value"]))
            }}
          />
        </label>
        <label className="body-20">
          {React.string("Player 2: ")}
          <input
            type_="text"
            placeholder={Config.aliasToStringBlack(Config.default)}
            value={switch Config.aliasToOption(config.blackAlias) {
            | None => ""
            | Some(s) => s
            }}
            onChange={event => {
              configDispatch(SetBlackAlias((event->ReactEvent.Form.target)["value"]))
            }}
          />
        </label>
      </form>
      <h2> {React.string("Manage data")} </h2>
      <p className="caption-20">
        {React.string("Last export: ")}
        <LastBackupDate date=config.lastBackup />
      </p>
      <GistOpts configDispatch exportData loadJson />
      <h3> {"Backup locally"->React.string} </h3>
      <p>
        <a
          download={"coronate-" ++ (getDateForFile() ++ ".json")}
          href={"data:application/json," ++ exportDataURI}
          onClick={_ => configDispatch(SetLastBackup(Js.Date.make()))}>
          <Icons.Download />
          {React.string(" Export data to a file.")}
        </a>
      </p>
      <label htmlFor="file"> {React.string("Load data from a file:")} </label>
      <input id="file" name="file" type_="file" onChange=handleFile />
      <h2> {React.string("Danger zone")} </h2>
      <p className="caption-30"> {React.string("I hope you know what you're doing...")} </p>
      <button onClick=reloadDemoData>
        {React.string("Reset demo data (this erases everything else)")}
      </button>
      {React.string(" ")}
      {if node_env != "production" {
        <button onClick=loadTestData> {React.string("Load testing data")} </button>
      } else {
        React.null
      }}
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
        <p>
          <input type_="submit" value="Load" />
        </p>
      </form>
    </div>
  </Window.Body>
}
