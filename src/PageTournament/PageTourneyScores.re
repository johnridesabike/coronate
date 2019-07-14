module ScoreTable = {
  [@react.component]
  let make =
      (
        ~isCompact=false,
        ~tourney: Data.Tournament.t,
        ~getPlayer: string => Data.Player.t,
        ~title,
      ) => {
    let tieBreaks = tourney.tieBreaks;
    let roundList = tourney.roundList;
    let tieBreakNames = Scoring.getTieBreakNames(tieBreaks);
    let standingTree =
      Data.rounds2Matches(~roundList, ())
      |> Converters.matches2ScoreData
      |> Scoring.createStandingList(tieBreaks)
      |> Js.Array.filter((standing: Scoring.standing) =>
           standing.id !== Data.dummy_id
         )
      |> Scoring.createStandingTree;
    <table
      className={Cn.make([
        "scores__table",
        "scores__compact"->Cn.ifTrue(isCompact),
      ])}>
      <caption
        className={Cn.make([
          "title-30"->Cn.ifTrue(isCompact),
          "title-40"->Cn.ifTrue(!isCompact),
        ])}>
        {title |> React.string}
      </caption>
      <thead>
        <tr className="scores__topHeader">
          <th className="title-10" scope="col"> {"Rank" |> React.string} </th>
          <th className="title-10" scope="col"> {"Name" |> React.string} </th>
          <th className="title-10" scope="col"> {"Score" |> React.string} </th>
          {isCompact
             ? React.null
             : tieBreakNames
               |> Js.Array.mapi((name, i) =>
                    <th
                      key={i |> string_of_int}
                      className="title-10"
                      scope="col">
                      {name |> React.string}
                    </th>
                  )
               |> React.array}
        </tr>
      </thead>
      <tbody>
        {standingTree
         |> Js.Array.mapi((standingsFlat, rank) =>
              standingsFlat
              |> Js.Array.mapi((standing: Scoring.standing, i) =>
                   <tr key={standing.id} className="scores__row">
                     {i === 0
                        // Only display the rank once
                        ? <th
                            className="table__number scores__rank"
                            rowSpan={standingsFlat |> Js.Array.length}
                            scope="row">
                            {rank + 1 |> string_of_int |> React.string}
                          </th>
                        : React.null}
                     /* use <td> if it's compact.*/
                     {isCompact
                        ? <td className="scores__playerName">
                            {getPlayer(standing.id).firstName |> React.string}
                            {Utils.Entities.nbsp |> React.string}
                            {getPlayer(standing.id).lastName |> React.string}
                          </td>  /* Use the name as a header if not compact. */
                        : <th
                            className="scores__playerName"
                            /*dataTestid={rank |>string_of_int}*/
                            scope="row">
                            {getPlayer(standing.id).firstName |> React.string}
                            {Utils.Entities.nbsp |> React.string}
                            {getPlayer(standing.id).lastName |> React.string}
                          </th>}
                     <td className="table__number">
                       /*dataTestid={dashify(
                           getPlayer(standing.id).firstName
                           + getPlayer(standing.id).lastName
                           + " score",
                         )}*/

                         {Externals.Numeral.(
                            standing.score->numeral->format("1/2")
                          )
                          |> React.string}
                       </td>
                     {isCompact
                        ? React.null
                        : standing.tieBreaks
                          |> Js.Array.mapi((score, j) =>
                               <td
                                 key={j |> string_of_int}
                                 className="table__number">
                                 /*dataTestid={dashify(
                                     getPlayer(standing.id).firstName
                                     + getPlayer(standing.id).lastName
                                     + tieBreakNames[j],
                                   )}*/

                                   {Externals.Numeral.(
                                      score->numeral->format("1/2")
                                    )
                                    |> React.string}
                                 </td>
                             )
                          |> React.array}
                   </tr>
                 )
              |> React.array
            )
         |> React.array}
      </tbody>
    </table>;
  };
};

