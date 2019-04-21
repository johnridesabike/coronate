// @ts-check
/**
 * These tests rely on randomness so aren't reliable. They may need to be
 * rewritten to show consistent results.
 */
import {createTournament, createPlayerManager} from "./old-chess-tourney";
import demoPlayers from "./demo-players.json";
import {sortBy, times, random} from "lodash";
/**
 * @typedef {import("./old-chess-tourney").Match} Match
 * @typedef {import("./old-chess-tourney").Tournament} Tournament
 * @typedef {import("./old-chess-tourney").Player} Player
 */

const globalRoster = createPlayerManager({roster: demoPlayers.slice(0, 16)});

/**
 *
 * @param {Match} match
 */
function randomMatches(match) {
    if (!match.isBye()) {
        if (Math.random() >= 0.5) {
            match.whiteWon();
        } else {
            match.blackWon();
        }
    }
}

/**
 *
 * @param {Match} match
 */
function randomMatchesDraws(match) {
    if (!match.isBye()) {
        let rando = Math.random();
        if (rando >= 0.66) {
            match.whiteWon();
        } else if (rando >= 0.33) {
            match.blackWon();
        } else {
            match.draw();
        }
    }
}

/**
 *
 * @param {Tournament} tourney
 */
function randomRounds(tourney) {
    while (tourney.roundList.length < tourney.getNumOfRounds()) {
        let round = tourney.newRound();
        round.matches.forEach(randomMatches);
    }
}

/**
 *
 * @param {Tournament} tourney
 */
function randomRoundsDraws(tourney) {
    while (tourney.roundList.length < tourney.getNumOfRounds()) {
        let round = tourney.newRound();
        round.matches.forEach(randomMatchesDraws);
    }
}

it("A tournament can run without crashing", function () {
    const tourney = createTournament({name: "A battle for the ages"});
    tourney.players.importPlayerList(globalRoster.roster.slice(0, 16));
    randomRounds(tourney);
});

it("A tournament can run with drawen rounds without crashing", function () {
    const tourney = createTournament({name: "A battle for the ages"});
    tourney.players.importPlayerList(globalRoster.roster.slice(0, 16));
    randomRoundsDraws(tourney);
});

it("No players face each other more than once", function () {
    // We run it multiple times to help weed out situations where the
    // randomizer provides a pass when it should fail
    let pairedCorrectly = 0;
    let tourneyNum = 50;
    times(tourneyNum, function () {
        /** @type {number[]} */
        let playerOppCount = [];
        let tourney = createTournament();
        tourney.players.importPlayerList(globalRoster.roster.slice(0, 16));
        randomRoundsDraws(tourney);
        playerOppCount = playerOppCount.concat(
            tourney.players.roster.map(
                (p) => new Set(tourney.getPlayersByOpponent(p)).size
            )
        );
        if (sortBy(playerOppCount, (i) => i)[0] === tourney.roundList.length) {
            pairedCorrectly += 1;
        }
    });
    expect(pairedCorrectly).toBe(tourneyNum);
});

it("A tournament can pair an odd number of players correctly", function () {
    let pairedCorrectly = 0;
    let tourneyNum = 50;
    times(tourneyNum, function () {
        /** @type {number[]} */
        let playerOppCount = [];
        let tourney = createTournament();
        tourney.players.importPlayerList(globalRoster.roster.slice(0, 19));
        randomRoundsDraws(tourney);
        playerOppCount = playerOppCount.concat(
            tourney.players.roster.map(
                (p) => new Set(tourney.getPlayersByOpponent(p)).size
            )
        );
        if (sortBy(playerOppCount, (i) => i)[0] === tourney.roundList.length) {
            pairedCorrectly += 1;
        }
    });
    expect(pairedCorrectly).toBe(tourneyNum);
});

it("A tournament doesn't crash when players are removed", function () {
    /** @param {Player[]} list */
    const randomPlayer = function (list) {
        let pId = random(0, list.length);
        return list[pId];
    };
    times(50, function () {
        const tourney = createTournament();
        tourney.players.importPlayerList(globalRoster.roster.slice(0, 17));

        tourney.newRound().matches.forEach(
            (match) => randomMatchesDraws(match)
        );

        tourney.players.deactivatePlayer(
            randomPlayer(tourney.players.getActive())
        );
        tourney.players.deactivatePlayer(
            randomPlayer(tourney.players.getActive())
        );

        tourney.newRound().matches.forEach(
            (match) => randomMatchesDraws(match)
        );
        tourney.newRound().matches.forEach(
            (match) => randomMatchesDraws(match)
        );

        tourney.players.deactivatePlayer(
            randomPlayer(tourney.players.getActive())
        );
        tourney.players.deactivatePlayer(
            randomPlayer(tourney.players.getActive())
        );

        tourney.newRound().matches.forEach(
            (match) => randomMatchesDraws(match)
        );
    });
});
