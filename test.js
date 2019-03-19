var { Tournament, Player } = require('./app/chess-tourney.js')
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
   */
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
   */
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
 */
console.log('\nHow many unique opponents each player faced. Each should be', cvlTourney.numOfRounds())
for (var p2 in cvlTourney.playerList) {
  var player2 = cvlTourney.playerList[p2]
  var opponents = cvlTourney.playerOppHistory(player2)
  console.log(player2.firstName, player2.lastName, ':', opponents.length)
}
