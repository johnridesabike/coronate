Tournament data structure:

```JS
{
  name: "Winter tournament",
  timeControl: 15,
  type: SWISS,
  playerList: [
    Player('John'), Player('Jack'), Player('Peter'), Player('Paul'),
    Player('Bill'), Player('Ted'), Player('Gabe'), Player('Alan')
  ],
  roundList: [
    [ // Round 1
      {players: [playerList[0], playerlist[1]],
       result: [0, 1]},
      {players: [playerList[2], playerlist[3]],
       result: [1, 0]},
      {players: [playerList[4], playerlist[5]],
       result: [1, 0]},
      {players: [playerList[6], playerlist[7]],
       result: [0.5, 0.5]}
    ],
    [ // Round 2
      {players: [playerList[0], playerlist[1]],
       result: [0, 1]},
      {players: [playerList[2], playerlist[3]],
       result: [1, 0]},
      {players: [playerList[4], playerlist[5]],
       result: [1, 0]},
      {players: [playerList[6], playerlist[7]],
       result: [0.5, 0.5]}
    ],
    ],
    [ // Round 3
      {players: [playerList[0], playerlist[1]],
       result: [0, 1]},
      {players: [playerList[2], playerlist[3]],
       result: [1, 0]},
      {players: [playerList[4], playerlist[5]],
       result: [1, 0]},
      {players: [playerList[6], playerlist[7]],
       result: [0.5, 0.5]}
    ],
    ]
  ]
}
```
