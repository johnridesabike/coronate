// @ts-check
/**
 * These tests rely on randomness so aren"t reliable. They need to be rewritten to show consistent results.
 */
import {createTournament, createPlayerManager, playerList} from "./chess-tourney";
import demoPlayers from "./demo-players.json";
import {sortBy, times, random} from "lodash";

const globalRoster = createPlayerManager(playerList(demoPlayers.slice(0, 16)));

function randomMatches(match) {
    if (!match.isBye()) {
        if (Math.random() >= 0.5) {
            match.whiteWon();
        } else {
            match.blackWon();
        }
    }
}

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

function randomRounds(tourney) {
    while (tourney.roundList.length < tourney.getNumOfRounds()) {
        let round = tourney.newRound();
        round.matches.forEach(randomMatches);
    }
}

function randomRoundsDraws(tourney) {
    while (tourney.roundList.length < tourney.getNumOfRounds()) {
        let round = tourney.newRound();
        round.matches.forEach(randomMatchesDraws);
    }
}

it("A tournament can run without crashing", function () {
    const tourney = createTournament("A battle for the ages");
    tourney.players.importPlayerList(globalRoster.roster.slice(0, 16));
    randomRounds(tourney);
});

it("A tournament can run with drawen rounds without crashing", function () {
    const tourney = createTournament("A battle for the ages");
    tourney.players.importPlayerList(globalRoster.roster.slice(0, 16));
    randomRoundsDraws(tourney);
});

it("No players face each other more than once", function () {
    // We run it multiple times to help weed out situations where the
    // randomizer provides a pass when it should fail
    let pairedCorrectly = 0;
    let tourneyNum = 50;
    times(tourneyNum, function () {
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
    const randomPlayer = function (list) {
        let pId = random(0, list.length);
        return list[pId];
    };
    times(50, function () {
        const tourney = createTournament();
        tourney.players.importPlayerList(globalRoster.roster.slice(0, 17));

        tourney.newRound().matches.forEach((match) => randomMatchesDraws(match));

        tourney.players.deactivatePlayer(
            randomPlayer(tourney.players.getActive())
        );
        tourney.players.deactivatePlayer(
            randomPlayer(tourney.players.getActive())
        );

        tourney.newRound().matches.forEach((match) => randomMatchesDraws(match));
        tourney.newRound().matches.forEach((match) => randomMatchesDraws(match));

        tourney.players.deactivatePlayer(
            randomPlayer(tourney.players.getActive())
        );
        tourney.players.deactivatePlayer(
            randomPlayer(tourney.players.getActive())
        );

        tourney.newRound().matches.forEach((match) => randomMatchesDraws(match));
    });
});
