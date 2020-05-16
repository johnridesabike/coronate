open Belt;
open Jest;
open JestDom;
open Data.Converters;

let tournaments = TestData.tournaments->Data.Id.Map.fromStringArray;
let players = TestData.players->Data.Id.Map.fromStringArray;

let loadPairData = tourneyId => {
  let tournament = Map.getExn(tournaments, tourneyId);
  let {Data.Tournament.playerIds, roundList, _} = tournament;
  let players =
    Map.reduce(players, Data.Id.Map.make(), (acc, key, player) =>
      if (List.has(playerIds, key, (===))) {
        Map.set(acc, key, player);
      } else {
        acc;
      }
    );
  Data.Rounds.rounds2Matches(roundList, ())
  ->matches2ScoreData
  ->createPairingData(players, TestData.config.Data.Config.avoidPairs)
  ->Data.Pairing.setUpperHalves;
};

test("Players have 0 priority of pairing themselves.", () => {
  // This doesn't technically mean they won't be paired... but let's be
  // realistic. Something nutty must happen for 0 priority pairings to get
  // picked.
  let pairData = loadPairData(TestData.byeRoundTourney);
  let newb = Map.getExn(pairData, TestData.newbieMcNewberson);
  let ideal = Data.Pairing.calcPairIdeal(newb, newb);
  Expect.expect(ideal) |> Expect.toBe(0.0);
});

describe("The lowest-ranking player is automatically picked for byes.", () => {
  let dataPreBye = loadPairData(TestData.byeRoundTourney);
  let (pairData, byedPlayer) =
    Data.Pairing.setByePlayer([||], Data.Id.dummy, dataPreBye);
  test("The lowest-ranking player is removed after bye selection.", () =>
    pairData
    |> Map.keysToArray
    |> Expect.expect
    |> Expect.not
    |> Expect.toContain(TestData.newbieMcNewberson)
  );
  test("The lowest-ranking player is returned", () =>
    switch (byedPlayer) {
    | None => assert(false)
    | Some(player) =>
      Expect.expect(player.Data.Pairing.id)
      |> Expect.toBe(TestData.newbieMcNewberson)
    }
  );
});

test("The bye signup queue works", () => {
  let dataPreBye = loadPairData(TestData.byeRoundTourney2);
  let byeQueue = [|TestData.newbieMcNewberson, TestData.joelRobinson|];
  // Newbie McNewberson already played the first bye round
  let (_, byedPlayer) =
    Data.Pairing.setByePlayer(byeQueue, Data.Id.dummy, dataPreBye);
  switch (byedPlayer) {
  | None => assert(false)
  | Some(player) =>
    Expect.expect(player.Data.Pairing.id)
    |> Expect.toBe(TestData.joelRobinson)
  };
});
test(
  "If all player have (impossibly) played a bye round, the lowest-rated player is picked",
  () => {
    let dataPreBye = loadPairData(TestData.byeRoundTourney3);
    let (_, byedPlayer) =
      Data.Pairing.setByePlayer([||], Data.Id.dummy, dataPreBye);
    switch (byedPlayer) {
    | None => assert(false)
    | Some(player) =>
      Expect.expect(player.Data.Pairing.id)
      |> Expect.toBe(TestData.newbieMcNewberson)
    };
  },
);
test("Players are paired correctly in a simple scenario.", () => {
  let pairData = loadPairData(TestData.simplePairing);
  let matches = Data.Pairing.pairPlayers(pairData);
  Expect.expect(matches)
  |> ExpectJs.toEqual([
       (TestData.grandyMcMaster, TestData.gypsy),
       (TestData.drClaytonForrester, TestData.newbieMcNewberson),
       (TestData.joelRobinson, TestData.crowTRobot),
       (TestData.tomServo, TestData.tvsFrank),
     ]);
});
test("Players are paired correctly after a draw.", () => {
  let pairData = loadPairData(TestData.pairingWithDraws);
  let matches = Data.Pairing.pairPlayers(pairData);
  Expect.expect(matches)
  |> Expect.toEqual([
       (TestData.grandyMcMaster, TestData.gypsy),
       (TestData.drClaytonForrester, TestData.newbieMcNewberson),
       (TestData.tomServo, TestData.tvsFrank),
       (TestData.joelRobinson, TestData.crowTRobot),
     ]);
});

open ReactTestingLibrary;
open FireEvent;

test("Auto-matching with bye players works", () => {
  let page =
    render(
      <LoadTournament tourneyId=TestData.byeRoundTourney>
        {tournament => <PageRound tournament roundId=0 />}
      </LoadTournament>,
    );

  page
  |> getByText(~matcher=`RegExp([%bs.re "/auto-pair unmatched players/i"]))
  |> click;

  page
  |> getByTestId(~matcher=`Str("match-3-black"))
  |> expect
  |> toHaveTextContent(`Str("Bye Player"));
});
