open Belt;
open Jest;
open Expect;
open Data.Converters;

let loadPairData = tourneyId => {
  let tournament = TestData.tournaments->Belt.Map.String.getExn(tourneyId);
  let playerIds = tournament.playerIds;
  let roundList = tournament.roundList;
  let players =
    TestData.players->Map.String.reduce(Map.String.empty, (acc, key, player) =>
      if (playerIds->List.has(key, (===))) {
        acc->Map.String.set(key, player);
      } else {
        acc;
      }
    );
  Data.Rounds.rounds2Matches(~roundList, ())->matches2ScoreData
  |> createPairingData(players, TestData.config.avoidPairs)
  |> Pairing.setUpperHalves;
};

test("Players have 0 priority of pairing themselves.", () => {
  // This doesn't technically mean they won't be paired... but let's be
  // realistic. Something nutty must happen for 0 priority pairings to get
  // picked.
  let pairData = loadPairData("Bye_Round_Tourney____");
  let newb = pairData->Map.String.getExn("Newbie_McNewberson___");
  let ideal = Pairing.calcPairIdeal(newb, newb);
  expect(ideal) |> toBe(0.0);
});

describe("The lowest-ranking player is automatically picked for byes.", () => {
  let dataPreBye = loadPairData("Bye_Round_Tourney____");
  let (pairData, byedPlayer) =
    Pairing.setByePlayer([||], Data.Player.dummy_id, dataPreBye);
  test("The lowest-ranking player is removed after bye selection.", () =>
    expect(pairData->Map.String.keysToArray)
    |> not
    |> toContain("Newbie_McNewberson___")
  );
  test("The lowest-ranking player is returned", () =>
    switch (byedPlayer) {
    | None => assert(false)
    | Some(player) => expect(player.id) |> toBe("Newbie_McNewberson___")
    }
  );
});

test("The bye signup queue works", () => {
  let dataPreBye = loadPairData("Bye_Round_Tourney_2__");
  let byeQueue = [|"Newbie_McNewberson___", "Joel_Robinson________"|];
  // Newbie McNewberson already played the first bye round
  let (_, byedPlayer) =
    Pairing.setByePlayer(byeQueue, Data.Player.dummy_id, dataPreBye);
  switch (byedPlayer) {
  | None => assert(false)
  | Some(player) => expect(player.id) |> toBe("Joel_Robinson________")
  };
});
test(
  "If all player have (impossibly) played a bye round, the lowest-rated player is picked",
  () => {
    let dataPreBye = loadPairData("Bye_Tourney_3________");
    let (_, byedPlayer) =
      Pairing.setByePlayer([||], Data.Player.dummy_id, dataPreBye);
    switch (byedPlayer) {
    | None => assert(false)
    | Some(player) => expect(player.id) |> toBe("Newbie_McNewberson___")
    };
  },
);
test("Players are paired correctly in a simple scenario.", () => {
  let pairData = loadPairData("Simple_Pairing_______");
  // expect(pairData["Dr_Clayton_Forrester_"]).toMatchObject({
  //     halfPos: 1,
  //     isUpperHalf: true,
  //     score: 1
  // });
  // expect(pairData["Gypsy________________"]).toMatchObject({
  //     halfPos: 0,
  //     isUpperHalf: false,
  //     score: 1
  // });
  // expect(pairData["Newbie_McNewberson___"]).toMatchObject({
  //     halfPos: 1,
  //     isUpperHalf: false,
  //     score: 1
  // });
  // expect(pairData["Joel_Robinson________"]).toMatchObject({
  //     halfPos: 0,
  //     isUpperHalf: true,
  //     score: 0
  // });
  // expect(pairData["Tom_Servo____________"]).toMatchObject({
  //     halfPos: 1,
  //     isUpperHalf: true,
  //     score: 0
  // });
  // expect(pairData["Crow_T_Robot_________"]).toMatchObject({
  //     halfPos: 0,
  //     isUpperHalf: false,
  //     score: 0
  // });
  // expect(pairData["TVs_Frank____________"]).toMatchObject({
  //     halfPos: 1,
  //     isUpperHalf: false,
  //     score: 0
  // });
  let matches = Pairing.pairPlayers(pairData);
  expect(matches)
  |> ExpectJs.toEqual([
       ("Grandy_McMaster______", "Gypsy________________"),
       ("Dr_Clayton_Forrester_", "Newbie_McNewberson___"),
       ("Joel_Robinson________", "Crow_T_Robot_________"),
       ("Tom_Servo____________", "TVs_Frank____________"),
     ]);
});
test("Players are paired correctly after a draw.", () => {
  let pairData = loadPairData("Pairing_With_Draws___");
  // This data is obsolete in the transition to ReasonML:
  // expect(pairData["Grandy_McMaster______"]).toMatchObject({
  //     halfPos: 0,
  //     isUpperHalf: true,
  //     score: 1
  // });
  // expect(pairData["Dr_Clayton_Forrester_"]).toMatchObject({
  //     halfPos: 0,
  //     isUpperHalf: false,
  //     score: 1
  // });
  // expect(pairData["Gypsy________________"]).toMatchObject({
  //     halfPos: 1,
  //     isUpperHalf: false,
  //     score: 1
  // });
  // expect(pairData["Tom_Servo____________"]).toMatchObject({
  //     halfPos: 0,
  //     isUpperHalf: true,
  //     score: 0.5
  // });
  // expect(pairData["Newbie_McNewberson___"]).toMatchObject({
  //     halfPos: 0,
  //     isUpperHalf: false,
  //     score: 0.5
  // });
  // expect(pairData["Joel_Robinson________"]).toMatchObject({
  //     halfPos: 0,
  //     isUpperHalf: true,
  //     score: 0
  // });
  // expect(pairData["Crow_T_Robot_________"]).toMatchObject({
  //     halfPos: 0,
  //     isUpperHalf: false,
  //     score: 0
  // });
  // expect(pairData["TVs_Frank____________"]).toMatchObject({
  //     halfPos: 1,
  //     isUpperHalf: false,
  //     score: 0
  // });
  let matches = Pairing.pairPlayers(pairData);
  expect(matches)
  |> toEqual([
       ("Grandy_McMaster______", "Gypsy________________"),
       ("Dr_Clayton_Forrester_", "Newbie_McNewberson___"),
       ("Tom_Servo____________", "TVs_Frank____________"),
       ("Joel_Robinson________", "Crow_T_Robot_________"),
     ]);
});