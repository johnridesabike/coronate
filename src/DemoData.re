let options =
  Data.{
    byeValue: 1.0,
    avoidPairs: [|
      ("BarbaraGordon_cL6SpI2", "JamesGordon_1ts9xICT3"),
      ("Joker_v0z2416fpAZ9o2c", "HarleyQuinn_-10-02VPH"),
      ("HelenaWayne_fE6O0DJcE", "BruceWayne_lv_ZsUHTU9"),
    |],
    lastBackup: Js.Date.fromString("1970-01-01T00:00:00.000Z"),
  };

let players =
  Js.Dict.fromArray([|
    (
      "BruceWayne_lv_ZsUHTU9",
      Data.{
        id: "BruceWayne_lv_ZsUHTU9",
        type_: "person",
        firstName: "Bruce",
        lastName: "Wayne",
        rating: 1998,
        matchCount: 9,
      },
    ),
    (
      "DickGrayson_1C2rCokHH",
      {
        id: "DickGrayson_1C2rCokHH",
        type_: "person",
        firstName: "Dick",
        lastName: "Grayson",
        rating: 1909,
        matchCount: 9,
      },
    ),
    (
      "AlfredPennyworth_y4dW",
      {
        id: "AlfredPennyworth_y4dW",
        type_: "person",
        firstName: "Alfred",
        lastName: "Pennyworth",
        rating: 1999,
        matchCount: 9,
      },
    ),
    (
      "BarbaraGordon_cL6SpI2",
      {
        id: "BarbaraGordon_cL6SpI2",
        type_: "person",
        firstName: "Barbara",
        lastName: "Gordon",
        rating: 1345,
        matchCount: 7,
      },
    ),
    (
      "KateKane_klFW6gDfUOTX",
      {
        id: "KateKane_klFW6gDfUOTX",
        type_: "person",
        firstName: "Kate",
        lastName: "Kane",
        rating: 1539,
        matchCount: 9,
      },
    ),
    (
      "SelinaKyle_rJBH-45Xoy",
      {
        id: "SelinaKyle_rJBH-45Xoy",
        type_: "person",
        firstName: "Selina",
        lastName: "Kyle",
        rating: 1495,
        matchCount: 9,
      },
    ),
    (
      "JasonTodd_fc9CeOa-Luw",
      {
        id: "JasonTodd_fc9CeOa-Luw",
        type_: "person",
        firstName: "Jason",
        lastName: "Todd",
        rating: 1101,
        matchCount: 7,
      },
    ),
    (
      "JamesGordon_1ts9xICT3",
      {
        id: "JamesGordon_1ts9xICT3",
        type_: "person",
        firstName: "James",
        lastName: "Gordon",
        rating: 1167,
        matchCount: 7,
      },
    ),
    (
      "HelenaWayne_fE6O0DJcE",
      {
        id: "HelenaWayne_fE6O0DJcE",
        type_: "person",
        firstName: "Helena",
        lastName: "Wayne",
        rating: 1087,
        matchCount: 7,
      },
    ),
    (
      "Joker_v0z2416fpAZ9o2c",
      {
        id: "Joker_v0z2416fpAZ9o2c",
        type_: "person",
        firstName: "Joker",
        lastName: "",
        rating: 1538,
        matchCount: 1,
      },
    ),
    (
      "HarleyQuinn_-10-02VPH",
      {
        id: "HarleyQuinn_-10-02VPH",
        type_: "person",
        firstName: "Harley",
        lastName: "Quinn",
        rating: 1648,
        matchCount: 1,
      },
    ),
    (
      "VictorFries_cWaQoW014",
      {
        id: "VictorFries_cWaQoW014",
        type_: "person",
        firstName: "Victor",
        lastName: "Fries",
        rating: 862,
        matchCount: 1,
      },
    ),
    (
      "OswaldCobblepot_lfCro",
      {
        id: "OswaldCobblepot_lfCro",
        type_: "person",
        firstName: "Oswald",
        lastName: "Cobblepot",
        rating: 1812,
        matchCount: 1,
      },
    ),
    (
      "RasAlGhul_k9n8k852bHr",
      {
        id: "RasAlGhul_k9n8k852bHr",
        type_: "person",
        firstName: "Ra's",
        lastName: "al Ghul",
        rating: 1404,
        matchCount: 1,
      },
    ),
    (
      "PamelaIsley_vH5vD8uPB",
      {
        id: "PamelaIsley_vH5vD8uPB",
        type_: "person",
        firstName: "Pamela",
        lastName: "Isley",
        rating: 965,
        matchCount: 1,
      },
    ),
    (
      "EdwardNigma_j80JfWOZq",
      {
        id: "EdwardNigma_j80JfWOZq",
        type_: "person",
        firstName: "Edward",
        lastName: "Nigma",
        rating: 948,
        matchCount: 1,
      },
    ),
    (
      "JonathanCrane_R4Q8tVW",
      {
        id: "JonathanCrane_R4Q8tVW",
        type_: "person",
        firstName: "Jonathan",
        lastName: "Crane",
        rating: 899,
        matchCount: 1,
      },
    ),
    (
      "HarveyDent_0eYIiP_Ij5",
      {
        id: "HarveyDent_0eYIiP_Ij5",
        type_: "person",
        firstName: "Harvey",
        lastName: "Dent",
        rating: 1649,
        matchCount: 1,
      },
    ),
    (
      "HugoStrange_az43f9mtS",
      {
        id: "HugoStrange_az43f9mtS",
        type_: "person",
        firstName: "Hugo",
        lastName: "Strange",
        rating: 800,
        matchCount: 0,
      },
    ),
  |]);

