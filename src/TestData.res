open Data
let id = Id.fromString

let byeRoundTourney = "Bye_Round_Tourney____"->id
let byeRoundTourney2 = "Bye_Round_Tourney_2__"->id
let byeRoundTourney3 = "Bye_Tourney_3________"->id
let simplePairing = "Simple_Pairing_______"->id
let deletedPlayerTourney = "Deleted_Player_Torney"->id
let pairingWithDraws = "Pairing_With_Draws___"->id
let scoreTest = "WY_AzAeDDZeHMbhgUVuum"->id

let crowTRobot = "Crow_T_Robot_________"->id
let drClaytonForrester = "Dr_Clayton_Forrester_"->id
let grandyMcMaster = "Grandy_McMaster______"->id
let gypsy = "Gypsy________________"->id
let joelRobinson = "Joel_Robinson________"->id
let newbieMcNewberson = "Newbie_McNewberson___"->id
let tomServo = "Tom_Servo____________"->id
let tvsFrank = "TVs_Frank____________"->id
let cambot = "Cambot_______________"->id
let jonah = "Jonah_Heston_________"->id
let kinga = "Kinga_Forrester______"->id
let larry = "Larry_Erhardt________"->id
let mike = "Mike_Nelson__________"->id
let observer = "Observer_Brain_Guy___"->id
let pearl = "Pearl_Forrester______"->id
let bobo = "Professor_Bobo_______"->id
let tvsSon = "TVs_Son_of_TVs_Frank_"->id
let deletedPlayer = "Deleted_Player_______"->id

let config: Config.t = {
  byeValue: Full,
  avoidPairs: [
    (tvsFrank, tvsSon),
    (pearl, drClaytonForrester),
    (kinga, drClaytonForrester),
    (kinga, pearl),
  ]
  ->Belt.Array.keepMap(((a, b)) => Config.Pair.make(a, b))
  ->Config.Pair.Set.fromArray,
  lastBackup: Js.Date.fromString("1970-01-01T00:00:00.000Z"),
}

let players = Data.Id.Map.fromArray([
  (
    cambot,
    {
      Player.id: cambot,
      matchCount: 25,
      rating: 1500,
      type_: Person,
      firstName: "Cambot",
      lastName: "",
    },
  ),
  (
    crowTRobot,
    {
      id: crowTRobot,
      matchCount: 5,
      rating: 1700,
      type_: Person,
      firstName: "Crow T",
      lastName: "Robot",
    },
  ),
  (
    drClaytonForrester,
    {
      id: drClaytonForrester,
      matchCount: 40,
      rating: 2100,
      type_: Person,
      firstName: "Clayton",
      lastName: "Forrester",
    },
  ),
  (
    grandyMcMaster,
    {
      id: grandyMcMaster,
      matchCount: 100,
      rating: 2600,
      type_: Person,
      firstName: "Grandy",
      lastName: "McMaster",
    },
  ),
  (
    gypsy,
    {
      id: gypsy,
      matchCount: 15,
      rating: 1600,
      type_: Person,
      firstName: "Gypsy",
      lastName: "",
    },
  ),
  (
    joelRobinson,
    {
      id: joelRobinson,
      matchCount: 70,
      rating: 2400,
      type_: Person,
      firstName: "Joel",
      lastName: "Robinson",
    },
  ),
  (
    jonah,
    {
      id: jonah,
      matchCount: 50,
      rating: 2200,
      type_: Person,
      firstName: "Jonah",
      lastName: "Heston",
    },
  ),
  (
    kinga,
    {
      id: kinga,
      matchCount: 20,
      rating: 1900,
      type_: Person,
      firstName: "Kinga",
      lastName: "Forrester",
    },
  ),
  (
    larry,
    {
      id: larry,
      matchCount: 45,
      rating: 1300,
      type_: Person,
      firstName: "Larry",
      lastName: "Erhardt",
    },
  ),
  (
    mike,
    {
      id: mike,
      matchCount: 60,
      rating: 2300,
      type_: Person,
      firstName: "Mike",
      lastName: "Nelson",
    },
  ),
  (
    newbieMcNewberson,
    {
      id: newbieMcNewberson,
      matchCount: 0,
      rating: 800,
      type_: Person,
      firstName: "Newbie",
      lastName: "McNewberson",
    },
  ),
  (
    observer,
    {
      id: observer,
      matchCount: 55,
      rating: 1200,
      type_: Person,
      firstName: "Brain",
      lastName: "Guy",
    },
  ),
  (
    pearl,
    {
      id: pearl,
      matchCount: 30,
      rating: 2000,
      type_: Person,
      firstName: "Pearl",
      lastName: "Forrester",
    },
  ),
  (
    bobo,
    {
      id: bobo,
      matchCount: 75,
      rating: 1000,
      type_: Person,
      firstName: "Bobo",
      lastName: "Professor",
    },
  ),
  (
    tvsFrank,
    {
      id: tvsFrank,
      matchCount: 35,
      rating: 1400,
      type_: Person,
      firstName: "TV's",
      lastName: "Frank",
    },
  ),
  (
    tvsSon,
    {
      id: tvsSon,
      matchCount: 65,
      rating: 1100,
      type_: Person,
      firstName: "TV's",
      lastName: "Max",
    },
  ),
  (
    tomServo,
    {
      id: tomServo,
      matchCount: 10,
      rating: 1800,
      type_: Person,
      firstName: "Tom",
      lastName: "Servo",
    },
  ),
])

