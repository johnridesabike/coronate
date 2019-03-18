var { Tournament, Player } = require('./app/chess-tourney.js')

function logMatchResults (round) {
  for (var matchId in round) {
    var white = round[matchId].players[0]
    var black = round[matchId].players[1]
    var result = round[matchId].result
    console.log(
      white.firstName,
      white.lastName,
      'vs.',
      black.firstName,
      black.lastName
    )
    console.log(
      '   Result:',
      result[0],
      '/',
      result[1]
    )
  }
}

function logStandings (tournament) {
  // clone the array so the original isn't modified
  var players = tournament.playerList.slice(0)
  players.sort((a, b) => tournament.playerScore(b) - tournament.playerScore(a))
  for (var playerId in players) {
    var player = players[playerId]
    console.log(
      tournament.playerScore(player),
      player.firstName,
      player.lastName
    )
  }
}

function randomResults (round) {
  for (var i in round) {
    var match = round[i]
    if (Math.random() >= 0.5) {
      match.whiteWon()
    } else {
      match.blackWon()
    }
  }
}

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
  randomResults(round)
  console.log('\nRound', cvlTourney.roundList.length, 'results:')
  logMatchResults(round)
  console.log('\nCurrent Standings')
  logStandings(cvlTourney)
}
