open Data;
let id = Id.fromString;

let byeRoundTourney = "Bye_Round_Tourney____"->id;
let byeRoundTourney2 = "Bye_Round_Tourney_2__"->id;
let byeRoundTourney3 = "Bye_Tourney_3________"->id;
let simplePairing = "Simple_Pairing_______"->id;
let pairingWithDraws = "Pairing_With_Draws___"->id;

let crowTRobot = "Crow_T_Robot_________"->id;
let drClaytonForrester = "Dr_Clayton_Forrester_"->id;
let grandyMcMaster = "Grandy_McMaster______"->id;
let gypsy = "Gypsy________________"->id;
let joelRobinson = "Joel_Robinson________"->id;
let newbieMcNewberson = "Newbie_McNewberson___"->id;
let tomServo = "Tom_Servo____________"->id;
let tvsFrank = "TVs_Frank____________"->id;

let config =
  Config.{
    byeValue: ByeValue.Full,
    avoidPairs:
      [|
        ("TVs_Frank____________", "TVs_Son_of_TVs_Frank_"),
        ("Pearl_Forrester______", "Dr_Clayton_Forrester_"),
        ("Kinga_Forrester______", "Dr_Clayton_Forrester_"),
        ("Kinga_Forrester______", "Pearl_Forrester______"),
      |]
      ->Belt.Array.keepMap(((a, b)) => Pair.make(id(a), id(b)))
      ->Pair.Set.fromArray,
    lastBackup: Js.Date.fromString("1970-01-01T00:00:00.000Z"),
  };
let players = [|
  (
    "Cambot_______________",
    Player.{
      id: "Cambot_______________"->id,
      matchCount: 25,
      rating: 1500,
      type_: Player.Type.Person,
      firstName: "Cambot",
      lastName: "",
    },
  ),
  (
    "Crow_T_Robot_________",
    Player.{
      id: crowTRobot,
      matchCount: 5,
      rating: 1700,
      type_: Player.Type.Person,
      firstName: "Crow T",
      lastName: "Robot",
    },
  ),
  (
    "Dr_Clayton_Forrester_",
    Player.{
      id: drClaytonForrester,
      matchCount: 40,
      rating: 2100,
      type_: Player.Type.Person,
      firstName: "Clayton",
      lastName: "Forrester",
    },
  ),
  (
    "Grandy_McMaster______",
    Player.{
      id: grandyMcMaster,
      matchCount: 100,
      rating: 2600,
      type_: Player.Type.Person,
      firstName: "Grandy",
      lastName: "McMaster",
    },
  ),
  (
    "Gypsy________________",
    Player.{
      id: gypsy,
      matchCount: 15,
      rating: 1600,
      type_: Player.Type.Person,
      firstName: "Gypsy",
      lastName: "",
    },
  ),
  (
    "Joel_Robinson________",
    Player.{
      id: joelRobinson,
      matchCount: 70,
      rating: 2400,
      type_: Player.Type.Person,
      firstName: "Joel",
      lastName: "Robinson",
    },
  ),
  (
    "Jonah_Heston_________",
    Player.{
      id: "Jonah_Heston_________"->id,
      matchCount: 50,
      rating: 2200,
      type_: Player.Type.Person,
      firstName: "Jonah",
      lastName: "Heston",
    },
  ),
  (
    "Kinga_Forrester______",
    Player.{
      id: "Kinga_Forrester______"->id,
      matchCount: 20,
      rating: 1900,
      type_: Player.Type.Person,
      firstName: "Kinga",
      lastName: "Forrester",
    },
  ),
  (
    "Larry_Erhardt________",
    Player.{
      id: "Larry_Erhardt________"->id,
      matchCount: 45,
      rating: 1300,
      type_: Player.Type.Person,
      firstName: "Larry",
      lastName: "Erhardt",
    },
  ),
  (
    "Mike_Nelson__________",
    Player.{
      id: "Mike_Nelson__________"->id,
      matchCount: 60,
      rating: 2300,
      type_: Player.Type.Person,
      firstName: "Mike",
      lastName: "Nelson",
    },
  ),
  (
    "Newbie_McNewberson___",
    Player.{
      id: newbieMcNewberson,
      matchCount: 0,
      rating: 800,
      type_: Player.Type.Person,
      firstName: "Newbie",
      lastName: "McNewberson",
    },
  ),
  (
    "Observer_Brain_Guy___",
    Player.{
      id: "Observer_Brain_Guy___"->id,
      matchCount: 55,
      rating: 1200,
      type_: Player.Type.Person,
      firstName: "Brain",
      lastName: "Guy",
    },
  ),
  (
    "Pearl_Forrester______",
    Player.{
      id: "Pearl_Forrester______"->id,
      matchCount: 30,
      rating: 2000,
      type_: Player.Type.Person,
      firstName: "Pearl",
      lastName: "Forrester",
    },
  ),
  (
    "Professor_Bobo_______",
    Player.{
      id: "Professor_Bobo_______"->id,
      matchCount: 75,
      rating: 1000,
      type_: Player.Type.Person,
      firstName: "Bobo",
      lastName: "Professor",
    },
  ),
  (
    "TVs_Frank____________",
    Player.{
      id: tvsFrank,
      matchCount: 35,
      rating: 1400,
      type_: Player.Type.Person,
      firstName: "TV's",
      lastName: "Frank",
    },
  ),
  (
    "TVs_Son_of_TVs_Frank_",
    Player.{
      id: "TVs_Son_of_TVs_Frank_"->id,
      matchCount: 65,
      rating: 1100,
      type_: Player.Type.Person,
      firstName: "TV's",
      lastName: "Max",
    },
  ),
  (
    "Tom_Servo____________",
    Player.{
      id: tomServo,
      matchCount: 10,
      rating: 1800,
      type_: Player.Type.Person,
      firstName: "Tom",
      lastName: "Servo",
    },
  ),
|];