let tournaments =
  Js.Dict.fromArray([|
    (
      "CaouTNel9k70jUJ0h6SYM",
      Data.{
        date: Js.Date.fromString("2019-05-22T12:14:47.670Z"),
        id: "CaouTNel9k70jUJ0h6SYM",
        name: "Wayne Manor Open",
        tieBreaks: [|0, 1, 2, 3|],
        byeQueue: [||],
        playerIds: [|
          "BruceWayne_lv_ZsUHTU9",
          "DickGrayson_1C2rCokHH",
          "AlfredPennyworth_y4dW",
          "BarbaraGordon_cL6SpI2",
          "KateKane_klFW6gDfUOTX",
          "SelinaKyle_rJBH-45Xoy",
          "JasonTodd_fc9CeOa-Luw",
          "JamesGordon_1ts9xICT3",
          "HelenaWayne_fE6O0DJcE",
        |],
        roundList: [|
          [|
            {
              id: "FUASEeyES6ez_ROoT6qmU",
              playerIds: {
                whiteId: "JasonTodd_fc9CeOa-Luw",
                blackId: "DickGrayson_1C2rCokHH",
              },
              result: {
                whiteScore: 0.0,
                blackScore: 1.0,
              },
              origRating: {
                whiteRating: 1238,
                blackRating: 2108,
              },
              newRating: {
                whiteRating: 1236,
                blackRating: 2109,
              },
            },
            {
              id: "gqPyD66QMPF-pup41xsB2",
              playerIds: {
                whiteId: "JamesGordon_1ts9xICT3",
                blackId: "AlfredPennyworth_y4dW",
              },
              result: {
                whiteScore: 0.0,
                blackScore: 1.0,
              },
              origRating: {
                whiteRating: 1049,
                blackRating: 2260,
              },
              newRating: {
                whiteRating: 1049,
                blackRating: 2260,
              },
            },
            {
              id: "KpS1lQSzsQWQ3VVWJyA2P",
              playerIds: {
                whiteId: "KateKane_klFW6gDfUOTX",
                blackId: "BarbaraGordon_cL6SpI2",
              },
              result: {
                whiteScore: 0.5,
                blackScore: 0.5,
              },
              origRating: {
                whiteRating: 1527,
                blackRating: 1755,
              },
              newRating: {
                whiteRating: 1553,
                blackRating: 1722,
              },
            },
            {
              id: "OgFuy-wq8mz378EWat46u",
              playerIds: {
                whiteId: "SelinaKyle_rJBH-45Xoy",
                blackId: "BruceWayne_lv_ZsUHTU9",
              },
              result: {
                whiteScore: 0.0,
                blackScore: 1.0,
              },
              origRating: {
                whiteRating: 1284,
                blackRating: 1881,
              },
              newRating: {
                whiteRating: 1278,
                blackRating: 1887,
              },
            },
            {
              id: "f8Ps3GUmd0ZRsBBY8rZOp",
              playerIds: {
                whiteId: "HelenaWayne_fE6O0DJcE",
                blackId: "________DUMMY________",
              },
              result: {
                whiteScore: 1.0,
                blackScore: 0.0,
              },
              origRating: {
                whiteRating: 831,
                blackRating: 0,
              },
              newRating: {
                whiteRating: 831,
                blackRating: 0,
              },
            },
          |],
          [|
            {
              id: "6seKrw7ehbhL766g6L2PF",
              playerIds: {
                whiteId: "DickGrayson_1C2rCokHH",
                blackId: "KateKane_klFW6gDfUOTX",
              },
              result: {
                whiteScore: 1.0,
                blackScore: 0.0,
              },
              origRating: {
                whiteRating: 2109,
                blackRating: 1685,
              },
              newRating: {
                whiteRating: 2122,
                blackRating: 1672,
              },
            },
            {
              id: "TCSjz48ZXqjamtYUFNg0B",
              playerIds: {
                whiteId: "BruceWayne_lv_ZsUHTU9",
                blackId: "HelenaWayne_fE6O0DJcE",
              },
              result: {
                whiteScore: 1.0,
                blackScore: 0.0,
              },
              origRating: {
                whiteRating: 1887,
                blackRating: 831,
              },
              newRating: {
                whiteRating: 1887,
                blackRating: 830,
              },
            },
            {
              id: "zF64DEsN8sHydpDDsg37E",
              playerIds: {
                whiteId: "AlfredPennyworth_y4dW",
                blackId: "SelinaKyle_rJBH-45Xoy",
              },
              result: {
                whiteScore: 0.0,
                blackScore: 1.0,
              },
              origRating: {
                whiteRating: 2260,
                blackRating: 1278,
              },
              newRating: {
                whiteRating: 2101,
                blackRating: 1437,
              },
            },
            {
              id: "qVGt1EJq9y0MmvFtumM0A",
              playerIds: {
                whiteId: "BarbaraGordon_cL6SpI2",
                blackId: "JasonTodd_fc9CeOa-Luw",
              },
              result: {
                whiteScore: 1.0,
                blackScore: 0.0,
              },
              origRating: {
                whiteRating: 1545,
                blackRating: 1236,
              },
              newRating: {
                whiteRating: 1574,
                blackRating: 1207,
              },
            },
            {
              id: "UhfHaRWr_-BtVo22xAuJu",
              playerIds: {
                whiteId: "JamesGordon_1ts9xICT3",
                blackId: "________DUMMY________",
              },
              result: {
                whiteScore: 1.0,
                blackScore: 0.0,
              },
              origRating: {
                whiteRating: 1049,
                blackRating: 0,
              },
              newRating: {
                whiteRating: 1049,
                blackRating: 0,
              },
            },
          |],
          [|
            {
              id: "odrOOnZJUe0YAwkfUDqUb",
              playerIds: {
                whiteId: "AlfredPennyworth_y4dW",
                blackId: "BruceWayne_lv_ZsUHTU9",
              },
              result: {
                whiteScore: 0.0,
                blackScore: 1.0,
              },
              origRating: {
                whiteRating: 2101,
                blackRating: 1887,
              },
              newRating: {
                whiteRating: 1998,
                blackRating: 1990,
              },
            },
            {
              id: "qzCMqUwNIDAcFSAuA5yCm",
              playerIds: {
                whiteId: "HelenaWayne_fE6O0DJcE",
                blackId: "DickGrayson_1C2rCokHH",
              },
              result: {
                whiteScore: 1.0,
                blackScore: 0.0,
              },
              origRating: {
                whiteRating: 830,
                blackRating: 2122,
              },
              newRating: {
                whiteRating: 990,
                blackRating: 2008,
              },
            },
            {
              id: "6QgVqdtcJPjfVp3UZ8S9g",
              playerIds: {
                whiteId: "SelinaKyle_rJBH-45Xoy",
                blackId: "BarbaraGordon_cL6SpI2",
              },
              result: {
                whiteScore: 1.0,
                blackScore: 0.0,
              },
              origRating: {
                whiteRating: 1437,
                blackRating: 1574,
              },
              newRating: {
                whiteRating: 1529,
                blackRating: 1464,
              },
            },
            {
              id: "as45gODKMLC5-3_UsTyx5",
              playerIds: {
                whiteId: "KateKane_klFW6gDfUOTX",
                blackId: "JamesGordon_1ts9xICT3",
              },
              result: {
                whiteScore: 0.0,
                blackScore: 1.0,
              },
              origRating: {
                whiteRating: 1672,
                blackRating: 1049,
              },
              newRating: {
                whiteRating: 1542,
                blackRating: 1244,
              },
            },
            {
              id: "Pc0CWecSfeGNfvBPjyEIj",
              playerIds: {
                whiteId: "JasonTodd_fc9CeOa-Luw",
                blackId: "________DUMMY________",
              },
              result: {
                whiteScore: 1.0,
                blackScore: 0.0,
              },
              origRating: {
                whiteRating: 1207,
                blackRating: 0,
              },
              newRating: {
                whiteRating: 1207,
                blackRating: 0,
              },
            },
          |],
          [|
            {
              id: "xj0y_Iqkb-g3MDGgmYx2-",
              playerIds: {
                whiteId: "BruceWayne_lv_ZsUHTU9",
                blackId: "KateKane_klFW6gDfUOTX",
              },
              result: {
                whiteScore: 1.0,
                blackScore: 0.0,
              },
              origRating: {
                whiteRating: 1990,
                blackRating: 1542,
              },
              newRating: {
                whiteRating: 1998,
                blackRating: 1534,
              },
            },
            {
              id: "HWYWtsyaqUkHRExM6kQrt",
              playerIds: {
                whiteId: "DickGrayson_1C2rCokHH",
                blackId: "JamesGordon_1ts9xICT3",
              },
              result: {
                whiteScore: 1.0,
                blackScore: 0.0,
              },
              origRating: {
                whiteRating: 2008,
                blackRating: 1244,
              },
              newRating: {
                whiteRating: 2009,
                blackRating: 1243,
              },
            },
            {
              id: "uAzHZVMC71liQZ-6fWWeD",
              playerIds: {
                whiteId: "HelenaWayne_fE6O0DJcE",
                blackId: "SelinaKyle_rJBH-45Xoy",
              },
              result: {
                whiteScore: 0.0,
                blackScore: 1.0,
              },
              origRating: {
                whiteRating: 990,
                blackRating: 1529,
              },
              newRating: {
                whiteRating: 983,
                blackRating: 1534,
              },
            },
            {
              id: "_tCBn9YNIyto-vXpxm7WI",
              playerIds: {
                whiteId: "JasonTodd_fc9CeOa-Luw",
                blackId: "AlfredPennyworth_y4dW",
              },
              result: {
                whiteScore: 0.0,
                blackScore: 1.0,
              },
              origRating: {
                whiteRating: 1207,
                blackRating: 1998,
              },
              newRating: {
                whiteRating: 1205,
                blackRating: 1999,
              },
            },
            {
              id: "L7yatE2oVKlV7LOY6-d7Y",
              playerIds: {
                whiteId: "BarbaraGordon_cL6SpI2",
                blackId: "________DUMMY________",
              },
              result: {
                whiteScore: 1.0,
                blackScore: 0.0,
              },
              origRating: {
                whiteRating: 1464,
                blackRating: 0,
              },
              newRating: {
                whiteRating: 1464,
                blackRating: 0,
              },
            },
          |],
        |],
      },
    ),
    (
      "tvAdS4YbSOznrBgrg0ITA",
      {
        date: Js.Date.fromString("2019-05-29T12:15:20.593Z"),
        id: "tvAdS4YbSOznrBgrg0ITA",
        name: "The Battle for Gotham City",
        tieBreaks: [|0, 1, 2, 3|],
        byeQueue: [||],
        playerIds: [|
          "BruceWayne_lv_ZsUHTU9",
          "DickGrayson_1C2rCokHH",
          "AlfredPennyworth_y4dW",
          "BarbaraGordon_cL6SpI2",
          "KateKane_klFW6gDfUOTX",
          "SelinaKyle_rJBH-45Xoy",
          "JasonTodd_fc9CeOa-Luw",
          "JamesGordon_1ts9xICT3",
          "HelenaWayne_fE6O0DJcE",
          "Joker_v0z2416fpAZ9o2c",
          "HarleyQuinn_-10-02VPH",
          "VictorFries_cWaQoW014",
          "OswaldCobblepot_lfCro",
          "RasAlGhul_k9n8k852bHr",
          "PamelaIsley_vH5vD8uPB",
          "EdwardNigma_j80JfWOZq",
          "JonathanCrane_R4Q8tVW",
          "HarveyDent_0eYIiP_Ij5",
        |],
        roundList: [|
          [|
            {
              id: "5f8GYcR8V44NYvTN1cZle",
              playerIds: {
                whiteId: "EdwardNigma_j80JfWOZq",
                blackId: "BruceWayne_lv_ZsUHTU9",
              },
              result: {
                whiteScore: 0.0,
                blackScore: 1.0,
              },
              origRating: {
                whiteRating: 950,
                blackRating: 1998,
              },
              newRating: {
                whiteRating: 948,
                blackRating: 1998,
              },
            },
            {
              id: "GPTct4sL368SryTLFUu8E",
              playerIds: {
                whiteId: "JonathanCrane_R4Q8tVW",
                blackId: "AlfredPennyworth_y4dW",
              },
              result: {
                whiteScore: 0.0,
                blackScore: 1.0,
              },
              origRating: {
                whiteRating: 900,
                blackRating: 1999,
              },
              newRating: {
                whiteRating: 899,
                blackRating: 1999,
              },
            },
            {
              id: "AxtoztZ6O19nyrLfZ4YaU",
              playerIds: {
                whiteId: "HarveyDent_0eYIiP_Ij5",
                blackId: "DickGrayson_1C2rCokHH",
              },
              result: {
                whiteScore: 1.0,
                blackScore: 0.0,
              },
              origRating: {
                whiteRating: 850,
                blackRating: 2009,
              },
              newRating: {
                whiteRating: 1649,
                blackRating: 1909,
              },
            },
            {
              id: "bUM_tWQsAtPe1gqRzlXd1",
              playerIds: {
                whiteId: "RasAlGhul_k9n8k852bHr",
                blackId: "SelinaKyle_rJBH-45Xoy",
              },
              result: {
                whiteScore: 0.5,
                blackScore: 0.5,
              },
              origRating: {
                whiteRating: 1050,
                blackRating: 1534,
              },
              newRating: {
                whiteRating: 1404,
                blackRating: 1495,
              },
            },
            {
              id: "bAOVlP-M5xaPk1qofNReb",
              playerIds: {
                whiteId: "OswaldCobblepot_lfCro",
                blackId: "BarbaraGordon_cL6SpI2",
              },
              result: {
                whiteScore: 1.0,
                blackScore: 0.0,
              },
              origRating: {
                whiteRating: 1100,
                blackRating: 1464,
              },
              newRating: {
                whiteRating: 1812,
                blackRating: 1345,
              },
            },
            {
              id: "4omlgiGSaE1BmrHdABSym",
              playerIds: {
                whiteId: "PamelaIsley_vH5vD8uPB",
                blackId: "KateKane_klFW6gDfUOTX",
              },
              result: {
                whiteScore: 0.0,
                blackScore: 1.0,
              },
              origRating: {
                whiteRating: 1000,
                blackRating: 1534,
              },
              newRating: {
                whiteRating: 965,
                blackRating: 1539,
              },
            },
            {
              id: "ysdEVYS2AyuKyOAwLLpTF",
              playerIds: {
                whiteId: "HarleyQuinn_-10-02VPH",
                blackId: "JamesGordon_1ts9xICT3",
              },
              result: {
                whiteScore: 1.0,
                blackScore: 0.0,
              },
              origRating: {
                whiteRating: 1200,
                blackRating: 1242,
              },
              newRating: {
                whiteRating: 1648,
                blackRating: 1167,
              },
            },
            {
              id: "YoJ9WGokAYrmJjfxCCf87",
              playerIds: {
                whiteId: "VictorFries_cWaQoW014",
                blackId: "Joker_v0z2416fpAZ9o2c",
              },
              result: {
                whiteScore: 0.0,
                blackScore: 1.0,
              },
              origRating: {
                whiteRating: 1150,
                blackRating: 1250,
              },
              newRating: {
                whiteRating: 862,
                blackRating: 1538,
              },
            },
            {
              id: "Az7SBl3cs7rbwKPBI0IsU",
              playerIds: {
                whiteId: "HelenaWayne_fE6O0DJcE",
                blackId: "JasonTodd_fc9CeOa-Luw",
              },
              result: {
                whiteScore: 1.0,
                blackScore: 0.0,
              },
              origRating: {
                whiteRating: 983,
                blackRating: 1205,
              },
              newRating: {
                whiteRating: 1087,
                blackRating: 1101,
              },
            },
          |],
        |],
      },
    ),
  |]);