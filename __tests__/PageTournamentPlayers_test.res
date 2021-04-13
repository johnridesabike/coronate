open Jest
open ReactTestingLibrary
//open FireEvent;

test("Deleted players do not crash the bye queue.", () => {
  let page = () =>
    render(
      <LoadTournament tourneyId=TestData.deletedPlayerTourney.id>
        {tournament => <PageTourneyPlayers tournament />}
      </LoadTournament>,
    )
  page |> Expect.expect |> Expect.not_ |> Expect.toThrow
})