let tournaments = Data.Id.Map.fromArray([
  (
    byeRoundTourney,
    {
      Tournament.byeQueue: [],
      date: Js.Date.fromString("2019-06-12T23:49:47.103Z"),
      id: byeRoundTourney,
      playerIds: list{
        joelRobinson,
        crowTRobot,
        tomServo,
        gypsy,
        cambot,
        newbieMcNewberson,
        grandyMcMaster,
      },
      scoreAdjustments: Data.Id.Map.make(),
      roundList: Rounds.empty,
      tieBreaks: [Median, Solkoff, Cumulative, CumulativeOfOpposition],
      name: "Bye Round Tourney",
    },
  ),
  (
    byeRoundTourney2,
    {
      byeQueue: [],
      date: Js.Date.fromString("2019-06-12T23:49:47.103Z"),
      id: byeRoundTourney2,
      playerIds: list{
        joelRobinson,
        crowTRobot,
        tomServo,
        gypsy,
        cambot,
        newbieMcNewberson,
        grandyMcMaster,
      },
      scoreAdjustments: Data.Id.Map.make(),
      roundList: [
        [
          {
            id: "xTXxZHB0sTt__xIAg45fm"->id,
            result: BlackWon,
            whiteNewRating: 2592,
            blackNewRating: 1833,
            whiteOrigRating: 2600,
            blackOrigRating: 1700,
            whiteId: grandyMcMaster,
            blackId: crowTRobot,
          },
          {
            id: "zQcf9RWXK7iuU6ibPzrhU"->id,
            result: WhiteWon,
            whiteNewRating: 2400,
            blackNewRating: 1600,
            whiteOrigRating: 2400,
            blackOrigRating: 1600,
            whiteId: joelRobinson,
            blackId: gypsy,
          },
          {
            id: "Vw_X0c7O4vshrYEO-oSzR"->id,
            result: BlackWon,
            whiteNewRating: 1738,
            blackNewRating: 1526,
            whiteOrigRating: 1800,
            blackOrigRating: 1500,
            whiteId: tomServo,
            blackId: cambot,
          },
          {
            id: "iSDujOVkOTrcLv_KJmd7s"->id,
            result: WhiteWon,
            whiteNewRating: 800,
            blackNewRating: 0,
            whiteOrigRating: 800,
            blackOrigRating: 0,
            whiteId: newbieMcNewberson,
            blackId: Data.Id.dummy,
          },
        ]->Rounds.Round.fromArray,
      ]->Rounds.fromArray,
      tieBreaks: [Median, Solkoff, Cumulative, CumulativeOfOpposition],
      name: "Bye Round Tourney 2",
    },
  ),
  (
    byeRoundTourney3,
    {
      byeQueue: [],
      date: Js.Date.fromString("2019-06-17T23:00:29.603Z"),
      id: byeRoundTourney3,
      playerIds: list{kinga, newbieMcNewberson, jonah},
      scoreAdjustments: Data.Id.Map.make(),
      roundList: [
        [
          {
            id: "KkFr4B7FDqiHRWmACgApf"->id,
            result: BlackWon,
            whiteNewRating: 1894,
            blackNewRating: 2202,
            whiteOrigRating: 1900,
            blackOrigRating: 2200,
            whiteId: kinga,
            blackId: jonah,
          },
          {
            id: "R_BTsGSziwgyvFZM3yc5u"->id,
            result: WhiteWon,
            whiteNewRating: 793,
            blackNewRating: 0,
            whiteOrigRating: 793,
            blackOrigRating: 0,
            whiteId: newbieMcNewberson,
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
            whiteId: jonah,
            blackId: newbieMcNewberson,
          },
          {
            id: "Nc0Om5fEuwSuzFls9wmME"->id,
            result: WhiteWon,
            whiteNewRating: 1894,
            blackNewRating: 0,
            whiteOrigRating: 1894,
            blackOrigRating: 0,
            whiteId: kinga,
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
            whiteId: newbieMcNewberson,
            blackId: kinga,
          },
          {
            id: "-kwIDxjPhWVRbqxtRZ26_"->id,
            result: WhiteWon,
            whiteNewRating: 2187,
            blackNewRating: 0,
            whiteOrigRating: 2187,
            blackOrigRating: 0,
            whiteId: jonah,
            blackId: Data.Id.dummy,
          },
        ]->Rounds.Round.fromArray,
      ]->Rounds.fromArray,
      tieBreaks: [Median, Solkoff, Cumulative, CumulativeOfOpposition],
      name: "Bye Tourney 3",
    },
  ),
  (
    simplePairing,
    {
      byeQueue: [],
      date: Js.Date.fromString("2019-06-14T11:40:34.407Z"),
      id: simplePairing,
      playerIds: list{
        newbieMcNewberson,
        grandyMcMaster,
        joelRobinson,
        drClaytonForrester,
        tvsFrank,
        crowTRobot,
        tomServo,
        gypsy,
      },
      scoreAdjustments: Data.Id.Map.make(),
      roundList: [
        [
          {
            id: "KdLva8hWqYHdaU9KnFTe2"->id,
            result: BlackWon,
            whiteNewRating: 1699,
            blackNewRating: 2600,
            whiteOrigRating: 1700,
            blackOrigRating: 2600,
            whiteId: crowTRobot,
            blackId: grandyMcMaster,
          },
          {
            id: "WDPFsNF1yADs4qofFwCY0"->id,
            result: WhiteWon,
            whiteNewRating: 1650,
            blackNewRating: 2389,
            whiteOrigRating: 1600,
            blackOrigRating: 2400,
            whiteId: gypsy,
            blackId: joelRobinson,
          },
          {
            id: "R5sXfTOJw5vrJ4IytAjSi"->id,
            result: BlackWon,
            whiteNewRating: 1400,
            blackNewRating: 2100,
            whiteOrigRating: 1400,
            blackOrigRating: 2100,
            whiteId: tvsFrank,
            blackId: drClaytonForrester,
          },
          {
            id: "2YOsn_JJFnaUMhRBAc9KY"->id,
            result: WhiteWon,
            whiteNewRating: 1597,
            blackNewRating: 1728,
            whiteOrigRating: 800,
            blackOrigRating: 1800,
            whiteId: newbieMcNewberson,
            blackId: tomServo,
          },
        ]->Rounds.Round.fromArray,
        Rounds.Round.empty,
      ]->Rounds.fromArray,
      tieBreaks: [Median, Solkoff, Cumulative, CumulativeOfOpposition],
      name: "Simple Pairing",
    },
  ),
  (
    pairingWithDraws,
    {
      byeQueue: [],
      date: Js.Date.fromString("2019-06-14T14:18:06.686Z"),
      id: pairingWithDraws,
      playerIds: list{
        newbieMcNewberson,
        grandyMcMaster,
        joelRobinson,
        drClaytonForrester,
        tvsFrank,
        crowTRobot,
        tomServo,
        gypsy,
      },
      scoreAdjustments: Data.Id.Map.make(),
      roundList: [
        [
          {
            id: "ryWXwvFGwBKQqGBbMYeps"->id,
            result: BlackWon,
            whiteNewRating: 1699,
            blackNewRating: 2600,
            whiteOrigRating: 1700,
            blackOrigRating: 2600,
            whiteId: crowTRobot,
            blackId: grandyMcMaster,
          },
          {
            id: "2KKVbi0AfNxfJAJobTgP5"->id,
            result: WhiteWon,
            whiteNewRating: 1650,
            blackNewRating: 2389,
            whiteOrigRating: 1600,
            blackOrigRating: 2400,
            whiteId: gypsy,
            blackId: joelRobinson,
          },
          {
            id: "zdlBHBAqgV2qabn2oBa2a"->id,
            result: BlackWon,
            whiteNewRating: 1400,
            blackNewRating: 2100,
            whiteOrigRating: 1400,
            blackOrigRating: 2100,
            whiteId: tvsFrank,
            blackId: drClaytonForrester,
          },
          {
            id: "8fGxU3tLpd8GibuSQr9-Y"->id,
            result: Draw,
            whiteNewRating: 1197,
            blackNewRating: 1764,
            whiteOrigRating: 800,
            blackOrigRating: 1800,
            whiteId: newbieMcNewberson,
            blackId: tomServo,
          },
        ]->Rounds.Round.fromArray,
        Rounds.Round.empty,
      ]->Rounds.fromArray,
      tieBreaks: [Median, Solkoff, Cumulative, CumulativeOfOpposition],
      name: "Pairing with draws",
    },
  ),
  (
    scoreTest,
    {
      id: scoreTest,
      name: "Score testing",
      date: Js.Date.fromString("2020-06-28T12:42:46.347Z"),
      playerIds: list{
        joelRobinson,
        mike,
        bobo,
        tomServo,
        tvsSon,
        tvsFrank,
        cambot,
        drClaytonForrester,
        crowTRobot,
        pearl,
        observer,
        kinga,
        jonah,
      },
      byeQueue: [],
      tieBreaks: [Median, Solkoff, Cumulative, CumulativeOfOpposition],
      roundList: [
        [
          {
            id: "IPRs48UZ3ubxbyzs9-Aj8"->id,
            whiteId: joelRobinson,
            blackId: tomServo,
            whiteNewRating: 2400,
            blackNewRating: 1798,
            whiteOrigRating: 2400,
            blackOrigRating: 1800,
            result: WhiteWon,
          },
          {
            id: "tcrk4_Eze6YB1jfgFxMg2"->id,
            whiteId: crowTRobot,
            blackId: mike,
            whiteNewRating: 1695,
            blackNewRating: 2300,
            whiteOrigRating: 1700,
            blackOrigRating: 2300,
            result: BlackWon,
          },
          {
            id: "g30WVQazEVlyFZoB_iKNP"->id,
            whiteId: cambot,
            blackId: jonah,
            whiteNewRating: 1531,
            blackNewRating: 2184,
            whiteOrigRating: 1500,
            blackOrigRating: 2200,
            result: WhiteWon,
          },
          {
            id: "z6z2X8Al9iNDmx2rc6iSd"->id,
            whiteId: drClaytonForrester,
            blackId: tvsFrank,
            whiteNewRating: 2080,
            blackNewRating: 1422,
            whiteOrigRating: 2100,
            blackOrigRating: 1400,
            result: BlackWon,
          },
          {
            id: "_wRcKBpFnPspJeiglbv42"->id,
            whiteId: observer,
            blackId: pearl,
            whiteNewRating: 1214,
            blackNewRating: 1974,
            whiteOrigRating: 1200,
            blackOrigRating: 2000,
            result: WhiteWon,
          },
          {
            id: "g35wmUfw3--3dZvF4Dxai"->id,
            whiteId: kinga,
            blackId: tvsSon,
            whiteNewRating: 1860,
            blackNewRating: 1112,
            whiteOrigRating: 1900,
            blackOrigRating: 1100,
            result: BlackWon,
          },
          {
            id: "ZFwPgPSrdR0dsiROQpZmq"->id,
            whiteId: bobo,
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
            whiteId: tvsFrank,
            blackId: joelRobinson,
            whiteNewRating: 1444,
            blackNewRating: 2389,
            whiteOrigRating: 1422,
            blackOrigRating: 2400,
            result: WhiteWon,
          },
          {
            id: "n02yWL6MNgkS19IREj_Df"->id,
            whiteId: mike,
            blackId: observer,
            whiteNewRating: 2287,
            blackNewRating: 1228,
            whiteOrigRating: 2300,
            blackOrigRating: 1214,
            result: BlackWon,
          },
          {
            id: "Luic7R_pGjZmSYxN1uNmc"->id,
            whiteId: tvsSon,
            blackId: cambot,
            whiteNewRating: 1123,
            blackNewRating: 1503,
            whiteOrigRating: 1112,
            blackOrigRating: 1531,
            result: WhiteWon,
          },
          {
            id: "Ew_xdm0tKHE1423CYoApT"->id,
            whiteId: pearl,
            blackId: bobo,
            whiteNewRating: 1949,
            blackNewRating: 1010,
            whiteOrigRating: 1974,
            blackOrigRating: 1000,
            result: BlackWon,
          },
          {
            id: "steThF-oNT-fBZe4AUHjc"->id,
            whiteId: jonah,
            blackId: kinga,
            whiteNewRating: 2186,
            blackNewRating: 1855,
            whiteOrigRating: 2184,
            blackOrigRating: 1860,
            result: WhiteWon,
          },
          {
            id: "3QPqo0tMvKVzgaQOFjezL"->id,
            whiteId: tomServo,
            blackId: drClaytonForrester,
            whiteNewRating: 1786,
            blackNewRating: 2083,
            whiteOrigRating: 1798,
            blackOrigRating: 2080,
            result: BlackWon,
          },
          {
            id: "BsbnpljVf9OagbfT8sUhJ"->id,
            whiteId: crowTRobot,
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
            whiteId: bobo,
            blackId: tvsFrank,
            whiteNewRating: 1019,
            blackNewRating: 1425,
            whiteOrigRating: 1010,
            blackOrigRating: 1444,
            result: WhiteWon,
          },
          {
            id: "tFw25nJzFa1DNC3kEBlvL"->id,
            whiteId: observer,
            blackId: tvsSon,
            whiteNewRating: 1219,
            blackNewRating: 1130,
            whiteOrigRating: 1228,
            blackOrigRating: 1123,
            result: BlackWon,
          },
          {
            id: "4s3IVU-DxR2itlDt6Pbry"->id,
            whiteId: drClaytonForrester,
            blackId: jonah,
            whiteNewRating: 2095,
            blackNewRating: 2176,
            whiteOrigRating: 2083,
            blackOrigRating: 2186,
            result: WhiteWon,
          },
          {
            id: "-J00pFQGNydkCVJ9IY57T"->id,
            whiteId: cambot,
            blackId: mike,
            whiteNewRating: 1503,
            blackNewRating: 2287,
            whiteOrigRating: 1503,
            blackOrigRating: 2287,
            result: BlackWon,
          },
          {
            id: "aN_Nzb1GFvoIT1Dlu3bn9"->id,
            whiteId: joelRobinson,
            blackId: pearl,
            whiteNewRating: 2390,
            blackNewRating: 1947,
            whiteOrigRating: 2389,
            blackOrigRating: 1949,
            result: WhiteWon,
          },
          {
            id: "taKyrpJg9XpACuWq16bum"->id,
            whiteId: kinga,
            blackId: crowTRobot,
            whiteNewRating: 1829,
            blackNewRating: 1790,
            whiteOrigRating: 1855,
            blackOrigRating: 1695,
            result: BlackWon,
          },
          {
            id: "Rh_UVxVKowtjSpeH-4Xwc"->id,
            whiteId: tomServo,
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
      scoreAdjustments: Data.Id.Map.make(),
    },
  ),
  (
    deletedPlayerTourney,
    {
      byeQueue: [deletedPlayer],
      date: Js.Date.fromString("2020-12-24T11:40:34.407Z"),
      id: deletedPlayerTourney,
      playerIds: list{
        newbieMcNewberson,
        grandyMcMaster,
        joelRobinson,
        drClaytonForrester,
        tvsFrank,
        crowTRobot,
        tomServo,
        deletedPlayer,
      },
      scoreAdjustments: Data.Id.Map.make(),
      roundList: [
        [
          {
            id: "KdLva8hWqYHdaU9KnFTe2"->id,
            result: BlackWon,
            whiteNewRating: 1699,
            blackNewRating: 2600,
            whiteOrigRating: 1700,
            blackOrigRating: 2600,
            whiteId: crowTRobot,
            blackId: grandyMcMaster,
          },
          {
            id: "WDPFsNF1yADs4qofFwCY0"->id,
            result: WhiteWon,
            whiteNewRating: 1650,
            blackNewRating: 2389,
            whiteOrigRating: 1600,
            blackOrigRating: 2400,
            whiteId: deletedPlayer,
            blackId: joelRobinson,
          },
          {
            id: "R5sXfTOJw5vrJ4IytAjSi"->id,
            result: BlackWon,
            whiteNewRating: 1400,
            blackNewRating: 2100,
            whiteOrigRating: 1400,
            blackOrigRating: 2100,
            whiteId: tvsFrank,
            blackId: drClaytonForrester,
          },
          {
            id: "2YOsn_JJFnaUMhRBAc9KY"->id,
            result: WhiteWon,
            whiteNewRating: 1597,
            blackNewRating: 1728,
            whiteOrigRating: 800,
            blackOrigRating: 1800,
            whiteId: newbieMcNewberson,
            blackId: tomServo,
          },
        ]->Rounds.Round.fromArray,
        Rounds.Round.empty,
      ]->Rounds.fromArray,
      tieBreaks: [Median, Solkoff, Cumulative, CumulativeOfOpposition],
      name: "Deleted Player",
    },
  ),
])
