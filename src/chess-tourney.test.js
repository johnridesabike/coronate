/**
 * These tests rely on randomness so aren't reliable. They need to be rewritten to show consistent results.
 */
const { Tournament, Player } = require('./chess-tourney.js');
const { sortBy, times } =  require('lodash');

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
  new Player('Matthew', 'A', 800), new Player('Mark', 'B', 850),
  new Player('Luke', 'C', 900), new Player('John', 'D', 950),
  new Player('Simon', 'E', 1000), new Player('Andrew', 'F', 1050),
  new Player('James', 'G', 1100), new Player('Philip', 'H', 1150),
  new Player('Bartholomew', 'I', 1200), new Player('Thomas', 'J', 1250),
  new Player('Catherine', 'K', 1300), new Player('Clare', 'L', 1350),
  new Player('Judas', 'M', 1400), new Player('Matthias', 'N', 1450),
  new Player('Paul', 'O', 1500), new Player('Mary', 'P', 1600),
  new Player('Theresa', 'Q', 1650), new Player('Megan', 'R', 1700),
  new Player('Elizabeth', 'S', 1750)
];

it('A tournament can run without crashing', () => {
  const tourney = new Tournament('A battle for the ages', 15);
  tourney.addPlayers(players.slice(0,16));
  randomRounds(tourney);
});

it('A tournament can run with drawed rounds without crashing', () => {
  const tourney = new Tournament('A battle for the ages', 15);
  tourney.addPlayers(players.slice(0,16));
  randomRoundsDraws(tourney);
});

it('No players face each other more than once', () => {
  // We run it multiple times to help weed out situations where the randomizer provides a pass when it should fail
  var pairedCorrectly = 0,
    tourneyNum = 10;
  times(tourneyNum, (i) => {
    var playerOppCount = [];
    var tourney = new Tournament();
    tourney.addPlayers(players.slice(0,16))
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
  const tourney = new Tournament('An odd tournament indeed');
  tourney.addPlayers(players.slice(0,19));
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
  const tourney = new Tournament();
  tourney.addPlayers(players.slice(0,16))
  tourney.newRound().matches.forEach(match => randomMatches(match));
  tourney.newRound().matches.forEach(match => randomMatches(match));
  
  var playerTree = {};
  tourney.roster.active().forEach(player => {
    var score = tourney.playerScore(player);
    if(!(score in playerTree)) {
      playerTree[score] = [];
    }
    playerTree[score].push(player);
  });
  tourney.deactivatePlayer(playerTree[0][0]);
  tourney.deactivatePlayer(playerTree[1][0]);

  tourney.newRound().matches.forEach(match => randomMatches(match));
  tourney.newRound().matches.forEach(match => randomMatches(match));
})