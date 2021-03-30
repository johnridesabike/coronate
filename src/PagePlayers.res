open Belt
open Data
open Router
module Id = Data.Id

let sortName = Hooks.GetString((. x: Player.t) => x.firstName)
let sortRating = Hooks.GetInt((. x: Player.t) => x.rating)
let sortMatchCount = Hooks.GetInt((. x: Player.t) => x.matchCount)

module Form = %form(
  type input = {
    firstName: string,
    lastName: string,
    rating: string,
    matchCount: string,
  }
  type output = {
    firstName: string,
    lastName: string,
    rating: int,
    matchCount: int,
  }
  let validators = {
    firstName: {
      strategy: OnFirstSuccessOrFirstBlur,
      validate: ({firstName, _}) =>
        switch firstName {
        | "" => Error("First name is required")
        | name => Ok(name)
        },
    },
    lastName: {
      strategy: OnFirstSuccessOrFirstBlur,
      validate: ({lastName, _}) =>
        switch lastName {
        | "" => Error("Last name is required")
        | name => Ok(name)
        },
    },
    rating: {
      strategy: OnFirstSuccessOrFirstBlur,
      validate: ({rating, _}) =>
        switch Int.fromString(rating) {
        | None => Error("Rating must be a number")
        | Some(rating) => Ok(rating)
        },
    },
    matchCount: {
      strategy: OnFirstSuccessOrFirstBlur,
      validate: ({matchCount, _}) =>
        switch Int.fromString(matchCount) {
        | None => Error("Match count must be a number")
        | Some(rating) => Ok(rating)
        },
    },
  }
  let initialInput: input = {
    firstName: "",
    lastName: "",
    rating: "1200",
    matchCount: "0",
  }
)

let errorNotification = x =>
  switch x {
  | Some(Error(e)) => <Utils.Notification kind=Error> {e->React.string} </Utils.Notification>
  | Some(Ok(_))
  | None => React.null
  }

module NewPlayerForm = {
  @react.component
  let make = (~dispatch, ~addPlayerCallback=?) => {
    open Form
    let form = useForm(~initialInput, ~onSubmit=({firstName, lastName, rating, matchCount}, cb) => {
      let id = Data.Id.random()
      dispatch(
        Db.Set(
          id,
          {
            Player.firstName: firstName,
            lastName: lastName,
            rating: rating,
            id: id,
            type_: Person,
            matchCount: matchCount,
          },
        ),
      )
      switch addPlayerCallback {
      | None => ()
      | Some(fn) => fn(id)
      }
      cb.notifyOnSuccess(None)
      cb.reset()
    })

    <form
      onSubmit={event => {
        ReactEvent.Form.preventDefault(event)
        form.submit()
      }}>
      <fieldset>
        <legend> {React.string("Register a new player")} </legend>
        <p>
          <label htmlFor="firstName"> {React.string("First name")} </label>
          <input
            name="firstName"
            type_="text"
            onBlur={_ => form.blurFirstName()}
            value=form.input.firstName
            required=true
            onChange={event =>
              form.updateFirstName(
                (input, firstName) => {...input, firstName: firstName},
                (event->ReactEvent.Form.target)["value"],
              )}
          />
        </p>
        {errorNotification(form.firstNameResult)}
        <p>
          <label htmlFor="lastName"> {React.string("Last name")} </label>
          <input
            name="lastName"
            type_="text"
            value=form.input.lastName
            onBlur={_ => form.blurLastName()}
            required=true
            onChange={event =>
              form.updateLastName(
                (input, lastName) => {...input, lastName: lastName},
                (event->ReactEvent.Form.target)["value"],
              )}
          />
        </p>
        {errorNotification(form.lastNameResult)}
        <p>
          <label htmlFor="form-newplayer-rating"> {React.string("Rating")} </label>
          <input
            name="rating"
            id="form-newplayer-rating"
            type_="number"
            value=form.input.rating
            onBlur={_ => form.blurRating()}
            required=true
            onChange={event =>
              form.updateLastName(
                (input, rating) => {...input, rating: rating},
                (event->ReactEvent.Form.target)["value"],
              )}
          />
        </p>
        {errorNotification(form.ratingResult)}
        <p>
          <button disabled={form.submitting || !form.valid()}> {"Add"->React.string} </button>
        </p>
      </fieldset>
    </form>
  }
}

