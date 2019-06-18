import {DUMMY_ID, rounds2Matches} from "../../data-types";
import {
    calcPairIdeal,
    pairPlayers,
    setByePlayer,
    setUpperHalves
} from "../pairing";
import {createPairingData, matches2ScoreData} from "../converters";
import {curry, filter, pipe} from "ramda";
import data from "../../test-data";

function loadPairData(tourneyId) {
    const {playerIds, roundList} = data.tournaments[tourneyId];
    const players = filter((p) => playerIds.includes(p.id), data.players);
    return pipe(
        rounds2Matches,
        matches2ScoreData,
        curry(createPairingData)(players, data.options.avoidPairs),
        setUpperHalves
    )(roundList);
}

it("Players have 0 priority of pairing themselves.", function () {
    // This doesn't technically mean they won't be paired... but let's be
    // realistic. Something nutty must happen for 0 priority pairings to get
    // picked.
    const pairData = loadPairData("Bye_Round_Tourney____");
    const newb = pairData["Newbie_McNewberson___"];
    expect(calcPairIdeal(newb, newb)).toBe(0);
});
it("The lowest-ranking player is automatically picked for byes.", function () {
    const DataPreBye = loadPairData("Bye_Round_Tourney____");
    const [pairData, byedPlayer] = setByePlayer([], DUMMY_ID, DataPreBye);
    expect(Object.keys(pairData)).not.toContain("Newbie_McNewberson___");
    expect(byedPlayer.id).toBe("Newbie_McNewberson___");

});
it("The bye signup queue works", function () {
    const DataPreBye = loadPairData("Bye_Round_Tourney_2__");
    const byeQueue = ["Newbie_McNewberson___", "Joel_Robinson________"];
    // Newbie McNewberson already played the first bye round
    const [pairData, byedPlayer] = setByePlayer(byeQueue, DUMMY_ID, DataPreBye);
    expect(Object.keys(pairData)).not.toContain("Joel_Robinson________");
    expect(byedPlayer.id).toBe("Joel_Robinson________");
});
it(`If all player have (impossibly) played a bye round, the lowest-rated 
player is picked`, function () {
    const DataPreBye = loadPairData("Bye_Tourney_3________");
    const [pairData, byedPlayer] = setByePlayer([], DUMMY_ID, DataPreBye);
    expect(Object.keys(pairData)).not.toContain("Newbie_McNewberson___");
    expect(byedPlayer.id).toBe("Newbie_McNewberson___");
});
it("Players are paired correctly in a simple scenario.", function () {
    const pairData = loadPairData("Simple_Pairing_______");
    expect(pairData["Grandy_McMaster______"]).toMatchObject({
        halfPos: 0,
        isUpperHalf: true,
        score: 1
    });
    expect(pairData["Dr_Clayton_Forrester_"]).toMatchObject({
        halfPos: 1,
        isUpperHalf: true,
        score: 1
    });
    expect(pairData["Gypsy________________"]).toMatchObject({
        halfPos: 0,
        isUpperHalf: false,
        score: 1
    });
    expect(pairData["Newbie_McNewberson___"]).toMatchObject({
        halfPos: 1,
        isUpperHalf: false,
        score: 1
    });
    expect(pairData["Joel_Robinson________"]).toMatchObject({
        halfPos: 0,
        isUpperHalf: true,
        score: 0
    });
    expect(pairData["Tom_Servo____________"]).toMatchObject({
        halfPos: 1,
        isUpperHalf: true,
        score: 0
    });
    expect(pairData["Crow_T_Robot_________"]).toMatchObject({
        halfPos: 0,
        isUpperHalf: false,
        score: 0
    });
    expect(pairData["TVs_Frank____________"]).toMatchObject({
        halfPos: 1,
        isUpperHalf: false,
        score: 0
    });
    const matches = pairPlayers(pairData);
    expect(matches).toEqual([
        ["Grandy_McMaster______", "Gypsy________________"],
        ["Dr_Clayton_Forrester_", "Newbie_McNewberson___"],
        ["Joel_Robinson________", "Crow_T_Robot_________"],
        ["Tom_Servo____________", "TVs_Frank____________"]
    ]);
});
it("Players are paired correctly after a draw.", function () {
    const pairData = loadPairData("Pairing_With_Draws___");
    expect(pairData["Grandy_McMaster______"]).toMatchObject({
        halfPos: 0,
        isUpperHalf: true,
        score: 1
    });
    expect(pairData["Dr_Clayton_Forrester_"]).toMatchObject({
        halfPos: 0,
        isUpperHalf: false,
        score: 1
    });
    expect(pairData["Gypsy________________"]).toMatchObject({
        halfPos: 1,
        isUpperHalf: false,
        score: 1
    });
    expect(pairData["Tom_Servo____________"]).toMatchObject({
        halfPos: 0,
        isUpperHalf: true,
        score: 0.5
    });
    expect(pairData["Newbie_McNewberson___"]).toMatchObject({
        halfPos: 0,
        isUpperHalf: false,
        score: 0.5
    });
    expect(pairData["Joel_Robinson________"]).toMatchObject({
        halfPos: 0,
        isUpperHalf: true,
        score: 0
    });
    expect(pairData["Crow_T_Robot_________"]).toMatchObject({
        halfPos: 0,
        isUpperHalf: false,
        score: 0
    });
    expect(pairData["TVs_Frank____________"]).toMatchObject({
        halfPos: 1,
        isUpperHalf: false,
        score: 0
    });
    const matches = pairPlayers(pairData);
    expect(matches).toEqual([
        ["Grandy_McMaster______", "Gypsy________________"],
        ["Dr_Clayton_Forrester_", "Newbie_McNewberson___"],
        ["Tom_Servo____________", "TVs_Frank____________"],
        ["Joel_Robinson________", "Crow_T_Robot_________"]
    ]);
});
