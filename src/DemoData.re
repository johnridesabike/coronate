open Belt;
open Data;
let id = Data.Id.fromString;
let batman = "BruceWayne_lv_ZsUHTU9"->id;
let robin = "DickGrayson_1C2rCokHH"->id;
let alfred = "AlfredPennyworth_y4dW"->id;
let barbara = "BarbaraGordon_cL6SpI2"->id;
let batwoman = "KateKane_klFW6gDfUOTX"->id;
let catwoman = "SelinaKyle_rJBH-45Xoy"->id;
let jason = "JasonTodd_fc9CeOa-Luw"->id;
let james = "JamesGordon_1ts9xICT3"->id;
let huntress = "HelenaWayne_fE6O0DJcE"->id;
let joker = "Joker_v0z2416fpAZ9o2c"->id;
let harley = "HarleyQuinn_-10-02VPH"->id;
let freeze = "VictorFries_cWaQoW014"->id;
let penguin = "OswaldCobblepot_lfCro"->id;
let ras = "RasAlGhul_k9n8k852bHr"->id;
let poisonivy = "PamelaIsley_vH5vD8uPB"->id;
let riddler = "EdwardNigma_j80JfWOZq"->id;
let scarecrow = "JonathanCrane_R4Q8tVW"->id;
let twoface = "HarveyDent_0eYIiP_Ij5"->id;
let hugo = "HugoStrange_az43f9mtS"->id;

let config =
  Config.{
    byeValue: ByeValue.Full,
    avoidPairs:
      [|(barbara, james), (joker, harley), (huntress, batman)|]
      ->Array.keepMap(((a, b)) => Pair.make(a, b))
      ->Pair.Set.fromArray,
    lastBackup: Js.Date.fromString("1970-01-01T00:00:00.000Z"),
  };

let players =
  Data.Id.Map.fromArray @@
  [|
    (
      batman,
      Player.{
        id: batman,
        type_: Player.Type.Person,
        firstName: "Bruce",
        lastName: "Wayne",
        rating: 1998,
        matchCount: 9,
      },
    ),
    (
      robin,
      Player.{
        id: robin,
        type_: Player.Type.Person,
        firstName: "Dick",
        lastName: "Grayson",
        rating: 1909,
        matchCount: 9,
      },
    ),
    (
      alfred,
      Player.{
        id: alfred,
        type_: Player.Type.Person,
        firstName: "Alfred",
        lastName: "Pennyworth",
        rating: 1999,
        matchCount: 9,
      },
    ),
    (
      barbara,
      Player.{
        id: barbara,
        type_: Player.Type.Person,
        firstName: "Barbara",
        lastName: "Gordon",
        rating: 1345,
        matchCount: 7,
      },
    ),
    (
      batwoman,
      Player.{
        id: batwoman,
        type_: Player.Type.Person,
        firstName: "Kate",
        lastName: "Kane",
        rating: 1539,
        matchCount: 9,
      },
    ),
    (
      catwoman,
      Player.{
        id: catwoman,
        type_: Player.Type.Person,
        firstName: "Selina",
        lastName: "Kyle",
        rating: 1495,
        matchCount: 9,
      },
    ),
    (
      jason,
      Player.{
        id: jason,
        type_: Player.Type.Person,
        firstName: "Jason",
        lastName: "Todd",
        rating: 1101,
        matchCount: 7,
      },
    ),
    (
      james,
      Player.{
        id: james,
        type_: Player.Type.Person,
        firstName: "James",
        lastName: "Gordon",
        rating: 1167,
        matchCount: 7,
      },
    ),
    (
      huntress,
      Player.{
        id: huntress,
        type_: Player.Type.Person,
        firstName: "Helena",
        lastName: "Wayne",
        rating: 1087,
        matchCount: 7,
      },
    ),
    (
      joker,
      Player.{
        id: joker,
        type_: Player.Type.Person,
        firstName: "Joker",
        lastName: "",
        rating: 1538,
        matchCount: 1,
      },
    ),
    (
      harley,
      Player.{
        id: harley,
        type_: Player.Type.Person,
        firstName: "Harley",
        lastName: "Quinn",
        rating: 1648,
        matchCount: 1,
      },
    ),
    (
      freeze,
      Player.{
        id: freeze,
        type_: Player.Type.Person,
        firstName: "Victor",
        lastName: "Fries",
        rating: 862,
        matchCount: 1,
      },
    ),
    (
      penguin,
      Player.{
        id: penguin,
        type_: Player.Type.Person,
        firstName: "Oswald",
        lastName: "Cobblepot",
        rating: 1812,
        matchCount: 1,
      },
    ),
    (
      ras,
      Player.{
        id: ras,
        type_: Player.Type.Person,
        firstName: "Ra's",
        lastName: "al Ghul",
        rating: 1404,
        matchCount: 1,
      },
    ),
    (
      poisonivy,
      Player.{
        id: poisonivy,
        type_: Player.Type.Person,
        firstName: "Pamela",
        lastName: "Isley",
        rating: 965,
        matchCount: 1,
      },
    ),
    (
      riddler,
      Player.{
        id: riddler,
        type_: Player.Type.Person,
        firstName: "Edward",
        lastName: "Nigma",
        rating: 948,
        matchCount: 1,
      },
    ),
    (
      scarecrow,
      Player.{
        id: scarecrow,
        type_: Player.Type.Person,
        firstName: "Jonathan",
        lastName: "Crane",
        rating: 899,
        matchCount: 1,
      },
    ),
    (
      twoface,
      Player.{
        id: twoface,
        type_: Player.Type.Person,
        firstName: "Harvey",
        lastName: "Dent",
        rating: 1649,
        matchCount: 1,
      },
    ),
    (
      hugo,
      Player.{
        id: hugo,
        type_: Player.Type.Person,
        firstName: "Hugo",
        lastName: "Strange",
        rating: 800,
        matchCount: 0,
      },
    ),
  |];