module PlayerList = {
  @react.component
  let make = (
    ~sorted,
    ~sortDispatch,
    ~players: Id.Map.t<Data.Player.t>,
    ~playersDispatch,
    ~configDispatch,
    ~windowDispatch=_ => (),
  ) => {
    let dialog = Hooks.useBool(false)
    React.useEffect1(() => {
      windowDispatch(Window.SetTitle("Players"))
      Some(() => windowDispatch(SetTitle("")))
    }, [windowDispatch])
    let delPlayer = (event, id) => {
      ReactEvent.Mouse.preventDefault(event)
      let playerOpt = Map.get(players, id)
      switch playerOpt {
      | None => ()
      | Some(player) =>
        let message = `Are you sure you want to delete ${Player.fullName(player)}?`
        if Webapi.Dom.Window.confirm(message, Webapi.Dom.window) {
          playersDispatch(Db.Del(id))
          configDispatch(Db.DelAvoidSingle(id))
        }
      }
    }
    <div className="content-area">
      <div className="toolbar toolbar__left">
        <button onClick={_ => dialog.setTrue()}>
          <Icons.UserPlus /> {React.string(" Add a new player")}
        </button>
      </div>
      <table style={ReactDOMRe.Style.make(~margin="auto", ())}>
        <caption> {React.string("Player roster")} </caption>
        <thead>
          <tr>
            <th>
              <Hooks.SortButton data=sorted dispatch=sortDispatch sortColumn=sortName>
                {React.string("Name")}
              </Hooks.SortButton>
            </th>
            <th>
              <Hooks.SortButton data=sorted dispatch=sortDispatch sortColumn=sortRating>
                {React.string("Rating")}
              </Hooks.SortButton>
            </th>
            <th>
              <Hooks.SortButton data=sorted dispatch=sortDispatch sortColumn=sortMatchCount>
                {React.string("Matches")}
              </Hooks.SortButton>
            </th>
            <th>
              <Externals.VisuallyHidden> {React.string("Controls")} </Externals.VisuallyHidden>
            </th>
          </tr>
        </thead>
        <tbody className="content">
          {Array.map(sorted.table, p =>
            <tr key={p.id->Data.Id.toString}>
              <td className="table__player">
                <HashLink to_=Player(p.id)> {p->Player.fullName->React.string} </HashLink>
              </td>
              <td className="table__number"> {p.rating->string_of_int->React.string} </td>
              <td className="table__number"> {p.matchCount->string_of_int->React.string} </td>
              <td>
                <button className="danger button-ghost" onClick={event => delPlayer(event, p.id)}>
                  <Icons.Trash />
                  <Externals.VisuallyHidden>
                    {React.string(`Delete ${Player.fullName(p)}`)}
                  </Externals.VisuallyHidden>
                </button>
              </td>
            </tr>
          )->React.array}
        </tbody>
      </table>
      <Externals.Dialog
        isOpen=dialog.state
        onDismiss={_ => dialog.setFalse()}
        ariaLabel="New player form"
        className="">
        <button className="button-micro" onClick={_ => dialog.setFalse()}>
          {React.string("Close")}
        </button>
        <NewPlayerForm dispatch=playersDispatch />
      </Externals.Dialog>
    </div>
  }
}

