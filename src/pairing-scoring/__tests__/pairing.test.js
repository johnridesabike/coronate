import {DUMMY_ID, rounds2Matches} from "../../data-types";
import {calcPairIdeal, setByePlayer, sortDataForPairing} from "../pairing";
import {createPairingData, matches2ScoreData} from "../converters";
import {filter, pipe} from "ramda";
import data from "../../test-data";

const tourney = data.tournaments["Bye_Round_Tourney____"];
const players = filter((p) => tourney.playerIds.includes(p.id), data.players);
const pairData = pipe(
    rounds2Matches,
    matches2ScoreData,
    createPairingData(players, data.options.avoidPairs),
    sortDataForPairing
)(tourney.roundList);

it("Players have 0 priority of pairing themselves", function () {
    // This doesn't Technically mean they won't be... but let's be realistic.
    // Something nutty must happen for 0 priority pairings to get picked.
    expect(calcPairIdeal(pairData[0], pairData[0])).toBe(0);
});

it("The lowest-ranking player gets automatically picked for byes", function () {
    const byedPlayer = setByePlayer([], DUMMY_ID, pairData)[1];
    expect(byedPlayer).not.toBe(null);
    expect(byedPlayer.id).toBe("Newbie_McNewberson___");
});
