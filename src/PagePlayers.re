open Belt;
open Data.Player;
open Utils.Router;
let sortName = Hooks.GetString(x => x.firstName);
let sortRating = Hooks.GetInt(x => x.rating);
let sortMatchCount = Hooks.GetInt(x => x.matchCount);

let defaultFirstName = _ => "";
let defaultLastName = _ => "";
let defaultRating = _ => 1200;

module NewPlayerForm = {
  [@react.component]
  let make = (~dispatch, ~addPlayerCallback=?) => {
    let (firstName, setFirstName) = React.useState(defaultFirstName);
    let (lastName, setLastName) = React.useState(defaultLastName);
    let (rating, setRating) = React.useState(defaultRating);
    let handleSubmit = event => {
      ReactEvent.Form.preventDefault(event);
      setFirstName(defaultFirstName);
      setLastName(defaultLastName);
      setRating(defaultRating);
      let id = Utils.nanoid();
      dispatch(
        Db.Set(
          id,
          {
            firstName,
            lastName,
            rating,
            id,
            type_: Type.Person,
            matchCount: 0,
          },
        ),
      );
      switch (addPlayerCallback) {
      | None => ()
      | Some(fn) => fn(id)
      };
    };

    let updateField = event => {
      event->ReactEvent.Form.preventDefault;
      let name = event->ReactEvent.Form.currentTarget##name;
      let value = event->ReactEvent.Form.currentTarget##value;
      switch (name) {
      | "firstName" => setFirstName(_ => value)
      | "lastName" => setLastName(_ => value)
      | "rating" => setRating(_ => int_of_string(value))
      | _ => ()
      };
    };

    <form onSubmit=handleSubmit>
      <fieldset>
        <legend> {React.string("Register a new player")} </legend>
        <p>
          <label htmlFor="firstName"> {React.string("First name")} </label>
          <input
            name="firstName"
            type_="text"
            value=firstName
            required=true
            onChange=updateField
          />
        </p>
        <p>
          <label htmlFor="lastName"> {React.string("Last name")} </label>
          <input
            name="lastName"
            type_="text"
            value=lastName
            required=true
            onChange=updateField
          />
        </p>
        <p>
          <label htmlFor="rating"> {React.string("Rating")} </label>
          <input
            name="rating"
            type_="number"
            value={rating->string_of_int}
            required=true
            onChange=updateField
          />
        </p>
        <p> <input type_="submit" value="Add" /> </p>
      </fieldset>
    </form>;
  };
};

module PlayerList = {
  [@react.component]
  let make =
      (~sorted, ~sortDispatch, ~players, ~playersDispatch, ~configDispatch) => {
    let (isDialogOpen, setIsDialogOpen) = React.useState(() => false);
    let (_, windowDispatch) = Window.useWindowContext();
    React.useEffect1(
      () => {
        windowDispatch(Window.SetTitle("Players"));
        Some(() => windowDispatch(Window.SetTitle("")));
      },
      [|windowDispatch|],
    );
    let delPlayer = (event, id) => {
      ReactEvent.Mouse.preventDefault(event);
      let playerOpt = players->Map.String.get(id);
      switch (playerOpt) {
      | None => ()
      | Some(player) =>
        let message =
          String.concat(
            "",
            [
              "Are you sure you want to delete ",
              player.firstName,
              " ",
              player.lastName,
              "?",
            ],
          );
        if (Webapi.(Dom.window |> Dom.Window.confirm(message))) {
          playersDispatch(Db.Del(id));
          configDispatch(Db.DelAvoidSingle(id));
        };
      };
    };
    <div className="content-area">
      <div className="toolbar toolbar__left">
        <button onClick={_ => setIsDialogOpen(_ => true)}>
          <Icons.UserPlus />
          {React.string(" Add a new player")}
        </button>
      </div>
      <table style={ReactDOMRe.Style.make(~margin="auto", ())}>
        <caption> {React.string("Player roster")} </caption>
        <thead>
          <tr>
            <th>
              <Hooks.SortButton
                data=sorted dispatch=sortDispatch sortColumn=sortName>
                {React.string("Name")}
              </Hooks.SortButton>
            </th>
            <th>
              <Hooks.SortButton
                data=sorted dispatch=sortDispatch sortColumn=sortRating>
                {React.string("Rating")}
              </Hooks.SortButton>
            </th>
            <th>
              <Hooks.SortButton
                data=sorted dispatch=sortDispatch sortColumn=sortMatchCount>
                {React.string("Matches")}
              </Hooks.SortButton>
            </th>
            <th>
              <Utils.VisuallyHidden>
                {React.string("Controls")}
              </Utils.VisuallyHidden>
            </th>
          </tr>
        </thead>
        <tbody className="content">
          {sorted.table
           |> Js.Array.map(p =>
                <tr key={p.id} className="buttons-on-hover">
                  <td className="table__player">
                    <HashLink to_={"/players/" ++ p.id}>
                      {[p.firstName, p.lastName]
                       |> String.concat(" ")
                       |> React.string}
                    </HashLink>
                  </td>
                  <td className="table__number">
                    {p.rating->string_of_int->React.string}
                  </td>
                  <td className="table__number">
                    {p.matchCount->string_of_int->React.string}
                  </td>
                  <td>
                    <button
                      className="danger button-ghost"
                      onClick={event => delPlayer(event, p.id)}>
                      <Icons.Trash />
                      <Utils.VisuallyHidden>
                        {["Delete", p.firstName, p.lastName]
                         |> String.concat(" ")
                         |> React.string}
                      </Utils.VisuallyHidden>
                    </button>
                  </td>
                </tr>
              )
           |> ReasonReact.array}
        </tbody>
      </table>
      <Utils.Dialog
        isOpen=isDialogOpen onDismiss={_ => setIsDialogOpen(_ => false)}
        ariaLabel="New player form">
        <button
          className="button-micro" onClick={_ => setIsDialogOpen(_ => false)}>
          {React.string("Close")}
        </button>
        <NewPlayerForm dispatch=playersDispatch />
      </Utils.Dialog>
    </div>;
  };
};

