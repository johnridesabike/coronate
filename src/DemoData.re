open Data;
let options =
  Db.options(
    ~byeValue=1.0,
    ~avoidPairs=[|
      ("BarbaraGordon_cL6SpI2", "JamesGordon_1ts9xICT3"),
      ("Joker_v0z2416fpAZ9o2c", "HarleyQuinn_-10-02VPH"),
      ("HelenaWayne_fE6O0DJcE", "BruceWayne_lv_ZsUHTU9"),
    |],
    ~lastBackup=Js.Date.fromString("1970-01-01T00:00:00.000Z"),
  );

let players =
  Js.Dict.fromArray([|
    (
      "BruceWayne_lv_ZsUHTU9",
      Player.t(
        ~id="BruceWayne_lv_ZsUHTU9",
        ~type_="person",
        ~firstName="Bruce",
        ~lastName="Wayne",
        ~rating=1998,
        ~matchCount=9,
      ),
    ),
    (
      "DickGrayson_1C2rCokHH",
      Player.t(
        ~id="DickGrayson_1C2rCokHH",
        ~type_="person",
        ~firstName="Dick",
        ~lastName="Grayson",
        ~rating=1909,
        ~matchCount=9,
      ),
    ),
    (
      "AlfredPennyworth_y4dW",
      Player.t(
        ~id="AlfredPennyworth_y4dW",
        ~type_="person",
        ~firstName="Alfred",
        ~lastName="Pennyworth",
        ~rating=1999,
        ~matchCount=9,
      ),
    ),
    (
      "BarbaraGordon_cL6SpI2",
      Player.t(
        ~id="BarbaraGordon_cL6SpI2",
        ~type_="person",
        ~firstName="Barbara",
        ~lastName="Gordon",
        ~rating=1345,
        ~matchCount=7,
      ),
    ),
    (
      "KateKane_klFW6gDfUOTX",
      Player.t(
        ~id="KateKane_klFW6gDfUOTX",
        ~type_="person",
        ~firstName="Kate",
        ~lastName="Kane",
        ~rating=1539,
        ~matchCount=9,
      ),
    ),
    (
      "SelinaKyle_rJBH-45Xoy",
      Player.t(
        ~id="SelinaKyle_rJBH-45Xoy",
        ~type_="person",
        ~firstName="Selina",
        ~lastName="Kyle",
        ~rating=1495,
        ~matchCount=9,
      ),
    ),
    (
      "JasonTodd_fc9CeOa-Luw",
      Player.t(
        ~id="JasonTodd_fc9CeOa-Luw",
        ~type_="person",
        ~firstName="Jason",
        ~lastName="Todd",
        ~rating=1101,
        ~matchCount=7,
      ),
    ),
    (
      "JamesGordon_1ts9xICT3",
      Player.t(
        ~id="JamesGordon_1ts9xICT3",
        ~type_="person",
        ~firstName="James",
        ~lastName="Gordon",
        ~rating=1167,
        ~matchCount=7,
      ),
    ),
    (
      "HelenaWayne_fE6O0DJcE",
      Player.t(
        ~id="HelenaWayne_fE6O0DJcE",
        ~type_="person",
        ~firstName="Helena",
        ~lastName="Wayne",
        ~rating=1087,
        ~matchCount=7,
      ),
    ),
    (
      "Joker_v0z2416fpAZ9o2c",
      Player.t(
        ~id="Joker_v0z2416fpAZ9o2c",
        ~type_="person",
        ~firstName="Joker",
        ~lastName="",
        ~rating=1538,
        ~matchCount=1,
      ),
    ),
    (
      "HarleyQuinn_-10-02VPH",
      Player.t(
        ~id="HarleyQuinn_-10-02VPH",
        ~type_="person",
        ~firstName="Harley",
        ~lastName="Quinn",
        ~rating=1648,
        ~matchCount=1,
      ),
    ),
    (
      "VictorFries_cWaQoW014",
      Player.t(
        ~id="VictorFries_cWaQoW014",
        ~type_="person",
        ~firstName="Victor",
        ~lastName="Fries",
        ~rating=862,
        ~matchCount=1,
      ),
    ),
    (
      "OswaldCobblepot_lfCro",
      Player.t(
        ~id="OswaldCobblepot_lfCro",
        ~type_="person",
        ~firstName="Oswald",
        ~lastName="Cobblepot",
        ~rating=1812,
        ~matchCount=1,
      ),
    ),
    (
      "RasAlGhul_k9n8k852bHr",
      Player.t(
        ~id="RasAlGhul_k9n8k852bHr",
        ~type_="person",
        ~firstName="Ra's",
        ~lastName="al Ghul",
        ~rating=1404,
        ~matchCount=1,
      ),
    ),
    (
      "PamelaIsley_vH5vD8uPB",
      Player.t(
        ~id="PamelaIsley_vH5vD8uPB",
        ~type_="person",
        ~firstName="Pamela",
        ~lastName="Isley",
        ~rating=965,
        ~matchCount=1,
      ),
    ),
    (
      "EdwardNigma_j80JfWOZq",
      Player.t(
        ~id="EdwardNigma_j80JfWOZq",
        ~type_="person",
        ~firstName="Edward",
        ~lastName="Nigma",
        ~rating=948,
        ~matchCount=1,
      ),
    ),
    (
      "JonathanCrane_R4Q8tVW",
      Player.t(
        ~id="JonathanCrane_R4Q8tVW",
        ~type_="person",
        ~firstName="Jonathan",
        ~lastName="Crane",
        ~rating=899,
        ~matchCount=1,
      ),
    ),
    (
      "HarveyDent_0eYIiP_Ij5",
      Player.t(
        ~id="HarveyDent_0eYIiP_Ij5",
        ~type_="person",
        ~firstName="Harvey",
        ~lastName="Dent",
        ~rating=1649,
        ~matchCount=1,
      ),
    ),
    (
      "HugoStrange_az43f9mtS",
      Player.t(
        ~id="HugoStrange_az43f9mtS",
        ~type_="person",
        ~firstName="Hugo",
        ~lastName="Strange",
        ~rating=800,
        ~matchCount=0,
      ),
    ),
  |]);