let tournaments: array((string, Tournament.t)) = [|
  (
    "Bye_Round_Tourney____",
    Tournament.{
      byeQueue: [||],
      date: Js.Date.fromString("2019-06-12T23:49:47.103Z"),
      id: byeRoundTourney,
      playerIds: [
        joelRobinson,
        crowTRobot,
        tomServo,
        gypsy,
        "Cambot_______________"->id,
        newbieMcNewberson,
        grandyMcMaster,
      ],
      roundList: Rounds.empty,
      tieBreaks:
        Scoring.TieBreak.(
          [|Median, Solkoff, Cumulative, CumulativeOfOpposition|]
        ),
      name: "Bye Round Tourney",
    },
  ),
  (
    "Bye_Round_Tourney_2__",
    Tournament.{
      byeQueue: [||],
      date: Js.Date.fromString("2019-06-12T23:49:47.103Z"),
      id: byeRoundTourney2,
      playerIds: [
        joelRobinson,
        crowTRobot,
        tomServo,
        gypsy,
        "Cambot_______________"->id,
        newbieMcNewberson,
        grandyMcMaster,
      ],
      roundList:
        [|
          [|
            {
              Match.id: "xTXxZHB0sTt__xIAg45fm"->id,
              result: Match.Result.BlackWon,
              whiteNewRating: 2592,
              blackNewRating: 1833,
              whiteOrigRating: 2600,
              blackOrigRating: 1700,
              whiteId: grandyMcMaster,
              blackId: crowTRobot,
            },
            {
              Match.id: "zQcf9RWXK7iuU6ibPzrhU"->id,
              result: Match.Result.WhiteWon,
              whiteNewRating: 2400,
              blackNewRating: 1600,
              whiteOrigRating: 2400,
              blackOrigRating: 1600,
              whiteId: joelRobinson,
              blackId: gypsy,
            },
            {
              Match.id: "Vw_X0c7O4vshrYEO-oSzR"->id,
              result: Match.Result.BlackWon,
              whiteNewRating: 1738,
              blackNewRating: 1526,
              whiteOrigRating: 1800,
              blackOrigRating: 1500,
              whiteId: tomServo,
              blackId: "Cambot_______________"->id,
            },
            {
              Match.id: "iSDujOVkOTrcLv_KJmd7s"->id,
              result: Match.Result.WhiteWon,
              whiteNewRating: 800,
              blackNewRating: 0,
              whiteOrigRating: 800,
              blackOrigRating: 0,
              whiteId: newbieMcNewberson,
              blackId: "________DUMMY________"->id,
            },
          |]
          ->Rounds.Round.fromArray,
        |]
        ->Rounds.fromArray,
      tieBreaks:
        Scoring.TieBreak.(
          [|Median, Solkoff, Cumulative, CumulativeOfOpposition|]
        ),
      name: "Bye Round Tourney 2",
    },
  ),
  (
    "Bye_Tourney_3________",
    Tournament.{
      byeQueue: [||],
      date: Js.Date.fromString("2019-06-17T23:00:29.603Z"),
      id: byeRoundTourney3,
      playerIds: [
        "Kinga_Forrester______"->id,
        newbieMcNewberson,
        "Jonah_Heston_________"->id,
      ],
      roundList:
        [|
          [|
            {
              Match.id: "KkFr4B7FDqiHRWmACgApf"->id,
              result: Match.Result.BlackWon,
              whiteNewRating: 1894,
              blackNewRating: 2202,
              whiteOrigRating: 1900,
              blackOrigRating: 2200,
              whiteId: "Kinga_Forrester______"->id,
              blackId: "Jonah_Heston_________"->id,
            },
            {
              Match.id: "R_BTsGSziwgyvFZM3yc5u"->id,
              result: Match.Result.WhiteWon,
              whiteNewRating: 793,
              blackNewRating: 0,
              whiteOrigRating: 793,
              blackOrigRating: 0,
              whiteId: newbieMcNewberson,
              blackId: "________DUMMY________"->id,
            },
          |]
          ->Rounds.Round.fromArray,
          [|
            {
              Match.id: "rcyCfpZU6olav5kdVac44"->id,
              result: Match.Result.BlackWon,
              whiteNewRating: 2187,
              blackNewRating: 953,
              whiteOrigRating: 2202,
              blackOrigRating: 793,
              whiteId: "Jonah_Heston_________"->id,
              blackId: newbieMcNewberson,
            },
            {
              Match.id: "Nc0Om5fEuwSuzFls9wmME"->id,
              result: Match.Result.WhiteWon,
              whiteNewRating: 1894,
              blackNewRating: 0,
              whiteOrigRating: 1894,
              blackOrigRating: 0,
              whiteId: "Kinga_Forrester______"->id,
              blackId: "________DUMMY________"->id,
            },
          |]
          ->Rounds.Round.fromArray,
          [|
            {
              Match.id: "uawjKwbiA38RP8pA--tlw"->id,
              result: Match.Result.BlackWon,
              whiteNewRating: 952,
              blackNewRating: 1894,
              whiteOrigRating: 953,
              blackOrigRating: 1894,
              whiteId: newbieMcNewberson,
              blackId: "Kinga_Forrester______"->id,
            },
            {
              Match.id: "-kwIDxjPhWVRbqxtRZ26_"->id,
              result: Match.Result.WhiteWon,
              whiteNewRating: 2187,
              blackNewRating: 0,
              whiteOrigRating: 2187,
              blackOrigRating: 0,
              whiteId: "Jonah_Heston_________"->id,
              blackId: "________DUMMY________"->id,
            },
          |]
          ->Rounds.Round.fromArray,
        |]
        ->Rounds.fromArray,
      tieBreaks:
        Scoring.TieBreak.(
          [|Median, Solkoff, Cumulative, CumulativeOfOpposition|]
        ),
      name: "Bye Tourney 3",
    },
  ),
  (
    "Simple_Pairing_______",
    Tournament.{
      byeQueue: [||],
      date: Js.Date.fromString("2019-06-14T11:40:34.407Z"),
      id: simplePairing,
      playerIds: [
        newbieMcNewberson,
        grandyMcMaster,
        joelRobinson,
        drClaytonForrester,
        tvsFrank,
        crowTRobot,
        tomServo,
        gypsy,
      ],
      roundList:
        [|
          [|
            {
              Match.id: "KdLva8hWqYHdaU9KnFTe2"->id,
              result: Match.Result.BlackWon,
              whiteNewRating: 1699,
              blackNewRating: 2600,
              whiteOrigRating: 1700,
              blackOrigRating: 2600,
              whiteId: crowTRobot,
              blackId: grandyMcMaster,
            },
            {
              Match.id: "WDPFsNF1yADs4qofFwCY0"->id,
              result: Match.Result.WhiteWon,
              whiteNewRating: 1650,
              blackNewRating: 2389,
              whiteOrigRating: 1600,
              blackOrigRating: 2400,
              whiteId: gypsy,
              blackId: joelRobinson,
            },
            {
              Match.id: "R5sXfTOJw5vrJ4IytAjSi"->id,
              result: Match.Result.BlackWon,
              whiteNewRating: 1400,
              blackNewRating: 2100,
              whiteOrigRating: 1400,
              blackOrigRating: 2100,
              whiteId: tvsFrank,
              blackId: drClaytonForrester,
            },
            {
              Match.id: "2YOsn_JJFnaUMhRBAc9KY"->id,
              result: Match.Result.WhiteWon,
              whiteNewRating: 1597,
              blackNewRating: 1728,
              whiteOrigRating: 800,
              blackOrigRating: 1800,
              whiteId: newbieMcNewberson,
              blackId: tomServo,
            },
          |]
          ->Rounds.Round.fromArray,
          Rounds.Round.empty,
        |]
        ->Rounds.fromArray,
      tieBreaks:
        Scoring.TieBreak.(
          [|Median, Solkoff, Cumulative, CumulativeOfOpposition|]
        ),
      name: "Simple Pairing",
    },
  ),
  (
    "Pairing_With_Draws___",
    Tournament.{
      byeQueue: [||],
      date: Js.Date.fromString("2019-06-14T14:18:06.686Z"),
      id: pairingWithDraws,
      playerIds: [
        newbieMcNewberson,
        grandyMcMaster,
        joelRobinson,
        drClaytonForrester,
        tvsFrank,
        crowTRobot,
        tomServo,
        gypsy,
      ],
      roundList:
        [|
          [|
            {
              Match.id: "ryWXwvFGwBKQqGBbMYeps"->id,
              result: Match.Result.BlackWon,
              whiteNewRating: 1699,
              blackNewRating: 2600,
              whiteOrigRating: 1700,
              blackOrigRating: 2600,
              whiteId: crowTRobot,
              blackId: grandyMcMaster,
            },
            {
              Match.id: "2KKVbi0AfNxfJAJobTgP5"->id,
              result: Match.Result.WhiteWon,
              whiteNewRating: 1650,
              blackNewRating: 2389,
              whiteOrigRating: 1600,
              blackOrigRating: 2400,
              whiteId: gypsy,
              blackId: joelRobinson,
            },
            {
              Match.id: "zdlBHBAqgV2qabn2oBa2a"->id,
              result: Match.Result.BlackWon,
              whiteNewRating: 1400,
              blackNewRating: 2100,
              whiteOrigRating: 1400,
              blackOrigRating: 2100,
              whiteId: tvsFrank,
              blackId: drClaytonForrester,
            },
            {
              Match.id: "8fGxU3tLpd8GibuSQr9-Y"->id,
              result: Match.Result.Draw,
              whiteNewRating: 1197,
              blackNewRating: 1764,
              whiteOrigRating: 800,
              blackOrigRating: 1800,
              whiteId: newbieMcNewberson,
              blackId: tomServo,
            },
          |]
          ->Rounds.Round.fromArray,
          Rounds.Round.empty,
        |]
        ->Rounds.fromArray,
      tieBreaks:
        Scoring.TieBreak.(
          [|Median, Solkoff, Cumulative, CumulativeOfOpposition|]
        ),
      name: "Pairing with draws",
    },
  ),
|];
