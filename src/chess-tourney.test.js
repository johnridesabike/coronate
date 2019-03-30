/**
 * These tests rely on randomness so aren't reliable. They need to be rewritten to show consistent results.
 */
import Tournament from './chess-tourney/tournament';
import { Player } from './chess-tourney/player';
import { sortBy, times } from 'lodash';

function randomRounds(tourney) {
  while (tourney.roundList.length < tourney.numOfRounds()) {
    var round = tourney.newRound();
    round.matches.forEach(match => randomMatches(match))
  }
}

function randomMatches(match) {
  if (!match.isBye) {
    if (Math.random() >= 0.5) {
      match.whiteWon();
    } else {
      match.blackWon();
    }
  }
}

function randomRoundsDraws(tourney) {
  while (tourney.roundList.length < tourney.numOfRounds()) {
    var round = tourney.newRound();
    round.matches.forEach(match => {
      if (!match.isBye) {
        var rando = Math.random();
        if (rando >= 0.66) {
          match.whiteWon();
        } else if (rando >= .33) {
          match.blackWon();
        } else {
          match.draw();
        }
      }
    })
  }
}

const players = [
  Player('Matthew', 'A', 800), Player('Mark', 'B', 850),
  Player('Luke', 'C', 900), Player('John', 'D', 950),
  Player('Simon', 'E', 1000), Player('Andrew', 'F', 1050),
  Player('James', 'G', 1100), Player('Philip', 'H', 1150),
  Player('Bartholomew', 'I', 1200), Player('Thomas', 'J', 1250),
  Player('Catherine', 'K', 1300), Player('Clare', 'L', 1350),
  Player('Judas', 'M', 1400), Player('Matthias', 'N', 1450),
  Player('Paul', 'O', 1500), Player('Mary', 'P', 1600),
  Player('Theresa', 'Q', 1650), Player('Megan', 'R', 1700),
  Player('Elizabeth', 'S', 1750)
];

it('A tournament can run without crashing', () => {
  const tourney = Tournament('A battle for the ages', 15);
  tourney.roster.addPlayers(players.slice(0,16));
  randomRounds(tourney);
});

it('A tournament can run with drawed rounds without crashing', () => {
  const tourney = Tournament('A battle for the ages', 15);
  tourney.roster.addPlayers(players.slice(0,16));
  randomRoundsDraws(tourney);
});

it('No players face each other more than once', () => {
  // We run it multiple times to help weed out situations where the randomizer provides a pass when it should fail
  var pairedCorrectly = 0,
    tourneyNum = 10;
  times(tourneyNum, (i) => {
    var playerOppCount = [];
    var tourney = Tournament();
    tourney.roster.addPlayers(players.slice(0,16))
    randomRounds(tourney);
    playerOppCount = playerOppCount
      .concat(tourney.roster.all
        .map(p => tourney.playerOppHistory(p).length)
      );
    if (sortBy(playerOppCount, i => i)[0] === tourney.roundList.length) {
      pairedCorrectly += 1;
    }
  })
  expect(pairedCorrectly).toBe(tourneyNum);
});

it('A tournament can pair an odd number of players correctly', () => {
  const tourney = Tournament('An odd tournament indeed');
  tourney.roster.addPlayers(players.slice(0,19));
  randomRounds(tourney);
  var playerOppCount = tourney.roster.all
    .map(p => tourney.playerOppHistory(p).length);

  // if (sortBy(playerOppCount, i => i)[0] !== tourney.numOfRounds()) {
  //   tourney.roundList.forEach(round => {
  //     console.log(round.playerTree)
  //   });
  // }
  expect(sortBy(playerOppCount, i => i)[0]).toBe(tourney.numOfRounds());
});

it("A tournament doesn't crash when players are removed", () => {
  const tourney = Tournament();
  tourney.roster.addPlayers(players.slice(0,16))
  tourney.newRound().matches.forEach(match => randomMatches(match));
  tourney.newRound().matches.forEach(match => randomMatches(match));
  
  var playerTree = {};
  tourney.roster.active.forEach(player => {
    var score = tourney.playerScore(player);
    if(!(score in playerTree)) {
      playerTree[score] = [];
    }
    playerTree[score].push(player);
  });
  tourney.roster.deactivatePlayer(playerTree[0][0]);
  tourney.roster.deactivatePlayer(playerTree[1][0]);

  tourney.newRound().matches.forEach(match => randomMatches(match));
  tourney.newRound().matches.forEach(match => randomMatches(match));
})