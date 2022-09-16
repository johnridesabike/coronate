/*
  Copyright (c) 2022 John Jackson.

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
open Jest
open ReactTestingLibrary

test("Deleted players do not crash the bye queue.", () => {
  let page = () =>
    render(
      <LoadTournament tourneyId=TestData.deletedPlayerTourney.id>
        {tournament => <PageTourneyPlayers tournament />}
      </LoadTournament>,
    )
  page->expect->not_->toThrow
})
