/*
  Copyright (c) 2022 John Jackson.

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
/*
 This handles all of the logic for calculating pairings. It requires data
 taken from past tournament scores and player ratings.
*/
type player

let id: player => Data_Id.t

type t

let players: t => Data_Id.Map.t<player>

let maxPriority: t => float

let make: (Data_Id.Map.t<Data_Scoring.t>, Data_Id.Map.t<Data_Player.t>, Data_Id.Pair.Set.t) => t

let keep: (t, ~f: (Data_Id.t, player) => bool) => t

/*
 Given two player values, this assigns a number for how much they should be
 matched. The number gets fed to the `blossom` algorithm.
*/
let calcPairIdeal: (player, player, ~maxScore: float) => float

let calcPairIdealByIds: (t, Data_Id.t, Data_Id.t) => option<float>

/*
 This this returns a tuple of two objects: The modified array of player data
 without the player assigned a bye, and the player assigned a bye. If no player
 is assigned a bye, the second object is `null`. After calling this, be sure to
 add the bye round after the non-bye'd players are paired.
*/
let setByePlayer: (array<Data_Id.t>, Data_Id.Map.t<Belt.Set.Int.t>, int, Data_Id.t, t) => (t, option<player>)

/*
 Create pairings according to the rules specified in USCF § 27, § 28,  and
 § 29. This is a work in progress and does not account for all of the rules
 yet.
*/
let pairPlayers: t => array<(Data_Id.t, Data_Id.t)>