module SelectTieBreaks = {
  [@react.component]
  let make = (~tourney: Data.Tournament.t, ~tourneyDispatch) => {
    let tieBreaks = tourney.tieBreaks;
    let (selectedTb, setSelectedTb) = React.useState(() => None);
    let defaultId = x =>
      switch (x) {
      | Some(x) => x
      | None =>
        switch (selectedTb) {
        | Some(x) => x
        | None => 1 /* This should never happen.*/
        }
      };

    let toggleTb = id =>
      if (tieBreaks |> Js.Array.includes(defaultId(id))) {
        tourneyDispatch(TournamentDataReducers.DelTieBreak(defaultId(id)));
        setSelectedTb(_ => None);
      } else {
        tourneyDispatch(TournamentDataReducers.AddTieBreak(defaultId(id)));
      };

    let moveTb = direction => {
      switch (selectedTb) {
      | None => ()
      | Some(selectedTb) =>
        let index = tieBreaks |> Js.Array.indexOf(selectedTb);
        tourneyDispatch(MoveTieBreak(index, index + direction));
      };
    };

    <Utils.PanelContainer className="content-area">
      <Utils.Panel>
        <div className="toolbar">
          <button
            className="button-micro"
            disabled={selectedTb === None}
            onClick={_ => toggleTb(None)}>
            {"Toggle" |> React.string}
          </button>
          <button
            className="button-micro"
            disabled={selectedTb === None}
            onClick={_ => moveTb(-1)}>
            <Icons.arrowUp />
            {" Move up" |> React.string}
          </button>
          <button
            className="button-micro"
            disabled={selectedTb === None}
            onClick={_ => moveTb(1)}>
            <Icons.arrowDown />
            {" Move down" |> React.string}
          </button>
          <button
            className={Cn.make([
              "button-micro",
              "button-primary"->Cn.ifSome(selectedTb),
            ])}
            disabled={selectedTb === None}
            onClick={_ => setSelectedTb(_ => None)}>
            {"Done" |> React.string}
          </button>
        </div>
        <table>
          <caption className="title-30">
            {"Selected tiebreak methods" |> React.string}
          </caption>
          <thead>
            <tr>
              <th> {"Name" |> React.string} </th>
              <th>
                <Utils.VisuallyHidden>
                  {"Controls" |> React.string}
                </Utils.VisuallyHidden>
              </th>
            </tr>
          </thead>
          <tbody className="content">
            {tieBreaks
             |> Js.Array.map(id =>
                  <tr
                    key={id |> string_of_int}
                    className={Cn.make([
                      "selected"->Cn.ifTrue(selectedTb === Some(id)),
                    ])}>
                    <td>
                      {Scoring.tieBreakMethods[id].name |> React.string}
                    </td>
                    <td style={ReactDOMRe.Style.make(~width="48px", ())}>
                      <button
                        className="button-micro"
                        disabled={
                          selectedTb !== None && selectedTb !== Some(id)
                        }
                        onClick={_ =>
                          switch (selectedTb) {
                          | None => setSelectedTb(_ => Some(id))
                          | Some(selectedTb) =>
                            selectedTb === id
                              ? setSelectedTb(_ => None)
                              : setSelectedTb(_ => Some(id))
                          }
                        }>
                        {(
                           switch (selectedTb) {
                           | None => "Edit"
                           | Some(selectedTb) =>
                             selectedTb === id ? "Done" : "Edit"
                           }
                         )
                         |> React.string}
                      </button>
                    </td>
                  </tr>
                )
             |> React.array}
          </tbody>
        </table>
      </Utils.Panel>
      <Utils.Panel>
        <div className="toolbar"> {Utils.Entities.nbsp |> React.string} </div>
        <table style={ReactDOMRe.Style.make(~marginTop="16px", ())}>
          <caption className="title-30">
            {"Available tiebreak methods" |> React.string}
          </caption>
          <thead>
            <tr>
              <th> {"Name" |> React.string} </th>
              <th>
                <Utils.VisuallyHidden>
                  {"Controls" |> React.string}
                </Utils.VisuallyHidden>
              </th>
            </tr>
          </thead>
          <tbody className="content">
            {Scoring.tieBreakMethods
             |> Js.Array.map((m: Scoring.tieBreakData) =>
                  <tr key={m.id |> string_of_int}>
                    <td>
                      <span
                        className={
                          tieBreaks |> Js.Array.includes(m.id)
                            ? "disabled" : "enabled"
                        }>
                        {m.name |> React.string}
                      </span>
                    </td>
                    <td>
                      {tieBreaks |> Js.Array.includes(m.id)
                         ? React.null
                         : <button
                             className="button-micro"
                             onClick={_ => toggleTb(Some(m.id))}>
                             {"Add" |> React.string}
                           </button>}
                    </td>
                  </tr>
                )
             |> React.array}
          </tbody>
        </table>
      </Utils.Panel>
    </Utils.PanelContainer>;
  };
};

[@react.component]
let make = (~tournament: TournamentData.t) => {
  let getPlayer = tournament.getPlayer;
  let tourney = tournament.tourney;
  let tourneyDispatch = tournament.tourneyDispatch;
  Utils.Tabs.(
    <Tabs>
      <TabList>
        <Tab> <Icons.list /> {" Scores" |> React.string} </Tab>
        <Tab>
          <Icons.settings />
          {" Edit tiebreak rules" |> React.string}
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <ScoreTable tourney getPlayer title="Score detail" />
        </TabPanel>
        <TabPanel> <SelectTieBreaks tourney tourneyDispatch /> </TabPanel>
      </TabPanels>
    </Tabs>
  );
};