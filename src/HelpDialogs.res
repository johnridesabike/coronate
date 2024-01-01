/*
  Copyright (c) 2022 John Jackson.

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

module BaseDialog = {
  @react.component
  let make = (~state as {Hooks.state: state, setFalse, _}, ~ariaLabel, ~children) =>
    <Externals.Dialog isOpen=state onDismiss=setFalse ariaLabel className="">
      <button className="button-micro" onClick={_ => setFalse()}> {React.string("Done")} </button>
      children
    </Externals.Dialog>
}

module Pairing = {
  @react.component
  let make = (~state, ~config, ~ariaLabel) =>
    <BaseDialog state ariaLabel>
      <p>
        {`A Swiss-system tournament is effective when you carefully pair players according to
          certain priorities. Calculating the ideal pairings by hand can be complicated, so that's
          where auto-pair comes in.`->React.string}
      </p>
      <p> {`These are the pairing rules:`->React.string} </p>
      <ol>
        <li>
          {`Two players should not play each other more than once per tournament.`->React.string}
        </li>
        <li> {`Players with the same score should be paired.`->React.string} </li>
        <li>
          {`Players in the top "half" of ratings should be paired with players in the bottom "half"
            of ratings. (This gives the chance for an upset!)`->React.string}
        </li>
        <li>
          {`Players should each alternate playing `->React.string}
          {Data.Config.aliasToStringWhite(config)->React.string}
          {` and `->React.string}
          {Data.Config.aliasToStringBlack(config)->React.string}
          {` pieces. To facilitate this, each
            player should be paired with someone who is due the opposite color that they are due.`->React.string}
        </li>
      </ol>
      <p>
        {`Rule number one is the most important rule, and rule number two is a close second. Without
          them, the whole Swiss system loses its effectiveness.`->React.string}
      </p>
      <p>
        {`Rules three and four are valuable because they keep the games fair and interesting, but
          they are less important.`->React.string}
      </p>
      <p>
        {`You will never be able to perfectly follow all of these rules for every pairing in every
          round. Auto-pair does its best to follow as many as it can, starting with the most
          important.`->React.string}
      </p>
      <p>
        {`Auto-pair calculates an "ideal" for every possible match based on these rules, and then
          finds the combination of pairings that has the highest average ideal for the whole round.
          This means that sometimes it will not use one obvious pairing if it can use another
          combination of pairings that is overall more ideal.`->React.string}
      </p>
      <p>
        {`When you manually pair a player, the auto-pair "ideal" score for each other player will
          display as a percentage. Think of this as a strong suggestion.`->React.string}
      </p>
    </BaseDialog>
}

module SwissTournament = {
  @react.component
  let make = (~state, ~ariaLabel) =>
    <BaseDialog state ariaLabel>
      <p>
        {`Coronate uses `->React.string}
        <a href="https://en.wikipedia.org/wiki/Swiss-system_tournament">
          {`Swiss-system tournaments `->React.string}
          <Icons.ExternalLink />
        </a>
        {`. It sets a fixed number of rounds that will be smaller than the number of players. It
          pairs players according to their scores, but without any two players meeting twice.`->React.string}
      </p>
      <p>
        {`A Swiss tournament produces a single first-place winner but many ties for second, third,
          and so on. (If games are drawn, there may be ties for first as well.) It uses several
          tie-breaking strategies to determine the final standings.`->React.string}
      </p>
      <p>
        {`To calculate how many rounds your tournament will require for a certain number of players,
          you can refer to the `->React.string}
        <Router.Link to_=TimeCalculator>
          {Pages.TimeCalculator.title->React.string}
          {` page`->React.string}
        </Router.Link>
        {`.`->React.string}
      </p>
    </BaseDialog>
}

module TieBreaks = {
  let s = x => Data.Scoring.TieBreak.toPrettyString(x)->React.string

  @react.component
  let make = (~state, ~ariaLabel) =>
    <BaseDialog state ariaLabel>
      <p>
        {`A Swiss-system tournament will always produce ties. These are tie-breaking strategies
          adopted from the USCF rulebook. You may disable or adjust their priorities for each
          tournament.`->React.string}
      </p>
      <dl>
        <dt className="title-20"> {s(Median)} </dt>
        <dd>
          {`Sum all of each player's opponents' scores, discarding the highest and lowest.`->React.string}
        </dd>
        <dt className="title-20"> {s(Solkoff)} </dt>
        <dd>
          {`The same as modified median, except without discarding any scores.`->React.string}
        </dd>
        <dt className="title-20"> {s(Cumulative)} </dt>
        <dd>
          {`Sum each player's cumulative, or "running," score for each round. This favors players
            who scored earlier. (Presumably, they faced harder opponents later.)`->React.string}
        </dd>
        <dt className="title-20"> {s(CumulativeOfOpposition)} </dt>
        <dd> {`Sum the cumulative of each player's opponents' scores.`->React.string} </dd>
        <dt className="title-20"> {s(MostBlack)} </dt>
        <dd> {`Count the matches where each player used black pieces.`->React.string} </dd>
      </dl>
    </BaseDialog>
}
