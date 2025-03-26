/*
  Copyright (c) 2021 John Jackson. 

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
open! Belt
open Data
module Id = Data.Id
let id = Data.Id.fromString
let nat = Data.Player.NatInt.fromInt
let batman = "BruceWayne_lv_ZsUHTU9"->id
let robin = "DickGrayson_1C2rCokHH"->id
let alfred = "AlfredPennyworth_y4dW"->id
let barbara = "BarbaraGordon_cL6SpI2"->id
let batwoman = "KateKane_klFW6gDfUOTX"->id
let catwoman = "SelinaKyle_rJBH-45Xoy"->id
let jason = "JasonTodd_fc9CeOa-Luw"->id
let james = "JamesGordon_1ts9xICT3"->id
let huntress = "HelenaWayne_fE6O0DJcE"->id
let joker = "Joker_v0z2416fpAZ9o2c"->id
let harley = "HarleyQuinn_-10-02VPH"->id
let freeze = "VictorFries_cWaQoW014"->id
let penguin = "OswaldCobblepot_lfCro"->id
let ras = "RasAlGhul_k9n8k852bHr"->id
let poisonivy = "PamelaIsley_vH5vD8uPB"->id
let riddler = "EdwardNigma_j80JfWOZq"->id
let scarecrow = "JonathanCrane_R4Q8tVW"->id
let twoface = "HarveyDent_0eYIiP_Ij5"->id
let hugo = "HugoStrange_az43f9mtS"->id

let config: Config.t = {
  byeValue: Full,
  avoidPairs: [(barbara, james), (joker, harley), (huntress, batman)]
  ->Array.keepMap(((a, b)) => Id.Pair.make(a, b))
  ->Set.fromArray(~id=Id.Pair.id),
  lastBackup: Js.Date.fromString("1970-01-01T00:00:00.000Z"),
  whiteAlias: Config.aliasEmpty,
  blackAlias: Config.aliasEmpty,
}

let players = Map.fromArray(
  ~id=Id.id,
  [
    (
      batman,
      {
        Player.id: batman,
        type_: Person,
        firstName: "Bruce",
        lastName: "Wayne",
        rating: 1998,
        matchCount: nat(9),
      },
    ),
    (
      robin,
      {
        id: robin,
        type_: Person,
        firstName: "Dick",
        lastName: "Grayson",
        rating: 1909,
        matchCount: nat(9),
      },
    ),
    (
      alfred,
      {
        id: alfred,
        type_: Person,
        firstName: "Alfred",
        lastName: "Pennyworth",
        rating: 1999,
        matchCount: nat(9),
      },
    ),
    (
      barbara,
      {
        id: barbara,
        type_: Person,
        firstName: "Barbara",
        lastName: "Gordon",
        rating: 1345,
        matchCount: nat(7),
      },
    ),
    (
      batwoman,
      {
        id: batwoman,
        type_: Person,
        firstName: "Kate",
        lastName: "Kane",
        rating: 1539,
        matchCount: nat(9),
      },
    ),
    (
      catwoman,
      {
        id: catwoman,
        type_: Person,
        firstName: "Selina",
        lastName: "Kyle",
        rating: 1495,
        matchCount: nat(9),
      },
    ),
    (
      jason,
      {
        id: jason,
        type_: Person,
        firstName: "Jason",
        lastName: "Todd",
        rating: 1101,
        matchCount: nat(7),
      },
    ),
    (
      james,
      {
        id: james,
        type_: Person,
        firstName: "James",
        lastName: "Gordon",
        rating: 1167,
        matchCount: nat(7),
      },
    ),
    (
      huntress,
      {
        id: huntress,
        type_: Person,
        firstName: "Helena",
        lastName: "Wayne",
        rating: 1087,
        matchCount: nat(7),
      },
    ),
    (
      joker,
      {
        id: joker,
        type_: Person,
        firstName: "Joker",
        lastName: "",
        rating: 1538,
        matchCount: nat(1),
      },
    ),
    (
      harley,
      {
        id: harley,
        type_: Person,
        firstName: "Harley",
        lastName: "Quinn",
        rating: 1648,
        matchCount: nat(1),
      },
    ),
    (
      freeze,
      {
        id: freeze,
        type_: Person,
        firstName: "Victor",
        lastName: "Fries",
        rating: 862,
        matchCount: nat(1),
      },
    ),
    (
      penguin,
      {
        id: penguin,
        type_: Person,
        firstName: "Oswald",
        lastName: "Cobblepot",
        rating: 1812,
        matchCount: nat(1),
      },
    ),
    (
      ras,
      {
        id: ras,
        type_: Person,
        firstName: "Ra's",
        lastName: "al Ghul",
        rating: 1404,
        matchCount: nat(1),
      },
    ),
    (
      poisonivy,
      {
        id: poisonivy,
        type_: Person,
        firstName: "Pamela",
        lastName: "Isley",
        rating: 965,
        matchCount: nat(1),
      },
    ),
    (
      riddler,
      {
        id: riddler,
        type_: Person,
        firstName: "Edward",
        lastName: "Nigma",
        rating: 948,
        matchCount: nat(1),
      },
    ),
    (
      scarecrow,
      {
        id: scarecrow,
        type_: Person,
        firstName: "Jonathan",
        lastName: "Crane",
        rating: 899,
        matchCount: nat(1),
      },
    ),
    (
      twoface,
      {
        id: twoface,
        type_: Person,
        firstName: "Harvey",
        lastName: "Dent",
        rating: 1649,
        matchCount: nat(1),
      },
    ),
    (
      hugo,
      {
        id: hugo,
        type_: Person,
        firstName: "Hugo",
        lastName: "Strange",
        rating: 800,
        matchCount: nat(0),
      },
    ),
  ],
)

let tournaments = Map.fromArray(
  ~id=Id.id,
  [
    (
      "CaouTNel9k70jUJ0h6SYM"->id,
      {
        Tournament.date: Js.Date.fromString("2019-05-22T12:14:47.670Z"),
        id: "CaouTNel9k70jUJ0h6SYM"->id,
        name: "Wayne Manor Open",
        tieBreaks: [Median, Solkoff, Cumulative, CumulativeOfOpposition],
        byeQueue: [],
        playerIds: Set.fromArray(
          ~id=Id.id,
          [batman, robin, alfred, barbara, batwoman, catwoman, jason, james, huntress],
        ),
        scoreAdjustments: Map.make(~id=Id.id),
        roundList: [
          [
            {
              id: "FUASEeyES6ez_ROoT6qmU"->id,
              whiteId: jason,
              blackId: robin,
              result: BlackWon,
              whiteOrigRating: 1238,
              blackOrigRating: 2108,
              whiteNewRating: 1236,
              blackNewRating: 2109,
            },
            {
              id: "gqPyD66QMPF-pup41xsB2"->id,
              whiteId: james,
              blackId: alfred,
              result: BlackWon,
              whiteOrigRating: 1049,
              blackOrigRating: 2260,
              whiteNewRating: 1049,
              blackNewRating: 2260,
            },
            {
              id: "KpS1lQSzsQWQ3VVWJyA2P"->id,
              whiteId: batwoman,
              blackId: barbara,
              result: Draw,
              whiteOrigRating: 1527,
              blackOrigRating: 1755,
              whiteNewRating: 1553,
              blackNewRating: 1722,
            },
            {
              id: "OgFuy-wq8mz378EWat46u"->id,
              whiteId: catwoman,
              blackId: batman,
              result: BlackWon,
              whiteOrigRating: 1284,
              blackOrigRating: 1881,
              whiteNewRating: 1278,
              blackNewRating: 1887,
            },
            {
              id: "f8Ps3GUmd0ZRsBBY8rZOp"->id,
              whiteId: huntress,
              blackId: Data.Id.dummy,
              result: WhiteWon,
              whiteOrigRating: 831,
              blackOrigRating: 0,
              whiteNewRating: 831,
              blackNewRating: 0,
            },
          ]->Rounds.Round.fromArray,
          [
            {
              id: "6seKrw7ehbhL766g6L2PF"->id,
              whiteId: robin,
              blackId: batwoman,
              result: WhiteWon,
              whiteOrigRating: 2109,
              blackOrigRating: 1685,
              whiteNewRating: 2122,
              blackNewRating: 1672,
            },
            {
              id: "TCSjz48ZXqjamtYUFNg0B"->id,
              whiteId: batman,
              blackId: huntress,
              result: WhiteWon,
              whiteOrigRating: 1887,
              blackOrigRating: 831,
              whiteNewRating: 1887,
              blackNewRating: 830,
            },
            {
              id: "zF64DEsN8sHydpDDsg37E"->id,
              whiteId: alfred,
              blackId: catwoman,
              result: BlackWon,
              whiteOrigRating: 2260,
              blackOrigRating: 1278,
              whiteNewRating: 2101,
              blackNewRating: 1437,
            },
            {
              id: "qVGt1EJq9y0MmvFtumM0A"->id,
              whiteId: barbara,
              blackId: jason,
              result: WhiteWon,
              whiteOrigRating: 1545,
              blackOrigRating: 1236,
              whiteNewRating: 1574,
              blackNewRating: 1207,
            },
            {
              id: "UhfHaRWr_-BtVo22xAuJu"->id,
              whiteId: james,
              blackId: Data.Id.dummy,
              result: WhiteWon,
              whiteOrigRating: 1049,
              blackOrigRating: 0,
              whiteNewRating: 1049,
              blackNewRating: 0,
            },
          ]->Rounds.Round.fromArray,
          [
            {
              id: "odrOOnZJUe0YAwkfUDqUb"->id,
              whiteId: alfred,
              blackId: batman,
              result: BlackWon,
              whiteOrigRating: 2101,
              blackOrigRating: 1887,
              whiteNewRating: 1998,
              blackNewRating: 1990,
            },
            {
              id: "qzCMqUwNIDAcFSAuA5yCm"->id,
              whiteId: huntress,
              blackId: robin,
              result: WhiteWon,
              whiteOrigRating: 830,
              blackOrigRating: 2122,
              whiteNewRating: 990,
              blackNewRating: 2008,
            },
            {
              id: "6QgVqdtcJPjfVp3UZ8S9g"->id,
              whiteId: catwoman,
              blackId: barbara,
              result: WhiteWon,
              whiteOrigRating: 1437,
              blackOrigRating: 1574,
              whiteNewRating: 1529,
              blackNewRating: 1464,
            },
            {
              id: "as45gODKMLC5-3_UsTyx5"->id,
              whiteId: batwoman,
              blackId: james,
              result: BlackWon,
              whiteOrigRating: 1672,
              blackOrigRating: 1049,
              whiteNewRating: 1542,
              blackNewRating: 1244,
            },
            {
              id: "Pc0CWecSfeGNfvBPjyEIj"->id,
              whiteId: jason,
              blackId: Data.Id.dummy,
              result: WhiteWon,
              whiteOrigRating: 1207,
              blackOrigRating: 0,
              whiteNewRating: 1207,
              blackNewRating: 0,
            },
          ]->Rounds.Round.fromArray,
          [
            {
              id: "xj0y_Iqkb-g3MDGgmYx2-"->id,
              whiteId: batman,
              blackId: batwoman,
              result: WhiteWon,
              whiteOrigRating: 1990,
              blackOrigRating: 1542,
              whiteNewRating: 1998,
              blackNewRating: 1534,
            },
            {
              id: "HWYWtsyaqUkHRExM6kQrt"->id,
              whiteId: robin,
              blackId: james,
              result: WhiteWon,
              whiteOrigRating: 2008,
              blackOrigRating: 1244,
              whiteNewRating: 2009,
              blackNewRating: 1243,
            },
            {
              id: "uAzHZVMC71liQZ-6fWWeD"->id,
              whiteId: huntress,
              blackId: catwoman,
              result: BlackWon,
              whiteOrigRating: 990,
              blackOrigRating: 1529,
              whiteNewRating: 983,
              blackNewRating: 1534,
            },
            {
              id: "_tCBn9YNIyto-vXpxm7WI"->id,
              whiteId: jason,
              blackId: alfred,
              result: BlackWon,
              whiteOrigRating: 1207,
              blackOrigRating: 1998,
              whiteNewRating: 1205,
              blackNewRating: 1999,
            },
            {
              id: "L7yatE2oVKlV7LOY6-d7Y"->id,
              whiteId: barbara,
              blackId: Data.Id.dummy,
              result: WhiteWon,
              whiteOrigRating: 1464,
              blackOrigRating: 0,
              whiteNewRating: 1464,
              blackNewRating: 0,
            },
          ]->Rounds.Round.fromArray,
        ]->Rounds.fromArray,
      },
    ),
    (
      "tvAdS4YbSOznrBgrg0ITA"->id,
      {
        date: Js.Date.fromString("2019-05-29T12:15:20.593Z"),
        id: "tvAdS4YbSOznrBgrg0ITA"->id,
        name: "The Battle for Gotham City",
        tieBreaks: [Median, Solkoff, Cumulative, CumulativeOfOpposition],
        byeQueue: [],
        playerIds: Set.fromArray(
          ~id=Id.id,
          [
            batman,
            robin,
            alfred,
            barbara,
            batwoman,
            catwoman,
            jason,
            james,
            huntress,
            joker,
            harley,
            freeze,
            penguin,
            ras,
            poisonivy,
            riddler,
            scarecrow,
            twoface,
          ],
        ),
        scoreAdjustments: Map.make(~id=Id.id),
        roundList: [
          [
            {
              id: "5f8GYcR8V44NYvTN1cZle"->id,
              whiteId: riddler,
              blackId: batman,
              result: BlackWon,
              whiteOrigRating: 950,
              blackOrigRating: 1998,
              whiteNewRating: 948,
              blackNewRating: 1998,
            },
            {
              id: "GPTct4sL368SryTLFUu8E"->id,
              whiteId: scarecrow,
              blackId: alfred,
              result: BlackWon,
              whiteOrigRating: 900,
              blackOrigRating: 1999,
              whiteNewRating: 899,
              blackNewRating: 1999,
            },
            {
              id: "AxtoztZ6O19nyrLfZ4YaU"->id,
              whiteId: twoface,
              blackId: robin,
              result: WhiteWon,
              whiteOrigRating: 850,
              blackOrigRating: 2009,
              whiteNewRating: 1649,
              blackNewRating: 1909,
            },
            {
              id: "bUM_tWQsAtPe1gqRzlXd1"->id,
              whiteId: ras,
              blackId: catwoman,
              result: Draw,
              whiteOrigRating: 1050,
              blackOrigRating: 1534,
              whiteNewRating: 1404,
              blackNewRating: 1495,
            },
            {
              id: "bAOVlP-M5xaPk1qofNReb"->id,
              whiteId: penguin,
              blackId: barbara,
              result: WhiteWon,
              whiteOrigRating: 1100,
              blackOrigRating: 1464,
              whiteNewRating: 1812,
              blackNewRating: 1345,
            },
            {
              id: "4omlgiGSaE1BmrHdABSym"->id,
              whiteId: poisonivy,
              blackId: batwoman,
              result: BlackWon,
              whiteOrigRating: 1000,
              blackOrigRating: 1534,
              whiteNewRating: 965,
              blackNewRating: 1539,
            },
            {
              id: "ysdEVYS2AyuKyOAwLLpTF"->id,
              whiteId: harley,
              blackId: james,
              result: WhiteWon,
              whiteOrigRating: 1200,
              blackOrigRating: 1242,
              whiteNewRating: 1648,
              blackNewRating: 1167,
            },
            {
              id: "YoJ9WGokAYrmJjfxCCf87"->id,
              whiteId: freeze,
              blackId: joker,
              result: BlackWon,
              whiteOrigRating: 1150,
              blackOrigRating: 1250,
              whiteNewRating: 862,
              blackNewRating: 1538,
            },
            {
              id: "Az7SBl3cs7rbwKPBI0IsU"->id,
              whiteId: huntress,
              blackId: jason,
              result: WhiteWon,
              whiteOrigRating: 983,
              blackOrigRating: 1205,
              whiteNewRating: 1087,
              blackNewRating: 1101,
            },
          ]->Rounds.Round.fromArray,
          Rounds.Round.empty,
        ]->Rounds.fromArray,
      },
    ),
  ],
)
