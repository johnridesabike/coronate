import {DUMMY_ID, rounds2Matches} from "../../data-types";
import {
    calcPairIdeal,
    pairPlayers,
    setByePlayer,
    setUpperHalves,
    sortDataForPairing
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
        sortDataForPairing,
        setUpperHalves
    )(roundList);
}

it("Players have 0 priority of pairing themselves.", function () {
    // This doesn't technically mean they won't be paired... but let's be
    // realistic. Something nutty must happen for 0 priority pairings to get
    // picked.
    const pairData = loadPairData("Bye_Round_Tourney____");
    expect(calcPairIdeal(pairData[0], pairData[0])).toBe(0);
});
it("The lowest-ranking player is automatically picked for byes.", function () {
    const pairData = loadPairData("Bye_Round_Tourney____");
    const byedPlayer = setByePlayer([], DUMMY_ID, pairData)[1];
    expect(byedPlayer).not.toBe(null);
    expect(byedPlayer.id).toBe("Newbie_McNewberson___");
});
it("Players are paired correctly in a simple scenario.", function () {
    const pairData = loadPairData("Simple_Pairing_______");
    expect(pairData[0]).toMatchObject({
        halfPos: 0,
        id: "Grandy_McMaster______",
        isUpperHalf: true,
        score: 1
    });
    expect(pairData[1]).toMatchObject({
        halfPos: 1,
        id: "Dr_Clayton_Forrester_",
        isUpperHalf: true,
        score: 1
    });
    expect(pairData[2]).toMatchObject({
        halfPos: 0,
        id: "Gypsy________________",
        isUpperHalf: false,
        score: 1
    });
    expect(pairData[3]).toMatchObject({
        halfPos: 1,
        id: "Newbie_McNewberson___",
        isUpperHalf: false,
        score: 1
    });
    expect(pairData[4]).toMatchObject({
        halfPos: 0,
        id: "Joel_Robinson________",
        isUpperHalf: true,
        score: 0
    });
    expect(pairData[5]).toMatchObject({
        halfPos: 1,
        id: "Tom_Servo____________",
        isUpperHalf: true,
        score: 0
    });
    expect(pairData[6]).toMatchObject({
        halfPos: 0,
        id: "Crow_T_Robot_________",
        isUpperHalf: false,
        score: 0
    });
    expect(pairData[7]).toMatchObject({
        halfPos: 1,
        id: "TVs_Frank____________",
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
    expect(pairData[0]).toMatchObject({
        halfPos: 0,
        id: "Grandy_McMaster______",
        isUpperHalf: true,
        score: 1
    });
    expect(pairData[1]).toMatchObject({
        halfPos: 0,
        id: "Dr_Clayton_Forrester_",
        isUpperHalf: false,
        score: 1
    });
    expect(pairData[2]).toMatchObject({
        halfPos: 1,
        id: "Gypsy________________",
        isUpperHalf: false,
        score: 1
    });
    expect(pairData[3]).toMatchObject({
        halfPos: 0,
        id: "Tom_Servo____________",
        isUpperHalf: true,
        score: 0.5
    });
    expect(pairData[4]).toMatchObject({
        halfPos: 0,
        id: "Newbie_McNewberson___",
        isUpperHalf: false,
        score: 0.5
    });
    expect(pairData[5]).toMatchObject({
        halfPos: 0,
        id: "Joel_Robinson________",
        isUpperHalf: true,
        score: 0
    });
    expect(pairData[6]).toMatchObject({
        halfPos: 0,
        id: "Crow_T_Robot_________",
        isUpperHalf: false,
        score: 0
    });
    expect(pairData[7]).toMatchObject({
        halfPos: 1,
        id: "TVs_Frank____________",
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
