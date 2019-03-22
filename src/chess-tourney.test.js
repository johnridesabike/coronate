/**
 * These tests rely on randomness so aren't reliable. They need to be rewritten to show consistent results.
 */
var { Tournament, Player } = require('./chess-tourney.js')
var { sortBy, times } =  require('lodash')

function randomRating(min = 800, max = 2500) {
  return Math.floor(Math.random() * (max - min) + min)
}

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
  new Player('Matthew', 'A', randomRating()), new Player('Mark', 'B', randomRating()),
  new Player('Luke', 'C', randomRating()), new Player('John', 'D', randomRating()),
  new Player('Simon', 'E', randomRating()), new Player('Andrew', 'F', randomRating()),
  new Player('James', 'G', randomRating()), new Player('Philip', 'H', randomRating()),
  new Player('Bartholomew', 'I', randomRating()), new Player('Thomas', 'J', randomRating()),
  new Player('Catherine', 'K', randomRating()), new Player('Clare', 'L', randomRating()),
  new Player('Judas', 'M', randomRating()), new Player('Matthias', 'N', randomRating()),
  new Player('Paul', 'O', randomRating()), new Player('Mary', 'P', randomRating())
]

it('A tournament can run without crashing', () => {
  var crashTourney = new Tournament('A battle for the ages', 15)
  crashTourney.addPlayers(players)
  randomRounds(crashTourney)
})

it('No players face each other more than once', () => {
  // We run it multiple times to help weed out situations where the randomizer provides a pass when it should fail
  times(16, ()=> {
    var playerOppCount = []
    var oppCountTourney = new Tournament()
    oppCountTourney.addPlayers(players)
    randomRounds(oppCountTourney)
    oppCountTourney.playerList.forEach(p =>
      playerOppCount.push(oppCountTourney.playerOppHistory(p).length)
    )
    playerOppCount = sortBy(playerOppCount, i => i)
    expect(playerOppCount[0]).toBe(oppCountTourney.roundList.length)
  })
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