module Profile = {
  [@react.component]
  let make =
      (
        ~player,
        ~players,
        ~playersDispatch,
        ~config: Data.Config.t,
        ~configDispatch,
      ) => {
    let playerId = player.id;
    let playerName =
      [player.firstName, player.lastName] |> String.concat(" ");
    let (_, windowDispatch) = Window.useWindowContext();
    React.useEffect2(
      () => {
        windowDispatch(Window.SetTitle("Profile for " ++ playerName));
        Some(() => windowDispatch(Window.SetTitle("")));
      },
      (windowDispatch, playerName),
    );
    let avoidMap = Data.Config.AvoidPairs.toMap(config.avoidPairs);
    let singAvoidList =
      switch (avoidMap->Map.String.get(playerId)) {
      | None => []
      | Some(x) => x
      };
    let unavoided =
      players
      ->Map.String.keysToArray
      ->List.fromArray
      ->List.keep(id =>
          !singAvoidList->List.has(id, (===)) && id !== playerId
        );
    let (selectedAvoider, setSelectedAvoider) =
      React.useState(() =>
        switch (unavoided) {
        | [id, ..._] => Some(id)
        | [] => None
        }
      );
    let avoidAdd = event => {
      event->ReactEvent.Form.preventDefault;
      switch (selectedAvoider) {
      | None => ()
      | Some(selectedAvoider) =>
        configDispatch(Db.AddAvoidPair((playerId, selectedAvoider)));
        /* Reset the selected avoider to the first on the list, but check to
           make sure they weren't they weren't the first. */
        let newSelected =
          switch (unavoided) {
          | [id, ..._] when id !== selectedAvoider => Some(id)
          | [_, id, ..._] => Some(id)
          | [_]
          | [] => None
          };
        setSelectedAvoider(_ => newSelected);
      };
    };
    let handleChange = event => {
      event->ReactEvent.Form.preventDefault;
      let target = event->ReactEvent.Form.currentTarget;
      let firstName = target##firstName##value;
      let lastName = target##lastName##value;
      let matchCount = target##matchCount##value->int_of_string;
      let rating = target##rating##value->int_of_string;
      playersDispatch(
        Db.Set(
          playerId,
          {
            firstName,
            lastName,
            matchCount,
            rating,
            id: playerId,
            type_: player.type_,
          },
        ),
      );
    };
    let handleAvoidChange = event => {
      let id = event->ReactEvent.Form.currentTarget##value;
      setSelectedAvoider(_ => id);
    };
    let handleAvoidBlur = event => {
      let id = event->ReactEvent.Focus.currentTarget##value;
      setSelectedAvoider(_ => id);
    };
    <div
      className="content-area"
      style={ReactDOMRe.Style.make(~width="650px", ~margin="auto", ())}>
      <HashLink to_="/players">
        <Icons.ChevronLeft />
        {React.string(" Back")}
      </HashLink>
      <h2> {React.string("Profile for " ++ playerName)} </h2>
      <form onChange=handleChange onSubmit=handleChange>
        <p>
          <label htmlFor="firstName"> {React.string("First name")} </label>
          <input
            defaultValue={player.firstName}
            name="firstName"
            type_="text"
          />
        </p>
        <p>
          <label htmlFor="lastName"> {React.string("Last name")} </label>
          <input defaultValue={player.lastName} name="lastName" type_="text" />
        </p>
        <p>
          <label htmlFor="matchCount">
            {React.string("Matches played")}
          </label>
          <input
            defaultValue={player.matchCount->string_of_int}
            name="matchCount"
            type_="number"
          />
        </p>
        <p>
          <label htmlFor="rating"> {React.string("Rating")} </label>
          <input
            defaultValue={player.rating->string_of_int}
            name="rating"
            type_="number"
          />
        </p>
        <p>
          <label htmlFor="Kfactor"> {React.string("K factor")} </label>
          <input
            name="kfactor"
            type_="number"
            disabled=true
            value={
              player.matchCount->Scoring.Ratings.getKFactor->string_of_int
            }
            readOnly=true
          />
        </p>
      </form>
      <h3> {React.string("Players to avoid")} </h3>
      <ul>
        {singAvoidList->Utils.List.toReactArray(pId =>
           <li key=pId>
             {React.string(players->getPlayerMaybe(pId).firstName)}
             {React.string(" ")}
             {React.string(players->getPlayerMaybe(pId).lastName)}
             <button
               ariaLabel={
                 [
                   "Remove",
                   players->getPlayerMaybe(pId).firstName,
                   players->getPlayerMaybe(pId).lastName,
                   "from avoid list.",
                 ]
                 |> String.concat(" ")
               }
               title={
                 [
                   "Remove",
                   players->getPlayerMaybe(pId).firstName,
                   players->getPlayerMaybe(pId).lastName,
                   "from avoid list.",
                 ]
                 |> String.concat(" ")
               }
               className="danger button-ghost"
               onClick={_ =>
                 configDispatch(Db.DelAvoidPair((playerId, pId)))
               }>
               <Icons.Trash />
             </button>
           </li>
         )}
        {switch (singAvoidList) {
         | [] => <li> {React.string("None")} </li>
         | _ => React.null
         }}
      </ul>
      <form onSubmit=avoidAdd>
        <label htmlFor="avoid-select">
          {React.string("Select a new player to avoid.")}
        </label>
        {switch (selectedAvoider) {
         | Some(selectedAvoider) =>
           <>
             <select
               id="avoid-select"
               onBlur=handleAvoidBlur
               onChange=handleAvoidChange
               value=selectedAvoider>
               {unavoided->Utils.List.toReactArray(pId =>
                  <option key=pId value=pId>
                    {React.string(players->getPlayerMaybe(pId).firstName)}
                    {React.string(" ")}
                    {React.string(players->getPlayerMaybe(pId).lastName)}
                  </option>
                )}
             </select>
             {React.string(" ")}
             <input className="button-micro" type_="submit" value="Add" />
           </>
         | None => React.string("No players are available to avoid.")
         }}
      </form>
    </div>;
  };
};

[@react.component]
let make = (~id=?) => {
  let (players, playersDispatch, _) = Db.useAllPlayers();
  let (sorted, sortDispatch) =
    Hooks.useSortedTable(
      ~table=players->Map.String.valuesToArray,
      ~column=sortName,
      ~isDescending=false,
    );
  React.useEffect2(
    () => {
      sortDispatch(Hooks.SetTable(players->Map.String.valuesToArray));
      None;
    },
    (players, sortDispatch),
  );
  let (config, configDispatch) = Db.useConfig();
  <Window.Body>
    {switch (id) {
     | None =>
       <PlayerList
         sorted
         sortDispatch
         players
         playersDispatch
         configDispatch
       />
     | Some([id]) =>
       switch (players->Map.String.get(id)) {
       | None => <div> {React.string("Loading...")} </div>
       | Some(player) =>
         <Profile player players playersDispatch config configDispatch />
       }
     | _ => <Pages.NotFound />
     }}
  </Window.Body>;
};