let tournaments =
  Data.Id.Map.fromArray @@
  [|
    (
      "CaouTNel9k70jUJ0h6SYM"->id,
      Tournament.{
        date: Js.Date.fromString("2019-05-22T12:14:47.670Z"),
        id: "CaouTNel9k70jUJ0h6SYM"->id,
        name: "Wayne Manor Open",
        tieBreaks:
          Scoring.TieBreak.(
            [|Median, Solkoff, Cumulative, CumulativeOfOpposition|]
          ),
        byeQueue: [||],
        playerIds: [
          batman,
          robin,
          alfred,
          barbara,
          batwoman,
          catwoman,
          jason,
          james,
          huntress,
        ],
        scoreAdjustments: Data.Id.Map.make(),
        roundList:
          [|
            [|
              {
                Match.id: "FUASEeyES6ez_ROoT6qmU"->id,
                whiteId: jason,
                blackId: robin,
                result: Match.Result.BlackWon,
                whiteOrigRating: 1238,
                blackOrigRating: 2108,
                whiteNewRating: 1236,
                blackNewRating: 2109,
              },
              {
                Match.id: "gqPyD66QMPF-pup41xsB2"->id,
                whiteId: james,
                blackId: alfred,
                result: Match.Result.BlackWon,
                whiteOrigRating: 1049,
                blackOrigRating: 2260,
                whiteNewRating: 1049,
                blackNewRating: 2260,
              },
              {
                Match.id: "KpS1lQSzsQWQ3VVWJyA2P"->id,
                whiteId: batwoman,
                blackId: barbara,
                result: Match.Result.Draw,
                whiteOrigRating: 1527,
                blackOrigRating: 1755,
                whiteNewRating: 1553,
                blackNewRating: 1722,
              },
              {
                Match.id: "OgFuy-wq8mz378EWat46u"->id,
                whiteId: catwoman,
                blackId: batman,
                result: Match.Result.BlackWon,
                whiteOrigRating: 1284,
                blackOrigRating: 1881,
                whiteNewRating: 1278,
                blackNewRating: 1887,
              },
              {
                Match.id: "f8Ps3GUmd0ZRsBBY8rZOp"->id,
                whiteId: huntress,
                blackId: Data.Id.dummy,
                result: Match.Result.WhiteWon,
                whiteOrigRating: 831,
                blackOrigRating: 0,
                whiteNewRating: 831,
                blackNewRating: 0,
              },
            |]
            ->Rounds.Round.fromArray,
            [|
              {
                Match.id: "6seKrw7ehbhL766g6L2PF"->id,
                whiteId: robin,
                blackId: batwoman,
                result: Match.Result.WhiteWon,
                whiteOrigRating: 2109,
                blackOrigRating: 1685,
                whiteNewRating: 2122,
                blackNewRating: 1672,
              },
              {
                Match.id: "TCSjz48ZXqjamtYUFNg0B"->id,
                whiteId: batman,
                blackId: huntress,
                result: Match.Result.WhiteWon,
                whiteOrigRating: 1887,
                blackOrigRating: 831,
                whiteNewRating: 1887,
                blackNewRating: 830,
              },
              {
                Match.id: "zF64DEsN8sHydpDDsg37E"->id,
                whiteId: alfred,
                blackId: catwoman,
                result: Match.Result.BlackWon,
                whiteOrigRating: 2260,
                blackOrigRating: 1278,
                whiteNewRating: 2101,
                blackNewRating: 1437,
              },
              {
                Match.id: "qVGt1EJq9y0MmvFtumM0A"->id,
                whiteId: barbara,
                blackId: jason,
                result: Match.Result.WhiteWon,
                whiteOrigRating: 1545,
                blackOrigRating: 1236,
                whiteNewRating: 1574,
                blackNewRating: 1207,
              },
              {
                Match.id: "UhfHaRWr_-BtVo22xAuJu"->id,
                whiteId: james,
                blackId: Data.Id.dummy,
                result: Match.Result.WhiteWon,
                whiteOrigRating: 1049,
                blackOrigRating: 0,
                whiteNewRating: 1049,
                blackNewRating: 0,
              },
            |]
            ->Rounds.Round.fromArray,
            [|
              {
                Match.id: "odrOOnZJUe0YAwkfUDqUb"->id,
                whiteId: alfred,
                blackId: batman,
                result: Match.Result.BlackWon,
                whiteOrigRating: 2101,
                blackOrigRating: 1887,
                whiteNewRating: 1998,
                blackNewRating: 1990,
              },
              {
                Match.id: "qzCMqUwNIDAcFSAuA5yCm"->id,
                whiteId: huntress,
                blackId: robin,
                result: Match.Result.WhiteWon,
                whiteOrigRating: 830,
                blackOrigRating: 2122,
                whiteNewRating: 990,
                blackNewRating: 2008,
              },
              {
                Match.id: "6QgVqdtcJPjfVp3UZ8S9g"->id,
                whiteId: catwoman,
                blackId: barbara,
                result: Match.Result.WhiteWon,
                whiteOrigRating: 1437,
                blackOrigRating: 1574,
                whiteNewRating: 1529,
                blackNewRating: 1464,
              },
              {
                Match.id: "as45gODKMLC5-3_UsTyx5"->id,
                whiteId: batwoman,
                blackId: james,
                result: Match.Result.BlackWon,
                whiteOrigRating: 1672,
                blackOrigRating: 1049,
                whiteNewRating: 1542,
                blackNewRating: 1244,
              },
              {
                Match.id: "Pc0CWecSfeGNfvBPjyEIj"->id,
                whiteId: jason,
                blackId: Data.Id.dummy,
                result: Match.Result.WhiteWon,
                whiteOrigRating: 1207,
                blackOrigRating: 0,
                whiteNewRating: 1207,
                blackNewRating: 0,
              },
            |]
            ->Rounds.Round.fromArray,
            [|
              {
                Match.id: "xj0y_Iqkb-g3MDGgmYx2-"->id,
                whiteId: batman,
                blackId: batwoman,
                result: Match.Result.WhiteWon,
                whiteOrigRating: 1990,
                blackOrigRating: 1542,
                whiteNewRating: 1998,
                blackNewRating: 1534,
              },
              {
                Match.id: "HWYWtsyaqUkHRExM6kQrt"->id,
                whiteId: robin,
                blackId: james,
                result: Match.Result.WhiteWon,
                whiteOrigRating: 2008,
                blackOrigRating: 1244,
                whiteNewRating: 2009,
                blackNewRating: 1243,
              },
              {
                Match.id: "uAzHZVMC71liQZ-6fWWeD"->id,
                whiteId: huntress,
                blackId: catwoman,
                result: Match.Result.BlackWon,
                whiteOrigRating: 990,
                blackOrigRating: 1529,
                whiteNewRating: 983,
                blackNewRating: 1534,
              },
              {
                Match.id: "_tCBn9YNIyto-vXpxm7WI"->id,
                whiteId: jason,
                blackId: alfred,
                result: Match.Result.BlackWon,
                whiteOrigRating: 1207,
                blackOrigRating: 1998,
                whiteNewRating: 1205,
                blackNewRating: 1999,
              },
              {
                Match.id: "L7yatE2oVKlV7LOY6-d7Y"->id,
                whiteId: barbara,
                blackId: Data.Id.dummy,
                result: Match.Result.WhiteWon,
                whiteOrigRating: 1464,
                blackOrigRating: 0,
                whiteNewRating: 1464,
                blackNewRating: 0,
              },
            |]
            ->Rounds.Round.fromArray,
          |]
          ->Rounds.fromArray,
      },
    ),
    (
      "tvAdS4YbSOznrBgrg0ITA"->id,
      Tournament.{
        date: Js.Date.fromString("2019-05-29T12:15:20.593Z"),
        id: "tvAdS4YbSOznrBgrg0ITA"->id,
        name: "The Battle for Gotham City",
        tieBreaks:
          Scoring.TieBreak.(
            [|Median, Solkoff, Cumulative, CumulativeOfOpposition|]
          ),
        byeQueue: [||],
        playerIds: [
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
        scoreAdjustments: Data.Id.Map.make(),
        roundList:
          [|
            [|
              {
                Match.id: "5f8GYcR8V44NYvTN1cZle"->id,
                whiteId: riddler,
                blackId: batman,
                result: Match.Result.BlackWon,
                whiteOrigRating: 950,
                blackOrigRating: 1998,
                whiteNewRating: 948,
                blackNewRating: 1998,
              },
              {
                Match.id: "GPTct4sL368SryTLFUu8E"->id,
                whiteId: scarecrow,
                blackId: alfred,
                result: Match.Result.BlackWon,
                whiteOrigRating: 900,
                blackOrigRating: 1999,
                whiteNewRating: 899,
                blackNewRating: 1999,
              },
              {
                Match.id: "AxtoztZ6O19nyrLfZ4YaU"->id,
                whiteId: twoface,
                blackId: robin,
                result: Match.Result.WhiteWon,
                whiteOrigRating: 850,
                blackOrigRating: 2009,
                whiteNewRating: 1649,
                blackNewRating: 1909,
              },
              {
                Match.id: "bUM_tWQsAtPe1gqRzlXd1"->id,
                whiteId: ras,
                blackId: catwoman,
                result: Match.Result.Draw,
                whiteOrigRating: 1050,
                blackOrigRating: 1534,
                whiteNewRating: 1404,
                blackNewRating: 1495,
              },
              {
                Match.id: "bAOVlP-M5xaPk1qofNReb"->id,
                whiteId: penguin,
                blackId: barbara,
                result: Match.Result.WhiteWon,
                whiteOrigRating: 1100,
                blackOrigRating: 1464,
                whiteNewRating: 1812,
                blackNewRating: 1345,
              },
              {
                Match.id: "4omlgiGSaE1BmrHdABSym"->id,
                whiteId: poisonivy,
                blackId: batwoman,
                result: Match.Result.BlackWon,
                whiteOrigRating: 1000,
                blackOrigRating: 1534,
                whiteNewRating: 965,
                blackNewRating: 1539,
              },
              {
                Match.id: "ysdEVYS2AyuKyOAwLLpTF"->id,
                whiteId: harley,
                blackId: james,
                result: Match.Result.WhiteWon,
                whiteOrigRating: 1200,
                blackOrigRating: 1242,
                whiteNewRating: 1648,
                blackNewRating: 1167,
              },
              {
                Match.id: "YoJ9WGokAYrmJjfxCCf87"->id,
                whiteId: freeze,
                blackId: joker,
                result: Match.Result.BlackWon,
                whiteOrigRating: 1150,
                blackOrigRating: 1250,
                whiteNewRating: 862,
                blackNewRating: 1538,
              },
              {
                Match.id: "Az7SBl3cs7rbwKPBI0IsU"->id,
                whiteId: huntress,
                blackId: jason,
                result: Match.Result.WhiteWon,
                whiteOrigRating: 983,
                blackOrigRating: 1205,
                whiteNewRating: 1087,
                blackNewRating: 1101,
              },
            |]
            ->Rounds.Round.fromArray,
            Rounds.Round.empty,
          |]
          ->Rounds.fromArray,
      },
    ),
  |];
