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
  let make = (~dispatch) => {
    let (firstName, setFirstName) = React.useState(defaultFirstName);
    let (lastName, setLastName) = React.useState(defaultLastName);
    let (rating, setRating) = React.useState(defaultRating);
    let handleSubmit = event => {
      event->ReactEvent.Form.preventDefault;
      setFirstName(defaultFirstName);
      setLastName(defaultLastName);
      setRating(defaultRating);
      let id = Utils.nanoid();
      dispatch(
        Db.SetItem(
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
          [|
            "Are you sure you want to delete ",
            player.firstName,
            " ",
            player.lastName,
            "?",
          |]
          |> Js.Array.joinWith("");
        if (Utils.confirm(message)) {
          playersDispatch(Db.DelItem(id));
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
                      {[|p.firstName, p.lastName|]
                       |> Js.Array.joinWith(" ")
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
                        {[|"Delete", p.firstName, p.lastName|]
                         |> Js.Array.joinWith(" ")
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
        isOpen=isDialogOpen onDismiss={_ => setIsDialogOpen(_ => false)}>
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
      [|player.firstName, player.lastName|] |> Js.Array.joinWith(" ");
    let (_, windowDispatch) = Window.useWindowContext();
    React.useEffect2(
      () => {
        windowDispatch(Window.SetTitle("Profile for " ++ playerName));
        Some(() => windowDispatch(Window.SetTitle("")));
      },
      (windowDispatch, playerName),
    );
    let avoidMap =
      config.avoidPairs
      ->Set.reduce(Map.String.empty, Data.AvoidPairs.reduceToMap);
    let singAvoidList =
      switch (avoidMap->Map.String.get(playerId)) {
      | None => []
      | Some(x) => x
      };
    let unavoided =
      players
      |> Map.String.keysToArray
      |> Js.Array.filter(id =>
           !singAvoidList->List.has(id, (===)) && id !== playerId
         );

    let (selectedAvoider, setSelectedAvoider) =
      React.useState(() => unavoided->Array.getExn(0));
    let avoidAdd = event => {
      event->ReactEvent.Form.preventDefault;
      configDispatch(Db.AddAvoidPair((playerId, selectedAvoider)));
      /* Reset the selected avoider to the first on the list, but check to
         make sure they weren't they weren't the first. */
      let newSelected =
        unavoided->Array.getExn(0) !== selectedAvoider
          ? unavoided->Array.getExn(0) : unavoided->Array.getExn(1);
      setSelectedAvoider(_ => newSelected);
    };
    let handleChange = event => {
      event->ReactEvent.Form.preventDefault;
      let target = event->ReactEvent.Form.currentTarget;
      let firstName = target##firstName##value;
      let lastName = target##lastName##value;
      let matchCount = target##matchCount##value->int_of_string;
      let rating = target##rating##value->int_of_string;
      playersDispatch(
        Db.SetItem(
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
                 [|
                   "Remove",
                   players->getPlayerMaybe(pId).firstName,
                   players->getPlayerMaybe(pId).lastName,
                   "from avoid list.",
                 |]
                 |> Js.Array.joinWith(" ")
               }
               title={
                 [|
                   "Remove",
                   players->getPlayerMaybe(pId).firstName,
                   players->getPlayerMaybe(pId).lastName,
                   "from avoid list.",
                 |]
                 |> Js.Array.joinWith(" ")
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
        <select
          id="avoid-select"
          onBlur=handleAvoidBlur
          onChange=handleAvoidChange
          value=selectedAvoider>
          {unavoided
           |> Js.Array.map(pId =>
                <option key=pId value=pId>
                  {React.string(players->getPlayerMaybe(pId).firstName)}
                  {React.string(" ")}
                  {React.string(players->getPlayerMaybe(pId).lastName)}
                </option>
              )
           |> ReasonReact.array}
        </select>
        {React.string(" ")}
        <input className="button-micro" type_="submit" value="Add" />
      </form>
    </div>;
  };
};

[@react.component]
let make = (~id=?) => {
  let (players, playersDispatch) = Db.useAllPlayers();
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