module Profile = {
  @react.component
  let make = (
    ~player: Player.t,
    ~players,
    ~playersDispatch,
    ~config: Data.Config.t,
    ~configDispatch,
    ~windowDispatch=_ => (),
  ) => {
    let {id: playerId, firstName, lastName, rating, matchCount: initialMatchCount, type_} = player
    open Form
    let form = useForm(
      ~initialInput={
        firstName: firstName,
        lastName: lastName,
        rating: Int.toString(rating),
        matchCount: Int.toString(initialMatchCount),
      },
      ~onSubmit=({firstName, lastName, rating, matchCount}, cb) => {
        playersDispatch(
          Db.Set(
            playerId,
            {
              Player.firstName: firstName,
              lastName: lastName,
              matchCount: matchCount,
              rating: rating,
              id: playerId,
              type_: type_,
            },
          ),
        )
        cb.notifyOnSuccess(None)
        cb.reset()
      },
    )
    let playerName = form.input.firstName ++ " " ++ form.input.lastName
    React.useEffect2(() => {
      windowDispatch(Window.SetTitle("Profile for " ++ playerName))
      Some(() => windowDispatch(SetTitle("")))
    }, (windowDispatch, playerName))
    let avoidMap = Id.Pair.Set.toMap(config.avoidPairs)
    let singAvoidList = Map.getWithDefault(avoidMap, playerId, Set.make(~id=Id.id))
    let unavoided =
      players
      ->Map.keysToArray
      ->Array.keep(id => !Set.has(singAvoidList, id) && !Id.eq(id, playerId))
    let (selectedAvoider, setSelectedAvoider) = React.useState(() => unavoided[0])
    let avoidAdd = event => {
      ReactEvent.Form.preventDefault(event)
      switch selectedAvoider {
      | None => ()
      | Some(selectedAvoider) =>
        switch Id.Pair.make(playerId, selectedAvoider) {
        | None => ()
        | Some(pair) =>
          configDispatch(Db.AddAvoidPair(pair))
          /* Reset the selected avoider to the first on the list, but check to
           make sure they weren't they weren't the first. */
          let newSelected = switch unavoided[0] {
          | Some(id) if !Id.eq(id, selectedAvoider) => Some(id)
          | _ => unavoided[1]
          }
          setSelectedAvoider(_ => newSelected)
        }
      }
    }
    let handleAvoidChange = event => {
      let id = ReactEvent.Form.currentTarget(event)["value"]
      setSelectedAvoider(_ => id)
    }
    let handleAvoidBlur = event => {
      let id = ReactEvent.Focus.currentTarget(event)["value"]
      setSelectedAvoider(_ => id)
    }
    <div className="content-area">
      <HashLink
        to_=PlayerList
        onClick={event =>
          if form.dirty() && !Webapi.Dom.Window.confirm("Discard changes?", Webapi.Dom.window) {
            ReactEvent.Mouse.preventDefault(event)
          }}>
        <Icons.ChevronLeft /> {React.string(" Back")}
      </HashLink>
      <h2> {React.string("Profile for " ++ playerName)} </h2>
      <form
        onSubmit={event => {
          ReactEvent.Form.preventDefault(event)
          form.submit()
        }}>
        <p>
          <label htmlFor="firstName"> {React.string("First name")} </label>
          <input
            value=form.input.firstName
            onBlur={_ => form.blurFirstName()}
            onChange={event =>
              form.updateFirstName(
                (input, firstName) => {...input, firstName: firstName},
                (event->ReactEvent.Form.target)["value"],
              )}
            name="firstName"
            type_="text"
          />
        </p>
        {errorNotification(form.firstNameResult)}
        <p>
          <label htmlFor="lastName"> {React.string("Last name")} </label>
          <input
            value=form.input.lastName
            onBlur={_ => form.blurLastName()}
            onChange={event =>
              form.updateLastName(
                (input, lastName) => {...input, lastName: lastName},
                (event->ReactEvent.Form.target)["value"],
              )}
            name="lastName"
            type_="text"
          />
        </p>
        {errorNotification(form.lastNameResult)}
        <p>
          <label htmlFor="matchCount"> {React.string("Matches played")} </label>
          <input
            value=form.input.matchCount
            onBlur={_ => form.blurMatchCount()}
            onChange={event =>
              form.updateMatchCount(
                (input, matchCount) => {...input, matchCount: matchCount},
                (event->ReactEvent.Form.target)["value"],
              )}
            name="matchCount"
            type_="number"
          />
        </p>
        {errorNotification(form.matchCountResult)}
        <p>
          <label htmlFor="rating"> {React.string("Rating")} </label>
          <input
            value=form.input.rating
            onBlur={_ => form.blurRating()}
            onChange={event =>
              form.updateRating(
                (input, rating) => {...input, rating: rating},
                (event->ReactEvent.Form.target)["value"],
              )}
            name="rating"
            type_="number"
          />
        </p>
        {errorNotification(form.ratingResult)}
        <p>
          <label htmlFor="Kfactor"> {React.string("K factor")} </label>
          <input
            name="kfactor"
            type_="number"
            disabled=true
            value={switch form.matchCountResult {
            | Some(Ok(matchCount)) => Ratings.EloRank.getKFactor(~matchCount)->Int.toString
            | Some(Error(_)) => ""
            | None => Ratings.EloRank.getKFactor(~matchCount=initialMatchCount)->Int.toString
            }}
            readOnly=true
          />
        </p>
        <p>
          <button disabled={form.submitting || !form.valid()}>
            {form.dirty() ? "Save"->React.string : "Saved"->React.string}
          </button>
        </p>
      </form>
      <h3> {React.string("Players to avoid")} </h3>
      {if Set.isEmpty(singAvoidList) {
        <p className="disabled"> {React.string("None")} </p>
      } else {
        <ul>
          {singAvoidList
          ->Set.toArray
          ->Array.map(pId => {
            let fullName = Player.getMaybe(players, pId)->Player.fullName
            <li key={pId->Data.Id.toString}>
              {fullName->React.string}
              <button
                ariaLabel={`Remove ${fullName} from avoid list.`}
                title={`Remove ${fullName} from avoid list.`}
                className="danger button-ghost"
                onClick={_ =>
                  switch Id.Pair.make(playerId, pId) {
                  | None => ()
                  | Some(pair) => configDispatch(DelAvoidPair(pair))
                  }}>
                <Icons.Trash />
              </button>
            </li>
          })
          ->React.array}
        </ul>
      }}
      <form onSubmit=avoidAdd>
        <label htmlFor="avoid-select"> {React.string("Select a new player to avoid.")} </label>
        {switch selectedAvoider {
        | Some(selectedAvoider) => <>
            <select
              id="avoid-select"
              onBlur=handleAvoidBlur
              onChange=handleAvoidChange
              value={selectedAvoider->Data.Id.toString}>
              {unavoided
              ->Array.map(pId =>
                <option key={pId->Data.Id.toString} value={pId->Data.Id.toString}>
                  {players->Player.getMaybe(pId)->Player.fullName->React.string}
                </option>
              )
              ->React.array}
            </select>
            {React.string(" ")}
            <input className="button-micro" type_="submit" value="Add" />
          </>
        | None => React.string("No players are available to avoid.")
        }}
      </form>
    </div>
  }
}

@react.component
let make = (~id=?, ~windowDispatch) => {
  let {items: players, dispatch: playersDispatch, _} = Db.useAllPlayers()
  let (sorted, sortDispatch) = Hooks.useSortedTable(
    ~table=Map.valuesToArray(players),
    ~column=sortName,
    ~isDescending=false,
  )
  React.useEffect2(() => {
    sortDispatch(SetTable(Map.valuesToArray(players)))
    None
  }, (players, sortDispatch))
  let (config, configDispatch) = Db.useConfig()
  <Window.Body windowDispatch>
    {switch id {
    | None =>
      <PlayerList sorted sortDispatch players playersDispatch configDispatch windowDispatch />
    | Some(id) =>
      switch Map.get(players, id) {
      | None => <div> {React.string("Loading...")} </div>
      | Some(player) =>
        <Profile player players playersDispatch config configDispatch windowDispatch />
      }
    }}
  </Window.Body>
}
