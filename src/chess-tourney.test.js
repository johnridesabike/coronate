/**
 * These tests rely on randomness so aren"t reliable. They need to be rewritten to show consistent results.
 */
import {createPlayer, createTournament, scores} from "./chess-tourney";
import {sortBy, times} from "lodash";

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

const players = [
    createPlayer("Matthew", "A", 800), createPlayer("Mark", "B", 850),
    createPlayer("Luke", "C", 900), createPlayer("John", "D", 950),
    createPlayer("Simon", "E", 1000), createPlayer("Andrew", "F", 1050),
    createPlayer("James", "G", 1100), createPlayer("Philip", "H", 1150),
    createPlayer("Bartholomew", "I", 1200), createPlayer("Thomas", "J", 1250),
    createPlayer("Catherine", "K", 1300), createPlayer("Clare", "L", 1350),
    createPlayer("Judas", "M", 1400), createPlayer("Matthias", "N", 1450),
    createPlayer("Paul", "O", 1500), createPlayer("Mary", "P", 1600),
    createPlayer("Theresa", "Q", 1650), createPlayer("Megan", "R", 1700),
    createPlayer("Elizabeth", "S", 1750)
];

it("A tournament can run without crashing", function () {
    const tourney = createTournament("A battle for the ages");
    tourney.roster.addPlayers(players.slice(0, 16));
    randomRounds(tourney);
});

it("A tournament can run with drawen rounds without crashing", function () {
    const tourney = createTournament("A battle for the ages");
    tourney.roster.addPlayers(players.slice(0, 16));
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
        tourney.roster.addPlayers(players.slice(0, 16));
        randomRoundsDraws(tourney);
        playerOppCount = playerOppCount.concat(
            tourney.roster.all.map(
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
        tourney.roster.addPlayers(players.slice(0, 19));
        randomRoundsDraws(tourney);
        playerOppCount = playerOppCount.concat(
            tourney.roster.all.map(
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
    const tourney = createTournament();
    tourney.roster.addPlayers(players.slice(0, 16));
    tourney.newRound().matches.forEach((match) => randomMatches(match));
    tourney.newRound().matches.forEach((match) => randomMatches(match));
    let playerTree = {};
    tourney.roster.getActive().forEach(function (player) {
        let score = scores.playerScore(tourney, player);
        if (playerTree[score] === undefined) {
            playerTree[score] = [];
        }
        playerTree[score].push(player);
    });
    tourney.roster.deactivatePlayer(playerTree[0][0]);
    tourney.roster.deactivatePlayer(playerTree[1][0]);
    tourney.newRound().matches.forEach((match) => randomMatches(match));
    tourney.newRound().matches.forEach((match) => randomMatches(match));
});
