/*
  Copyright (c) 2022 John Jackson.

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
open! Belt
open Data
module Id = Data.Id
let id = Id.fromString
let nat = Data.Player.NatInt.fromInt

let crowTRobot: Player.t = {
  id: "Crow_T_Robot_________"->id,
  matchCount: nat(5),
  rating: 1700,
  type_: Person,
  firstName: "Crow T",
  lastName: "Robot",
}
let drClaytonForrester: Player.t = {
  id: "Dr_Clayton_Forrester_"->id,
  matchCount: nat(40),
  rating: 2100,
  type_: Person,
  firstName: "Clayton",
  lastName: "Forrester",
}
let grandyMcMaster: Player.t = {
  id: "Grandy_McMaster______"->id,
  matchCount: nat(100),
  rating: 2600,
  type_: Person,
  firstName: "Grandy",
  lastName: "McMaster",
}
let gypsy: Player.t = {
  id: "Gypsy________________"->id,
  matchCount: nat(15),
  rating: 1600,
  type_: Person,
  firstName: "Gypsy",
  lastName: "",
}
let joelRobinson: Player.t = {
  id: "Joel_Robinson________"->id,
  matchCount: nat(70),
  rating: 2400,
  type_: Person,
  firstName: "Joel",
  lastName: "Robinson",
}
let newbieMcNewberson: Player.t = {
  id: "Newbie_McNewberson___"->id,
  matchCount: nat(0),
  rating: 800,
  type_: Person,
  firstName: "Newbie",
  lastName: "McNewberson",
}
let tomServo: Player.t = {
  id: "Tom_Servo____________"->id,
  matchCount: nat(10),
  rating: 1800,
  type_: Person,
  firstName: "Tom",
  lastName: "Servo",
}
let tvsFrank: Player.t = {
  id: "TVs_Frank____________"->id,
  matchCount: nat(35),
  rating: 1400,
  type_: Person,
  firstName: "TV's",
  lastName: "Frank",
}
let cambot: Player.t = {
  id: "Cambot_______________"->id,
  matchCount: nat(25),
  rating: 1500,
  type_: Person,
  firstName: "Cambot",
  lastName: "",
}
let jonah: Player.t = {
  id: "Jonah_Heston_________"->id,
  matchCount: nat(50),
  rating: 2200,
  type_: Person,
  firstName: "Jonah",
  lastName: "Heston",
}
let kinga: Player.t = {
  id: "Kinga_Forrester______"->id,
  matchCount: nat(20),
  rating: 1900,
  type_: Person,
  firstName: "Kinga",
  lastName: "Forrester",
}
let larry: Player.t = {
  id: "Larry_Erhardt________"->id,
  matchCount: nat(45),
  rating: 1300,
  type_: Person,
  firstName: "Larry",
  lastName: "Erhardt",
}
let mike: Player.t = {
  id: "Mike_Nelson__________"->id,
  matchCount: nat(60),
  rating: 2300,
  type_: Person,
  firstName: "Mike",
  lastName: "Nelson",
}
let observer: Player.t = {
  id: "Observer_Brain_Guy___"->id,
  matchCount: nat(55),
  rating: 1200,
  type_: Person,
  firstName: "Brain",
  lastName: "Guy",
}
let pearl: Player.t = {
  id: "Pearl_Forrester______"->id,
  matchCount: nat(30),
  rating: 2000,
  type_: Person,
  firstName: "Pearl",
  lastName: "Forrester",
}
let bobo: Player.t = {
  id: "Professor_Bobo_______"->id,
  matchCount: nat(75),
  rating: 1000,
  type_: Person,
  firstName: "Bobo",
  lastName: "Professor",
}
let tvsSon: Player.t = {
  id: "TVs_Son_of_TVs_Frank_"->id,
  matchCount: nat(65),
  rating: 1100,
  type_: Person,
  firstName: "TV's",
  lastName: "Max",
}
let deletedPlayer = "Deleted_Player_______"->id

let byeRoundTourney: Tournament.t = {
  id: "Bye_Round_Tourney____"->id,
  byeQueue: [],
  date: Js.Date.fromString("2019-06-12T23:49:47.103Z"),
  playerIds: Set.fromArray(
    ~id=Id.id,
    [
      joelRobinson.id,
      crowTRobot.id,
      tomServo.id,
      gypsy.id,
      cambot.id,
      newbieMcNewberson.id,
      grandyMcMaster.id,
    ],
  ),
  scoreAdjustments: Map.make(~id=Id.id),
  roundList: Rounds.empty,
  tieBreaks: [Median, Solkoff, Cumulative, CumulativeOfOpposition],
  name: "Bye Round Tourney",
}
let byeRoundTourney2: Tournament.t = {
  id: "Bye_Round_Tourney_2__"->id,
  byeQueue: [],
  date: Js.Date.fromString("2019-06-12T23:49:47.103Z"),
  playerIds: Set.fromArray(
    ~id=Id.id,
    [
      joelRobinson.id,
      crowTRobot.id,
      tomServo.id,
      gypsy.id,
      cambot.id,
      newbieMcNewberson.id,
      grandyMcMaster.id,
    ],
  ),
  scoreAdjustments: Map.make(~id=Id.id),
  roundList: [
    [
      {
        id: "xTXxZHB0sTt__xIAg45fm"->id,
        result: BlackWon,
        whiteNewRating: 2592,
        blackNewRating: 1833,
        whiteOrigRating: 2600,
        blackOrigRating: 1700,
        whiteId: grandyMcMaster.id,
        blackId: crowTRobot.id,
      },
      {
        id: "zQcf9RWXK7iuU6ibPzrhU"->id,
        result: WhiteWon,
        whiteNewRating: 2400,
        blackNewRating: 1600,
        whiteOrigRating: 2400,
        blackOrigRating: 1600,
        whiteId: joelRobinson.id,
        blackId: gypsy.id,
      },
      {
        id: "Vw_X0c7O4vshrYEO-oSzR"->id,
        result: BlackWon,
        whiteNewRating: 1738,
        blackNewRating: 1526,
        whiteOrigRating: 1800,
        blackOrigRating: 1500,
        whiteId: tomServo.id,
        blackId: cambot.id,
      },
      {
        id: "iSDujOVkOTrcLv_KJmd7s"->id,
        result: WhiteWon,
        whiteNewRating: 800,
        blackNewRating: 0,
        whiteOrigRating: 800,
        blackOrigRating: 0,
        whiteId: newbieMcNewberson.id,
        blackId: Data.Id.dummy,
      },
    ]->Rounds.Round.fromArray,
  ]->Rounds.fromArray,
  tieBreaks: [Median, Solkoff, Cumulative, CumulativeOfOpposition],
  name: "Bye Round Tourney 2",
}
let byeRoundTourney3: Tournament.t = {
  id: "Bye_Tourney_3________"->id,
  byeQueue: [],
  date: Js.Date.fromString("2019-06-17T23:00:29.603Z"),
  playerIds: Set.fromArray(~id=Id.id, [kinga.id, newbieMcNewberson.id, jonah.id]),
  scoreAdjustments: Map.make(~id=Id.id),
  roundList: [
    [
      {
        id: "KkFr4B7FDqiHRWmACgApf"->id,
        result: BlackWon,
        whiteNewRating: 1894,
        blackNewRating: 2202,
        whiteOrigRating: 1900,
        blackOrigRating: 2200,
        whiteId: kinga.id,
        blackId: jonah.id,
      },
      {
        id: "R_BTsGSziwgyvFZM3yc5u"->id,
        result: WhiteWon,
        whiteNewRating: 793,
        blackNewRating: 0,
        whiteOrigRating: 793,
        blackOrigRating: 0,
        whiteId: newbieMcNewberson.id,
        blackId: Data.Id.dummy,
      },
    ]->Rounds.Round.fromArray,
    [
      {
        id: "rcyCfpZU6olav5kdVac44"->id,
        result: BlackWon,
        whiteNewRating: 2187,
        blackNewRating: 953,
        whiteOrigRating: 2202,
        blackOrigRating: 793,
        whiteId: jonah.id,
        blackId: newbieMcNewberson.id,
      },
      {
        id: "Nc0Om5fEuwSuzFls9wmME"->id,
        result: WhiteWon,
        whiteNewRating: 1894,
        blackNewRating: 0,
        whiteOrigRating: 1894,
        blackOrigRating: 0,
        whiteId: kinga.id,
        blackId: Data.Id.dummy,
      },
    ]->Rounds.Round.fromArray,
    [
      {
        id: "uawjKwbiA38RP8pA--tlw"->id,
        result: BlackWon,
        whiteNewRating: 952,
        blackNewRating: 1894,
        whiteOrigRating: 953,
        blackOrigRating: 1894,
        whiteId: newbieMcNewberson.id,
        blackId: kinga.id,
      },
      {
        id: "-kwIDxjPhWVRbqxtRZ26_"->id,
        result: WhiteWon,
        whiteNewRating: 2187,
        blackNewRating: 0,
        whiteOrigRating: 2187,
        blackOrigRating: 0,
        whiteId: jonah.id,
        blackId: Data.Id.dummy,
      },
    ]->Rounds.Round.fromArray,
  ]->Rounds.fromArray,
  tieBreaks: [Median, Solkoff, Cumulative, CumulativeOfOpposition],
  name: "Bye Tourney 3",
}
let simplePairing: Tournament.t = {
  id: "Simple_Pairing_______"->id,
  byeQueue: [],
  date: Js.Date.fromString("2019-06-14T11:40:34.407Z"),
  playerIds: Set.fromArray(
    ~id=Id.id,
    [
      newbieMcNewberson.id,
      grandyMcMaster.id,
      joelRobinson.id,
      drClaytonForrester.id,
      tvsFrank.id,
      crowTRobot.id,
      tomServo.id,
      gypsy.id,
    ],
  ),
  scoreAdjustments: Map.make(~id=Id.id),
  roundList: [
    [
      {
        id: "KdLva8hWqYHdaU9KnFTe2"->id,
        result: BlackWon,
        whiteNewRating: 1699,
        blackNewRating: 2600,
        whiteOrigRating: 1700,
        blackOrigRating: 2600,
        whiteId: crowTRobot.id,
        blackId: grandyMcMaster.id,
      },
      {
        id: "WDPFsNF1yADs4qofFwCY0"->id,
        result: WhiteWon,
        whiteNewRating: 1650,
        blackNewRating: 2389,
        whiteOrigRating: 1600,
        blackOrigRating: 2400,
        whiteId: gypsy.id,
        blackId: joelRobinson.id,
      },
      {
        id: "R5sXfTOJw5vrJ4IytAjSi"->id,
        result: BlackWon,
        whiteNewRating: 1400,
        blackNewRating: 2100,
        whiteOrigRating: 1400,
        blackOrigRating: 2100,
        whiteId: tvsFrank.id,
        blackId: drClaytonForrester.id,
      },
      {
        id: "2YOsn_JJFnaUMhRBAc9KY"->id,
        result: WhiteWon,
        whiteNewRating: 1597,
        blackNewRating: 1728,
        whiteOrigRating: 800,
        blackOrigRating: 1800,
        whiteId: newbieMcNewberson.id,
        blackId: tomServo.id,
      },
    ]->Rounds.Round.fromArray,
    Rounds.Round.empty,
  ]->Rounds.fromArray,
  tieBreaks: [Median, Solkoff, Cumulative, CumulativeOfOpposition],
  name: "Simple Pairing",
}
let deletedPlayerTourney: Tournament.t = {
  id: "Deleted_Player_Torney"->id,
  byeQueue: [deletedPlayer],
  date: Js.Date.fromString("2020-12-24T11:40:34.407Z"),
  playerIds: Set.fromArray(
    ~id=Id.id,
    [
      newbieMcNewberson.id,
      grandyMcMaster.id,
      joelRobinson.id,
      drClaytonForrester.id,
      tvsFrank.id,
      crowTRobot.id,
      tomServo.id,
      deletedPlayer,
    ],
  ),
  scoreAdjustments: Map.make(~id=Id.id),
  roundList: [
    [
      {
        id: "KdLva8hWqYHdaU9KnFTe2"->id,
        result: BlackWon,
        whiteNewRating: 1699,
        blackNewRating: 2600,
        whiteOrigRating: 1700,
        blackOrigRating: 2600,
        whiteId: crowTRobot.id,
        blackId: grandyMcMaster.id,
      },
      {
        id: "WDPFsNF1yADs4qofFwCY0"->id,
        result: WhiteWon,
        whiteNewRating: 1650,
        blackNewRating: 2389,
        whiteOrigRating: 1600,
        blackOrigRating: 2400,
        whiteId: deletedPlayer,
        blackId: joelRobinson.id,
      },
      {
        id: "R5sXfTOJw5vrJ4IytAjSi"->id,
        result: BlackWon,
        whiteNewRating: 1400,
        blackNewRating: 2100,
        whiteOrigRating: 1400,
        blackOrigRating: 2100,
        whiteId: tvsFrank.id,
        blackId: drClaytonForrester.id,
      },
      {
        id: "2YOsn_JJFnaUMhRBAc9KY"->id,
        result: WhiteWon,
        whiteNewRating: 1597,
        blackNewRating: 1728,
        whiteOrigRating: 800,
        blackOrigRating: 1800,
        whiteId: newbieMcNewberson.id,
        blackId: tomServo.id,
      },
    ]->Rounds.Round.fromArray,
    Rounds.Round.empty,
  ]->Rounds.fromArray,
  tieBreaks: [Median, Solkoff, Cumulative, CumulativeOfOpposition],
  name: "Deleted Player",
}
let pairingWithDraws: Tournament.t = {
  id: "Pairing_With_Draws___"->id,
  byeQueue: [],
  date: Js.Date.fromString("2019-06-14T14:18:06.686Z"),
  playerIds: Set.fromArray(
    ~id=Id.id,
    [
      newbieMcNewberson.id,
      grandyMcMaster.id,
      joelRobinson.id,
      drClaytonForrester.id,
      tvsFrank.id,
      crowTRobot.id,
      tomServo.id,
      gypsy.id,
    ],
  ),
  scoreAdjustments: Map.make(~id=Id.id),
  roundList: [
    [
      {
        id: "ryWXwvFGwBKQqGBbMYeps"->id,
        result: BlackWon,
        whiteNewRating: 1699,
        blackNewRating: 2600,
        whiteOrigRating: 1700,
        blackOrigRating: 2600,
        whiteId: crowTRobot.id,
        blackId: grandyMcMaster.id,
      },
      {
        id: "2KKVbi0AfNxfJAJobTgP5"->id,
        result: WhiteWon,
        whiteNewRating: 1650,
        blackNewRating: 2389,
        whiteOrigRating: 1600,
        blackOrigRating: 2400,
        whiteId: gypsy.id,
        blackId: joelRobinson.id,
      },
      {
        id: "zdlBHBAqgV2qabn2oBa2a"->id,
        result: BlackWon,
        whiteNewRating: 1400,
        blackNewRating: 2100,
        whiteOrigRating: 1400,
        blackOrigRating: 2100,
        whiteId: tvsFrank.id,
        blackId: drClaytonForrester.id,
      },
      {
        id: "8fGxU3tLpd8GibuSQr9-Y"->id,
        result: Draw,
        whiteNewRating: 1197,
        blackNewRating: 1764,
        whiteOrigRating: 800,
        blackOrigRating: 1800,
        whiteId: newbieMcNewberson.id,
        blackId: tomServo.id,
      },
    ]->Rounds.Round.fromArray,
    Rounds.Round.empty,
  ]->Rounds.fromArray,
  tieBreaks: [Median, Solkoff, Cumulative, CumulativeOfOpposition],
  name: "Pairing with draws",
}
let scoreTest: Tournament.t = {
  {
    id: "WY_AzAeDDZeHMbhgUVuum"->id,
    name: "Score testing",
    date: Js.Date.fromString("2020-06-28T12:42:46.347Z"),
    playerIds: Set.fromArray(
      ~id=Id.id,
      [
        joelRobinson.id,
        mike.id,
        bobo.id,
        tomServo.id,
        tvsSon.id,
        tvsFrank.id,
        cambot.id,
        drClaytonForrester.id,
        crowTRobot.id,
        pearl.id,
        observer.id,
        kinga.id,
        jonah.id,
      ],
    ),
    byeQueue: [],
    tieBreaks: [Median, Solkoff, Cumulative, CumulativeOfOpposition],
    roundList: [
      [
        {
          id: "IPRs48UZ3ubxbyzs9-Aj8"->id,
          whiteId: joelRobinson.id,
          blackId: tomServo.id,
          whiteNewRating: 2400,
          blackNewRating: 1798,
          whiteOrigRating: 2400,
          blackOrigRating: 1800,
          result: WhiteWon,
        },
        {
          id: "tcrk4_Eze6YB1jfgFxMg2"->id,
          whiteId: crowTRobot.id,
          blackId: mike.id,
          whiteNewRating: 1695,
          blackNewRating: 2300,
          whiteOrigRating: 1700,
          blackOrigRating: 2300,
          result: BlackWon,
        },
        {
          id: "g30WVQazEVlyFZoB_iKNP"->id,
          whiteId: cambot.id,
          blackId: jonah.id,
          whiteNewRating: 1531,
          blackNewRating: 2184,
          whiteOrigRating: 1500,
          blackOrigRating: 2200,
          result: WhiteWon,
        },
        {
          id: "z6z2X8Al9iNDmx2rc6iSd"->id,
          whiteId: drClaytonForrester.id,
          blackId: tvsFrank.id,
          whiteNewRating: 2080,
          blackNewRating: 1422,
          whiteOrigRating: 2100,
          blackOrigRating: 1400,
          result: BlackWon,
        },
        {
          id: "_wRcKBpFnPspJeiglbv42"->id,
          whiteId: observer.id,
          blackId: pearl.id,
          whiteNewRating: 1214,
          blackNewRating: 1974,
          whiteOrigRating: 1200,
          blackOrigRating: 2000,
          result: WhiteWon,
        },
        {
          id: "g35wmUfw3--3dZvF4Dxai"->id,
          whiteId: kinga.id,
          blackId: tvsSon.id,
          whiteNewRating: 1860,
          blackNewRating: 1112,
          whiteOrigRating: 1900,
          blackOrigRating: 1100,
          result: BlackWon,
        },
        {
          id: "ZFwPgPSrdR0dsiROQpZmq"->id,
          whiteId: bobo.id,
          blackId: Data.Id.dummy,
          whiteNewRating: 1000,
          blackNewRating: 0,
          whiteOrigRating: 1000,
          blackOrigRating: 0,
          result: WhiteWon,
        },
      ]->Rounds.Round.fromArray,
      [
        {
          id: "gvr8PMNdqVwvMHpQZhxKW"->id,
          whiteId: tvsFrank.id,
          blackId: joelRobinson.id,
          whiteNewRating: 1444,
          blackNewRating: 2389,
          whiteOrigRating: 1422,
          blackOrigRating: 2400,
          result: WhiteWon,
        },
        {
          id: "n02yWL6MNgkS19IREj_Df"->id,
          whiteId: mike.id,
          blackId: observer.id,
          whiteNewRating: 2287,
          blackNewRating: 1228,
          whiteOrigRating: 2300,
          blackOrigRating: 1214,
          result: BlackWon,
        },
        {
          id: "Luic7R_pGjZmSYxN1uNmc"->id,
          whiteId: tvsSon.id,
          blackId: cambot.id,
          whiteNewRating: 1123,
          blackNewRating: 1503,
          whiteOrigRating: 1112,
          blackOrigRating: 1531,
          result: WhiteWon,
        },
        {
          id: "Ew_xdm0tKHE1423CYoApT"->id,
          whiteId: pearl.id,
          blackId: bobo.id,
          whiteNewRating: 1949,
          blackNewRating: 1010,
          whiteOrigRating: 1974,
          blackOrigRating: 1000,
          result: BlackWon,
        },
        {
          id: "steThF-oNT-fBZe4AUHjc"->id,
          whiteId: jonah.id,
          blackId: kinga.id,
          whiteNewRating: 2186,
          blackNewRating: 1855,
          whiteOrigRating: 2184,
          blackOrigRating: 1860,
          result: WhiteWon,
        },
        {
          id: "3QPqo0tMvKVzgaQOFjezL"->id,
          whiteId: tomServo.id,
          blackId: drClaytonForrester.id,
          whiteNewRating: 1786,
          blackNewRating: 2083,
          whiteOrigRating: 1798,
          blackOrigRating: 2080,
          result: BlackWon,
        },
        {
          id: "BsbnpljVf9OagbfT8sUhJ"->id,
          whiteId: crowTRobot.id,
          blackId: Data.Id.dummy,
          whiteNewRating: 1695,
          blackNewRating: 0,
          whiteOrigRating: 1695,
          blackOrigRating: 0,
          result: WhiteWon,
        },
      ]->Rounds.Round.fromArray,
      [
        {
          id: "lqRRkcPXADxNcZoYNUs4O"->id,
          whiteId: bobo.id,
          blackId: tvsFrank.id,
          whiteNewRating: 1019,
          blackNewRating: 1425,
          whiteOrigRating: 1010,
          blackOrigRating: 1444,
          result: WhiteWon,
        },
        {
          id: "tFw25nJzFa1DNC3kEBlvL"->id,
          whiteId: observer.id,
          blackId: tvsSon.id,
          whiteNewRating: 1219,
          blackNewRating: 1130,
          whiteOrigRating: 1228,
          blackOrigRating: 1123,
          result: BlackWon,
        },
        {
          id: "4s3IVU-DxR2itlDt6Pbry"->id,
          whiteId: drClaytonForrester.id,
          blackId: jonah.id,
          whiteNewRating: 2095,
          blackNewRating: 2176,
          whiteOrigRating: 2083,
          blackOrigRating: 2186,
          result: WhiteWon,
        },
        {
          id: "-J00pFQGNydkCVJ9IY57T"->id,
          whiteId: cambot.id,
          blackId: mike.id,
          whiteNewRating: 1503,
          blackNewRating: 2287,
          whiteOrigRating: 1503,
          blackOrigRating: 2287,
          result: BlackWon,
        },
        {
          id: "aN_Nzb1GFvoIT1Dlu3bn9"->id,
          whiteId: joelRobinson.id,
          blackId: pearl.id,
          whiteNewRating: 2390,
          blackNewRating: 1947,
          whiteOrigRating: 2389,
          blackOrigRating: 1949,
          result: WhiteWon,
        },
        {
          id: "taKyrpJg9XpACuWq16bum"->id,
          whiteId: kinga.id,
          blackId: crowTRobot.id,
          whiteNewRating: 1829,
          blackNewRating: 1790,
          whiteOrigRating: 1855,
          blackOrigRating: 1695,
          result: BlackWon,
        },
        {
          id: "Rh_UVxVKowtjSpeH-4Xwc"->id,
          whiteId: tomServo.id,
          blackId: Data.Id.dummy,
          whiteNewRating: 1786,
          blackNewRating: 0,
          whiteOrigRating: 1786,
          blackOrigRating: 0,
          result: WhiteWon,
        },
      ]->Rounds.Round.fromArray,
      []->Rounds.Round.fromArray,
    ]->Rounds.fromArray,
    scoreAdjustments: Map.make(~id=Id.id),
  }
}

let dictToMap = dict => dict->Js.Dict.entries->Data.Id.Map.fromStringArray

@raises(Not_found)
let decode = json => {
  {
    "config": Config.decode(json["config"]),
    "players": json["players"]
    ->Js.Json.decodeObject
    ->Option.getExn
    ->dictToMap
    ->Map.map(Player.decode),
    "tournaments": json["tournaments"]
    ->Js.Json.decodeObject
    ->Option.getExn
    ->dictToMap
    ->Map.map(Tournament.decode),
  }
}

@module("./fixture-pairing-april-2022.json")
external fixturePairingApril22: {
  "config": Js.Json.t,
  "players": Js.Json.t,
  "tournaments": Js.Json.t,
} = "default"

let fixturePairingApril22 = decode(fixturePairingApril22)

let mapMerger = (k, a, b) =>
  switch (a, b) {
  | (Some(_) as x, None) | (None, Some(_) as x) => x
  | (Some(_), Some(_)) => failwith("Duplicate " ++ Id.toString(k))
  | (None, None) => None
  }

let config: Config.t = {
  byeValue: Full,
  avoidPairs: [
    (tvsFrank.id, tvsSon.id),
    (pearl.id, drClaytonForrester.id),
    (kinga.id, drClaytonForrester.id),
    (kinga.id, pearl.id),
  ]
  ->Array.keepMap(((a, b)) => Id.Pair.make(a, b))
  ->Set.fromArray(~id=Id.Pair.id),
  lastBackup: Js.Date.fromString("1970-01-01T00:00:00.000Z"),
  whiteAlias: Config.aliasEmpty,
  blackAlias: Config.aliasEmpty,
}

let players =
  Map.fromArray(
    ~id=Id.id,
    [
      (cambot.id, cambot),
      (crowTRobot.id, crowTRobot),
      (drClaytonForrester.id, drClaytonForrester),
      (grandyMcMaster.id, grandyMcMaster),
      (gypsy.id, gypsy),
      (joelRobinson.id, joelRobinson),
      (jonah.id, jonah),
      (kinga.id, kinga),
      (larry.id, larry),
      (mike.id, mike),
      (newbieMcNewberson.id, newbieMcNewberson),
      (observer.id, observer),
      (pearl.id, pearl),
      (bobo.id, bobo),
      (tvsFrank.id, tvsFrank),
      (tvsSon.id, tvsSon),
      (tomServo.id, tomServo),
    ],
  )->Map.merge(fixturePairingApril22["players"], mapMerger)

let tournaments =
  Map.fromArray(
    ~id=Id.id,
    [
      (byeRoundTourney.id, byeRoundTourney),
      (byeRoundTourney2.id, byeRoundTourney2),
      (byeRoundTourney3.id, byeRoundTourney3),
      (simplePairing.id, simplePairing),
      (pairingWithDraws.id, pairingWithDraws),
      (scoreTest.id, scoreTest),
      (deletedPlayerTourney.id, deletedPlayerTourney),
    ],
  )->Map.merge(fixturePairingApril22["tournaments"], mapMerger)
