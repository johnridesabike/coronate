/**
 * These tests rely on randomness so aren't reliable. They need to be rewritten to show consistent results.
 */
const { Tournament, Player } = require('./chess-tourney.js');
const { sortBy, times } =  require('lodash');

function randomRounds(tourney) {
  while (tourney.roundList.length < tourney.numOfRounds()) {
    var round = tourney.newRound();
    round.matches.forEach(function(match) {
      if (Math.random() >= 0.5) {
        match.whiteWon();
      } else {
        match.blackWon();
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
  new Player('Paul', 'O', 1500), new Player('Mary', 'P', 1600)
];

it('A tournament can run without crashing', () => {
  var crashTourney = new Tournament('A battle for the ages', 15);
  crashTourney.addPlayers(players);
  randomRounds(crashTourney);
})

it('No players face each other more than once', () => {
  // We run it multiple times to help weed out situations where the randomizer provides a pass when it should fail
  var pairedCorrectly = 0,
    tourneyNum = 100;
  times(tourneyNum, (i) => {
    var playerOppCount = [];
    var oppCountTourney = new Tournament();
    oppCountTourney.addPlayers(players);
    randomRounds(oppCountTourney);
    oppCountTourney.playerList.forEach(p =>
      playerOppCount.push(oppCountTourney.playerOppHistory(p).length)
    );
    if (sortBy(playerOppCount, i => i)[0] === oppCountTourney.roundList.length) {
      pairedCorrectly += 1;
    }
  })
  expect(pairedCorrectly).toBe(tourneyNum);
})