let tournaments =
  Js.Dict.fromArray([|
    (
      "CaouTNel9k70jUJ0h6SYM",
      Tournament.t(
        ~date=Js.Date.fromString("2019-05-22T12:14:47.670Z"),
        ~id="CaouTNel9k70jUJ0h6SYM",
        ~name="Wayne Manor Open",
        ~tieBreaks=[|0, 1, 2, 3|],
        ~byeQueue=[||],
        ~playerIds=[|
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
        ~roundList=[|
          [|
            Match.t(
              ~id="FUASEeyES6ez_ROoT6qmU",
              ~playerIds=
                Match.ids(
                  ~whiteId="JasonTodd_fc9CeOa-Luw",
                  ~blackId="DickGrayson_1C2rCokHH",
                ),
              ~result=Match.results(~whiteScore=0.0, ~blackScore=1.0),
              ~origRating=Match.ratings(~whiteRating=1238, ~blackRating=2108),
              ~newRating=Match.ratings(~whiteRating=1236, ~blackRating=2109),
            ),
            Match.t(
              ~id="gqPyD66QMPF-pup41xsB2",
              ~playerIds=
                Match.ids(
                  ~whiteId="JamesGordon_1ts9xICT3",
                  ~blackId="AlfredPennyworth_y4dW",
                ),
              ~result=Match.results(~whiteScore=0.0, ~blackScore=1.0),
              ~origRating=Match.ratings(~whiteRating=1049, ~blackRating=2260),
              ~newRating=Match.ratings(~whiteRating=1049, ~blackRating=2260),
            ),
            Match.t(
              ~id="KpS1lQSzsQWQ3VVWJyA2P",
              ~playerIds=
                Match.ids(
                  ~whiteId="KateKane_klFW6gDfUOTX",
                  ~blackId="BarbaraGordon_cL6SpI2",
                ),
              ~result=Match.results(~whiteScore=0.5, ~blackScore=0.5),
              ~origRating=Match.ratings(~whiteRating=1527, ~blackRating=1755),
              ~newRating=Match.ratings(~whiteRating=1553, ~blackRating=1722),
            ),
            Match.t(
              ~id="OgFuy-wq8mz378EWat46u",
              ~playerIds=
                Match.ids(
                  ~whiteId="SelinaKyle_rJBH-45Xoy",
                  ~blackId="BruceWayne_lv_ZsUHTU9",
                ),
              ~result=Match.results(~whiteScore=0.0, ~blackScore=1.0),
              ~origRating=Match.ratings(~whiteRating=1284, ~blackRating=1881),
              ~newRating=Match.ratings(~whiteRating=1278, ~blackRating=1887),
            ),
            Match.t(
              ~id="f8Ps3GUmd0ZRsBBY8rZOp",
              ~playerIds=
                Match.ids(
                  ~whiteId="HelenaWayne_fE6O0DJcE",
                  ~blackId="________DUMMY________",
                ),
              ~result=Match.results(~whiteScore=1.0, ~blackScore=0.0),
              ~origRating=Match.ratings(~whiteRating=831, ~blackRating=0),
              ~newRating=Match.ratings(~whiteRating=831, ~blackRating=0),
            ),
          |],
          [|
            Match.t(
              ~id="6seKrw7ehbhL766g6L2PF",
              ~playerIds=
                Match.ids(
                  ~whiteId="DickGrayson_1C2rCokHH",
                  ~blackId="KateKane_klFW6gDfUOTX",
                ),
              ~result=Match.results(~whiteScore=1.0, ~blackScore=0.0),
              ~origRating=Match.ratings(~whiteRating=2109, ~blackRating=1685),
              ~newRating=Match.ratings(~whiteRating=2122, ~blackRating=1672),
            ),
            Match.t(
              ~id="TCSjz48ZXqjamtYUFNg0B",
              ~playerIds=
                Match.ids(
                  ~whiteId="BruceWayne_lv_ZsUHTU9",
                  ~blackId="HelenaWayne_fE6O0DJcE",
                ),
              ~result=Match.results(~whiteScore=1.0, ~blackScore=0.0),
              ~origRating=Match.ratings(~whiteRating=1887, ~blackRating=831),
              ~newRating=Match.ratings(~whiteRating=1887, ~blackRating=830),
            ),
            Match.t(
              ~id="zF64DEsN8sHydpDDsg37E",
              ~playerIds=
                Match.ids(
                  ~whiteId="AlfredPennyworth_y4dW",
                  ~blackId="SelinaKyle_rJBH-45Xoy",
                ),
              ~result=Match.results(~whiteScore=0.0, ~blackScore=1.0),
              ~origRating=Match.ratings(~whiteRating=2260, ~blackRating=1278),
              ~newRating=Match.ratings(~whiteRating=2101, ~blackRating=1437),
            ),
            Match.t(
              ~id="qVGt1EJq9y0MmvFtumM0A",
              ~playerIds=
                Match.ids(
                  ~whiteId="BarbaraGordon_cL6SpI2",
                  ~blackId="JasonTodd_fc9CeOa-Luw",
                ),
              ~result=Match.results(~whiteScore=1.0, ~blackScore=0.0),
              ~origRating=Match.ratings(~whiteRating=1545, ~blackRating=1236),
              ~newRating=Match.ratings(~whiteRating=1574, ~blackRating=1207),
            ),
            Match.t(
              ~id="UhfHaRWr_-BtVo22xAuJu",
              ~playerIds=
                Match.ids(
                  ~whiteId="JamesGordon_1ts9xICT3",
                  ~blackId="________DUMMY________",
                ),
              ~result=Match.results(~whiteScore=1.0, ~blackScore=0.0),
              ~origRating=Match.ratings(~whiteRating=1049, ~blackRating=0),
              ~newRating=Match.ratings(~whiteRating=1049, ~blackRating=0),
            ),
          |],
          [|
            Match.t(
              ~id="odrOOnZJUe0YAwkfUDqUb",
              ~playerIds=
                Match.ids(
                  ~whiteId="AlfredPennyworth_y4dW",
                  ~blackId="BruceWayne_lv_ZsUHTU9",
                ),
              ~result=Match.results(~whiteScore=0.0, ~blackScore=1.0),
              ~origRating=Match.ratings(~whiteRating=2101, ~blackRating=1887),
              ~newRating=Match.ratings(~whiteRating=1998, ~blackRating=1990),
            ),
            Match.t(
              ~id="qzCMqUwNIDAcFSAuA5yCm",
              ~playerIds=
                Match.ids(
                  ~whiteId="HelenaWayne_fE6O0DJcE",
                  ~blackId="DickGrayson_1C2rCokHH",
                ),
              ~result=Match.results(~whiteScore=1.0, ~blackScore=0.0),
              ~origRating=Match.ratings(~whiteRating=830, ~blackRating=2122),
              ~newRating=Match.ratings(~whiteRating=990, ~blackRating=2008),
            ),
            Match.t(
              ~id="6QgVqdtcJPjfVp3UZ8S9g",
              ~playerIds=
                Match.ids(
                  ~whiteId="SelinaKyle_rJBH-45Xoy",
                  ~blackId="BarbaraGordon_cL6SpI2",
                ),
              ~result=Match.results(~whiteScore=1.0, ~blackScore=0.0),
              ~origRating=Match.ratings(~whiteRating=1437, ~blackRating=1574),
              ~newRating=Match.ratings(~whiteRating=1529, ~blackRating=1464),
            ),
            Match.t(
              ~id="as45gODKMLC5-3_UsTyx5",
              ~playerIds=
                Match.ids(
                  ~whiteId="KateKane_klFW6gDfUOTX",
                  ~blackId="JamesGordon_1ts9xICT3",
                ),
              ~result=Match.results(~whiteScore=0.0, ~blackScore=1.0),
              ~origRating=Match.ratings(~whiteRating=1672, ~blackRating=1049),
              ~newRating=Match.ratings(~whiteRating=1542, ~blackRating=1244),
            ),
            Match.t(
              ~id="Pc0CWecSfeGNfvBPjyEIj",
              ~playerIds=
                Match.ids(
                  ~whiteId="JasonTodd_fc9CeOa-Luw",
                  ~blackId="________DUMMY________",
                ),
              ~result=Match.results(~whiteScore=1.0, ~blackScore=0.0),
              ~origRating=Match.ratings(~whiteRating=1207, ~blackRating=0),
              ~newRating=Match.ratings(~whiteRating=1207, ~blackRating=0),
            ),
          |],
          [|
            Match.t(
              ~id="xj0y_Iqkb-g3MDGgmYx2-",
              ~playerIds=
                Match.ids(
                  ~whiteId="BruceWayne_lv_ZsUHTU9",
                  ~blackId="KateKane_klFW6gDfUOTX",
                ),
              ~result=Match.results(~whiteScore=1.0, ~blackScore=0.0),
              ~origRating=Match.ratings(~whiteRating=1990, ~blackRating=1542),
              ~newRating=Match.ratings(~whiteRating=1998, ~blackRating=1534),
            ),
            Match.t(
              ~id="HWYWtsyaqUkHRExM6kQrt",
              ~playerIds=
                Match.ids(
                  ~whiteId="DickGrayson_1C2rCokHH",
                  ~blackId="JamesGordon_1ts9xICT3",
                ),
              ~result=Match.results(~whiteScore=1.0, ~blackScore=0.0),
              ~origRating=Match.ratings(~whiteRating=2008, ~blackRating=1244),
              ~newRating=Match.ratings(~whiteRating=2009, ~blackRating=1243),
            ),
            Match.t(
              ~id="uAzHZVMC71liQZ-6fWWeD",
              ~playerIds=
                Match.ids(
                  ~whiteId="HelenaWayne_fE6O0DJcE",
                  ~blackId="SelinaKyle_rJBH-45Xoy",
                ),
              ~result=Match.results(~whiteScore=0.0, ~blackScore=1.0),
              ~origRating=Match.ratings(~whiteRating=990, ~blackRating=1529),
              ~newRating=Match.ratings(~whiteRating=983, ~blackRating=1534),
            ),
            Match.t(
              ~id="_tCBn9YNIyto-vXpxm7WI",
              ~playerIds=
                Match.ids(
                  ~whiteId="JasonTodd_fc9CeOa-Luw",
                  ~blackId="AlfredPennyworth_y4dW",
                ),
              ~result=Match.results(~whiteScore=0.0, ~blackScore=1.0),
              ~origRating=Match.ratings(~whiteRating=1207, ~blackRating=1998),
              ~newRating=Match.ratings(~whiteRating=1205, ~blackRating=1999),
            ),
            Match.t(
              ~id="L7yatE2oVKlV7LOY6-d7Y",
              ~playerIds=
                Match.ids(
                  ~whiteId="BarbaraGordon_cL6SpI2",
                  ~blackId="________DUMMY________",
                ),
              ~result=Match.results(~whiteScore=1.0, ~blackScore=0.0),
              ~origRating=Match.ratings(~whiteRating=1464, ~blackRating=0),
              ~newRating=Match.ratings(~whiteRating=1464, ~blackRating=0),
            ),
          |],
        |],
      ),
    ),
    (
      "tvAdS4YbSOznrBgrg0ITA",
      Tournament.t(
        ~date=Js.Date.fromString("2019-05-29T12:15:20.593Z"),
        ~id="tvAdS4YbSOznrBgrg0ITA",
        ~name="The Battle for Gotham City",
        ~tieBreaks=[|0, 1, 2, 3|],
        ~byeQueue=[||],
        ~playerIds=[|
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
        ~roundList=[|
          [|
            Match.t(
              ~id="5f8GYcR8V44NYvTN1cZle",
              ~playerIds=
                Match.ids(
                  ~whiteId="EdwardNigma_j80JfWOZq",
                  ~blackId="BruceWayne_lv_ZsUHTU9",
                ),
              ~result=Match.results(~whiteScore=0.0, ~blackScore=1.0),
              ~origRating=Match.ratings(~whiteRating=950, ~blackRating=1998),
              ~newRating=Match.ratings(~whiteRating=948, ~blackRating=1998),
            ),
            Match.t(
              ~id="GPTct4sL368SryTLFUu8E",
              ~playerIds=
                Match.ids(
                  ~whiteId="JonathanCrane_R4Q8tVW",
                  ~blackId="AlfredPennyworth_y4dW",
                ),
              ~result=Match.results(~whiteScore=0.0, ~blackScore=1.0),
              ~origRating=Match.ratings(~whiteRating=900, ~blackRating=1999),
              ~newRating=Match.ratings(~whiteRating=899, ~blackRating=1999),
            ),
            Match.t(
              ~id="AxtoztZ6O19nyrLfZ4YaU",
              ~playerIds=
                Match.ids(
                  ~whiteId="HarveyDent_0eYIiP_Ij5",
                  ~blackId="DickGrayson_1C2rCokHH",
                ),
              ~result=Match.results(~whiteScore=1.0, ~blackScore=0.0),
              ~origRating=Match.ratings(~whiteRating=850, ~blackRating=2009),
              ~newRating=Match.ratings(~whiteRating=1649, ~blackRating=1909),
            ),
            Match.t(
              ~id="bUM_tWQsAtPe1gqRzlXd1",
              ~playerIds=
                Match.ids(
                  ~whiteId="RasAlGhul_k9n8k852bHr",
                  ~blackId="SelinaKyle_rJBH-45Xoy",
                ),
              ~result=Match.results(~whiteScore=0.5, ~blackScore=0.5),
              ~origRating=Match.ratings(~whiteRating=1050, ~blackRating=1534),
              ~newRating=Match.ratings(~whiteRating=1404, ~blackRating=1495),
            ),
            Match.t(
              ~id="bAOVlP-M5xaPk1qofNReb",
              ~playerIds=
                Match.ids(
                  ~whiteId="OswaldCobblepot_lfCro",
                  ~blackId="BarbaraGordon_cL6SpI2",
                ),
              ~result=Match.results(~whiteScore=1.0, ~blackScore=0.0),
              ~origRating=Match.ratings(~whiteRating=1100, ~blackRating=1464),
              ~newRating=Match.ratings(~whiteRating=1812, ~blackRating=1345),
            ),
            Match.t(
              ~id="4omlgiGSaE1BmrHdABSym",
              ~playerIds=
                Match.ids(
                  ~whiteId="PamelaIsley_vH5vD8uPB",
                  ~blackId="KateKane_klFW6gDfUOTX",
                ),
              ~result=Match.results(~whiteScore=0.0, ~blackScore=1.0),
              ~origRating=Match.ratings(~whiteRating=1000, ~blackRating=1534),
              ~newRating=Match.ratings(~whiteRating=965, ~blackRating=1539),
            ),
            Match.t(
              ~id="ysdEVYS2AyuKyOAwLLpTF",
              ~playerIds=
                Match.ids(
                  ~whiteId="HarleyQuinn_-10-02VPH",
                  ~blackId="JamesGordon_1ts9xICT3",
                ),
              ~result=Match.results(~whiteScore=1.0, ~blackScore=0.0),
              ~origRating=Match.ratings(~whiteRating=1200, ~blackRating=1242),
              ~newRating=Match.ratings(~whiteRating=1648, ~blackRating=1167),
            ),
            Match.t(
              ~id="YoJ9WGokAYrmJjfxCCf87",
              ~playerIds=
                Match.ids(
                  ~whiteId="VictorFries_cWaQoW014",
                  ~blackId="Joker_v0z2416fpAZ9o2c",
                ),
              ~result=Match.results(~whiteScore=0.0, ~blackScore=1.0),
              ~origRating=Match.ratings(~whiteRating=1150, ~blackRating=1250),
              ~newRating=Match.ratings(~whiteRating=862, ~blackRating=1538),
            ),
            Match.t(
              ~id="Az7SBl3cs7rbwKPBI0IsU",
              ~playerIds=
                Match.ids(
                  ~whiteId="HelenaWayne_fE6O0DJcE",
                  ~blackId="JasonTodd_fc9CeOa-Luw",
                ),
              ~result=Match.results(~whiteScore=1.0, ~blackScore=0.0),
              ~origRating=Match.ratings(~whiteRating=983, ~blackRating=1205),
              ~newRating=Match.ratings(~whiteRating=1087, ~blackRating=1101),
            ),
          |],
        |],
      ),
    ),
  |]);