/*
  Copyright (c) 2022 John Jackson.

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
open Vitest
open ReactTestingLibrary

test("Deleted players do not crash the bye queue.", t => {
  let page = () =>
    render(
      <LoadTournament tourneyId=TestData.deletedPlayerTourney.id windowDispatch=None>
        {tournament => <PageTourneyPlayers tournament />}
      </LoadTournament>,
    )
  t->expect(page)->Expect.not->Expect.toThrow
})
