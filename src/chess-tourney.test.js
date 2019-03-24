/**
 * These tests rely on randomness so aren't reliable. They need to be rewritten to show consistent results.
 */
const { Tournament, Player } = require('./chess-tourney.js')
const { sortBy, times } =  require('lodash')

function randomRounds(tourney) {
  while (tourney.roundList.length < tourney.numOfRounds()) {
    var round = tourney.newRound()
    round.matches.forEach(function(match) {
      if (Math.random() >= 0.5) {
        match.whiteWon()
      } else {
        match.blackWon()
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
]

it('A tournament can run without crashing', () => {
  var crashTourney = new Tournament('A battle for the ages', 15)
  crashTourney.addPlayers(players)
  randomRounds(crashTourney)
})

it('No players face each other more than once', () => {
  // We run it multiple times to help weed out situations where the randomizer provides a pass when it should fail
  var pairedCorrectly = 0,
    tourneyNum = 100
  times(tourneyNum, (i) => {
    var playerOppCount = []
    var oppCountTourney = new Tournament()
    oppCountTourney.addPlayers(players)
    randomRounds(oppCountTourney)
    oppCountTourney.playerList.forEach(p =>
      playerOppCount.push(oppCountTourney.playerOppHistory(p).length)
    )
    if (sortBy(playerOppCount, i => i)[0] === oppCountTourney.roundList.length) {
      pairedCorrectly += 1
    }
  })
  expect(pairedCorrectly).toBe(tourneyNum)
})

/*

var players = [
  new Player('Matthew', 'A'), new Player('Mark', 'B'),
  new Player('Luke', 'C'), new Player('John', 'D'),
  new Player('Simon', 'E'), new Player('Andrew', 'F'),
  new Player('James', 'G'), new Player('Philip', 'H'),
  new Player('Bartholomew', 'I'), new Player('Thomas', 'J'),
  new Player('Catherine', 'K'), new Player('Clare', 'L'),
  new Player('Judas', 'M'), new Player('Matthias', 'N'),
  new Player('Paul', 'O'), new Player('Mary', 'P')
]
let cvlTourney = new Tournament('CVL Winter Open', 15, players)
console.log(cvlTourney.name + ': ' + cvlTourney.numOfRounds() + ' rounds')
while (cvlTourney.roundList.length < cvlTourney.numOfRounds()) {
  var round = cvlTourney.newRound()
  console.log('\nRound', cvlTourney.roundList.length, 'results:')
  /**
   * Randomize and log the results
   *//*
  for (var i in round) {
    var match = round[i]
    if (Math.random() >= 0.5) {
      match.whiteWon()
    } else {
      match.blackWon()
    }
    var white = match.players[0]
    var black = match.players[1]
    var result = match.result
    console.log(
      white.firstName,
      white.lastName,
      'vs.',
      black.firstName,
      black.lastName,
      ':',
      result[0],
      '/',
      result[1]
    )
  }
  console.log('\nCurrent Standings')
  /**
   * Log the standings
   *//*
  // clone the array so the original isn't modified
  var currentPlayers = cvlTourney.playerList.slice(0)
  currentPlayers.sort((a, b) => cvlTourney.playerScore(b) - cvlTourney.playerScore(a))
  console.log('score / name / color balance')
  for (var p in currentPlayers) {
    var player = currentPlayers[p]
    console.log(
      cvlTourney.playerScore(player),
      player.firstName + ' ' + player.lastName,
      cvlTourney.playerColorBalance(player)
    )
  }
}

/**
 * Test to see how many unique opponents each player had.
 *//*
console.log('\nHow many unique opponents each player faced. Each should be', cvlTourney.numOfRounds())
for (var p2 in cvlTourney.playerList) {
  var player2 = cvlTourney.playerList[p2]
  var opponents = cvlTourney.playerOppHistory(player2)
  console.log(player2.firstName, player2.lastName, ':', opponents.length)
}

*/