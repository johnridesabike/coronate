open Data;
let options =
  Db.options(
    ~byeValue=1.0,
    ~avoidPairs=[|
      ("TVs_Frank____________", "TVs_Son_of_TVs_Frank_"),
      ("Pearl_Forrester______", "Dr_Clayton_Forrester_"),
      ("Kinga_Forrester______", "Dr_Clayton_Forrester_"),
      ("Kinga_Forrester______", "Pearl_Forrester______"),
    |],
    ~lastBackup=Js.Date.fromString("1970-01-01T00:00:00.000Z"),
  );

let players =
  Js.Dict.fromArray([|
    (
      "Cambot_______________",
      Player.t(
        ~id="Cambot_______________",
        ~matchCount=25,
        ~rating=1500,
        ~type_="person",
        ~firstName="Cambot",
        ~lastName="",
      ),
    ),
    (
      "Crow_T_Robot_________",
      Player.t(
        ~id="Crow_T_Robot_________",
        ~matchCount=5,
        ~rating=1700,
        ~type_="person",
        ~firstName="Crow T",
        ~lastName="Robot",
      ),
    ),
    (
      "Dr_Clayton_Forrester_",
      Player.t(
        ~id="Dr_Clayton_Forrester_",
        ~matchCount=40,
        ~rating=2100,
        ~type_="person",
        ~firstName="Clayton",
        ~lastName="Forrester",
      ),
    ),
    (
      "Grandy_McMaster______",
      Player.t(
        ~id="Grandy_McMaster______",
        ~matchCount=100,
        ~rating=2600,
        ~type_="person",
        ~firstName="Grandy",
        ~lastName="McMaster",
      ),
    ),
    (
      "Gypsy________________",
      Player.t(
        ~id="Gypsy________________",
        ~matchCount=15,
        ~rating=1600,
        ~type_="person",
        ~firstName="Gypsy",
        ~lastName="",
      ),
    ),
    (
      "Joel_Robinson________",
      Player.t(
        ~id="Joel_Robinson________",
        ~matchCount=70,
        ~rating=2400,
        ~type_="person",
        ~firstName="Joel",
        ~lastName="Robinson",
      ),
    ),
    (
      "Jonah_Heston_________",
      Player.t(
        ~id="Jonah_Heston_________",
        ~matchCount=50,
        ~rating=2200,
        ~type_="person",
        ~firstName="Jonah",
        ~lastName="Heston",
      ),
    ),
    (
      "Kinga_Forrester______",
      Player.t(
        ~id="Kinga_Forrester______",
        ~matchCount=20,
        ~rating=1900,
        ~type_="person",
        ~firstName="Kinga",
        ~lastName="Forrester",
      ),
    ),
    (
      "Larry_Erhardt________",
      Player.t(
        ~id="Larry_Erhardt________",
        ~matchCount=45,
        ~rating=1300,
        ~type_="person",
        ~firstName="Larry",
        ~lastName="Erhardt",
      ),
    ),
    (
      "Mike_Nelson__________",
      Player.t(
        ~id="Mike_Nelson__________",
        ~matchCount=60,
        ~rating=2300,
        ~type_="person",
        ~firstName="Mike",
        ~lastName="Nelson",
      ),
    ),
    (
      "Newbie_McNewberson___",
      Player.t(
        ~id="Newbie_McNewberson___",
        ~matchCount=0,
        ~rating=800,
        ~type_="person",
        ~firstName="Newbie",
        ~lastName="McNewberson",
      ),
    ),
    (
      "Observer_Brain_Guy___",
      Player.t(
        ~id="Observer_Brain_Guy___",
        ~matchCount=55,
        ~rating=1200,
        ~type_="person",
        ~firstName="Brain",
        ~lastName="Guy",
      ),
    ),
    (
      "Pearl_Forrester______",
      Player.t(
        ~id="Pearl_Forrester______",
        ~matchCount=30,
        ~rating=2000,
        ~type_="person",
        ~firstName="Pearl",
        ~lastName="Forrester",
      ),
    ),
    (
      "Professor_Bobo_______",
      Player.t(
        ~id="Professor_Bobo_______",
        ~matchCount=75,
        ~rating=1000,
        ~type_="person",
        ~firstName="Bobo",
        ~lastName="Professor",
      ),
    ),
    (
      "TVs_Frank____________",
      Player.t(
        ~id="TVs_Frank____________",
        ~matchCount=35,
        ~rating=1400,
        ~type_="person",
        ~firstName="TV's",
        ~lastName="Frank",
      ),
    ),
    (
      "TVs_Son_of_TVs_Frank_",
      Player.t(
        ~id="TVs_Son_of_TVs_Frank_",
        ~matchCount=65,
        ~rating=1100,
        ~type_="person",
        ~firstName="TV's",
        ~lastName="Max",
      ),
    ),
    (
      "Tom_Servo____________",
      Player.t(
        ~id="Tom_Servo____________",
        ~matchCount=10,
        ~rating=1800,
        ~type_="person",
        ~firstName="Tom",
        ~lastName="Servo",
      ),
    ),
  |]);

let tournaments =
  Js.Dict.fromArray([|
    (
      "Bye_Round_Tourney____",
      Tournament.t(
        ~byeQueue=[||],
        ~date=Js.Date.fromString("2019-06-12T23:49:47.103Z"),
        ~id="Bye_Round_Tourney____",
        ~playerIds=[|
          "Joel_Robinson________",
          "Crow_T_Robot_________",
          "Tom_Servo____________",
          "Gypsy________________",
          "Cambot_______________",
          "Newbie_McNewberson___",
          "Grandy_McMaster______",
        |],
        ~roundList=[|[||]|],
        ~tieBreaks=[|0, 1, 2, 3|],
        ~name="Bye Round Tourney",
      ),
    ),
    (
      "Bye_Round_Tourney_2__",
      Tournament.t(
        ~byeQueue=[||],
        ~date=Js.Date.fromString("2019-06-12T23:49:47.103Z"),
        ~id="Bye_Round_Tourney_2__",
        ~playerIds=[|
          "Joel_Robinson________",
          "Crow_T_Robot_________",
          "Tom_Servo____________",
          "Gypsy________________",
          "Cambot_______________",
          "Newbie_McNewberson___",
          "Grandy_McMaster______",
        |],
        ~roundList=[|
          [|
            Match.t(
              ~id="xTXxZHB0sTt__xIAg45fm",
              ~result=Match.results(~whiteScore=0.0, ~blackScore=1.0),
              ~newRating=Match.ratings(~whiteRating=2592, ~blackRating=1833),
              ~origRating=Match.ratings(~whiteRating=2600, ~blackRating=1700),
              ~playerIds=
                Match.ids(
                  ~whiteId="Grandy_McMaster______",
                  ~blackId="Crow_T_Robot_________",
                ),
            ),
            Match.t(
              ~id="zQcf9RWXK7iuU6ibPzrhU",
              ~result=Match.results(~whiteScore=1.0, ~blackScore=0.0),
              ~newRating=Match.ratings(~whiteRating=2400, ~blackRating=1600),
              ~origRating=Match.ratings(~whiteRating=2400, ~blackRating=1600),
              ~playerIds=
                Match.ids(
                  ~whiteId="Joel_Robinson________",
                  ~blackId="Gypsy________________",
                ),
            ),
            Match.t(
              ~id="Vw_X0c7O4vshrYEO-oSzR",
              ~result=Match.results(~whiteScore=0.0, ~blackScore=1.0),
              ~newRating=Match.ratings(~whiteRating=1738, ~blackRating=1526),
              ~origRating=Match.ratings(~whiteRating=1800, ~blackRating=1500),
              ~playerIds=
                Match.ids(
                  ~whiteId="Tom_Servo____________",
                  ~blackId="Cambot_______________",
                ),
            ),
            Match.t(
              ~id="iSDujOVkOTrcLv_KJmd7s",
              ~result=Match.results(~whiteScore=1.0, ~blackScore=0.0),
              ~newRating=Match.ratings(~whiteRating=800, ~blackRating=0),
              ~origRating=Match.ratings(~whiteRating=800, ~blackRating=0),
              ~playerIds=
                Match.ids(
                  ~whiteId="Newbie_McNewberson___",
                  ~blackId="________DUMMY________",
                ),
            ),
          |],
        |],
        ~tieBreaks=[|0, 1, 2, 3|],
        ~name="Bye Round Tourney 2",
      ),
    ),
    (
      "Bye_Tourney_3________",
      Tournament.t(
        ~byeQueue=[||],
        ~date=Js.Date.fromString("2019-06-17T23:00:29.603Z"),
        ~id="Bye_Tourney_3________",
        ~playerIds=[|
          "Kinga_Forrester______",
          "Newbie_McNewberson___",
          "Jonah_Heston_________",
        |],
        ~roundList=[|
          [|
            Match.t(
              ~id="KkFr4B7FDqiHRWmACgApf",
              ~result=Match.results(~whiteScore=0.0, ~blackScore=1.0),
              ~newRating=Match.ratings(~whiteRating=1894, ~blackRating=2202),
              ~origRating=Match.ratings(~whiteRating=1900, ~blackRating=2200),
              ~playerIds=
                Match.ids(
                  ~whiteId="Kinga_Forrester______",
                  ~blackId="Jonah_Heston_________",
                ),
            ),
            Match.t(
              ~id="R_BTsGSziwgyvFZM3yc5u",
              ~result=Match.results(~whiteScore=1.0, ~blackScore=0.0),
              ~newRating=Match.ratings(~whiteRating=793, ~blackRating=0),
              ~origRating=Match.ratings(~whiteRating=793, ~blackRating=0),
              ~playerIds=
                Match.ids(
                  ~whiteId="Newbie_McNewberson___",
                  ~blackId="________DUMMY________",
                ),
            ),
          |],
          [|
            Match.t(
              ~id="rcyCfpZU6olav5kdVac44",
              ~result=Match.results(~whiteScore=0.0, ~blackScore=1.0),
              ~newRating=Match.ratings(~whiteRating=2187, ~blackRating=953),
              ~origRating=Match.ratings(~whiteRating=2202, ~blackRating=793),
              ~playerIds=
                Match.ids(
                  ~whiteId="Jonah_Heston_________",
                  ~blackId="Newbie_McNewberson___",
                ),
            ),
            Match.t(
              ~id="Nc0Om5fEuwSuzFls9wmME",
              ~result=Match.results(~whiteScore=1.0, ~blackScore=0.0),
              ~newRating=Match.ratings(~whiteRating=1894, ~blackRating=0),
              ~origRating=Match.ratings(~whiteRating=1894, ~blackRating=0),
              ~playerIds=
                Match.ids(
                  ~whiteId="Kinga_Forrester______",
                  ~blackId="________DUMMY________",
                ),
            ),
          |],
          [|
            Match.t(
              ~id="uawjKwbiA38RP8pA--tlw",
              ~result=Match.results(~whiteScore=0.0, ~blackScore=1.0),
              ~newRating=Match.ratings(~whiteRating=952, ~blackRating=1894),
              ~origRating=Match.ratings(~whiteRating=953, ~blackRating=1894),
              ~playerIds=
                Match.ids(
                  ~whiteId="Newbie_McNewberson___",
                  ~blackId="Kinga_Forrester______",
                ),
            ),
            Match.t(
              ~id="-kwIDxjPhWVRbqxtRZ26_",
              ~result=Match.results(~whiteScore=1.0, ~blackScore=0.0),
              ~newRating=Match.ratings(~whiteRating=2187, ~blackRating=0),
              ~origRating=Match.ratings(~whiteRating=2187, ~blackRating=0),
              ~playerIds=
                Match.ids(
                  ~whiteId="Jonah_Heston_________",
                  ~blackId="________DUMMY________",
                ),
            ),
          |],
        |],
        ~tieBreaks=[|0, 1, 2, 3|],
        ~name="Bye Tourney 3",
      ),
    ),
    (
      "Simple_Pairing_______",
      Tournament.t(
        ~byeQueue=[||],
        ~date=Js.Date.fromString("2019-06-14T11:40:34.407Z"),
        ~id="Simple_Pairing_______",
        ~playerIds=[|
          "Newbie_McNewberson___",
          "Grandy_McMaster______",
          "Joel_Robinson________",
          "Dr_Clayton_Forrester_",
          "TVs_Frank____________",
          "Crow_T_Robot_________",
          "Tom_Servo____________",
          "Gypsy________________",
        |],
        ~roundList=[|
          [|
            Match.t(
              ~id="KdLva8hWqYHdaU9KnFTe2",
              ~result=Match.results(~whiteScore=0.0, ~blackScore=1.0),
              ~newRating=Match.ratings(~whiteRating=1699, ~blackRating=2600),
              ~origRating=Match.ratings(~whiteRating=1700, ~blackRating=2600),
              ~playerIds=
                Match.ids(
                  ~whiteId="Crow_T_Robot_________",
                  ~blackId="Grandy_McMaster______",
                ),
            ),
            Match.t(
              ~id="WDPFsNF1yADs4qofFwCY0",
              ~result=Match.results(~whiteScore=1.0, ~blackScore=0.0),
              ~newRating=Match.ratings(~whiteRating=1650, ~blackRating=2389),
              ~origRating=Match.ratings(~whiteRating=1600, ~blackRating=2400),
              ~playerIds=
                Match.ids(
                  ~whiteId="Gypsy________________",
                  ~blackId="Joel_Robinson________",
                ),
            ),
            Match.t(
              ~id="R5sXfTOJw5vrJ4IytAjSi",
              ~result=Match.results(~whiteScore=0.0, ~blackScore=1.0),
              ~newRating=Match.ratings(~whiteRating=1400, ~blackRating=2100),
              ~origRating=Match.ratings(~whiteRating=1400, ~blackRating=2100),
              ~playerIds=
                Match.ids(
                  ~whiteId="TVs_Frank____________",
                  ~blackId="Dr_Clayton_Forrester_",
                ),
            ),
            Match.t(
              ~id="2YOsn_JJFnaUMhRBAc9KY",
              ~result=Match.results(~whiteScore=1.0, ~blackScore=0.0),
              ~newRating=Match.ratings(~whiteRating=1597, ~blackRating=1728),
              ~origRating=Match.ratings(~whiteRating=800, ~blackRating=1800),
              ~playerIds=
                Match.ids(
                  ~whiteId="Newbie_McNewberson___",
                  ~blackId="Tom_Servo____________",
                ),
            ),
          |],
          [||],
        |],
        ~tieBreaks=[|0, 1, 2, 3|],
        ~name="Simple Pairing",
      ),
    ),
    (
      "Pairing_With_Draws___",
      Tournament.t(
        ~byeQueue=[||],
        ~date=Js.Date.fromString("2019-06-14T14:18:06.686Z"),
        ~id="Pairing_With_Draws___",
        ~playerIds=[|
          "Newbie_McNewberson___",
          "Grandy_McMaster______",
          "Joel_Robinson________",
          "Dr_Clayton_Forrester_",
          "TVs_Frank____________",
          "Crow_T_Robot_________",
          "Tom_Servo____________",
          "Gypsy________________",
        |],
        ~roundList=[|
          [|
            Match.t(
              ~id="ryWXwvFGwBKQqGBbMYeps",
              ~result=Match.results(~whiteScore=0.0, ~blackScore=1.0),
              ~newRating=Match.ratings(~whiteRating=1699, ~blackRating=2600),
              ~origRating=Match.ratings(~whiteRating=1700, ~blackRating=2600),
              ~playerIds=
                Match.ids(
                  ~whiteId="Crow_T_Robot_________",
                  ~blackId="Grandy_McMaster______",
                ),
            ),
            Match.t(
              ~id="2KKVbi0AfNxfJAJobTgP5",
              ~result=Match.results(~whiteScore=1.0, ~blackScore=0.0),
              ~newRating=Match.ratings(~whiteRating=1650, ~blackRating=2389),
              ~origRating=Match.ratings(~whiteRating=1600, ~blackRating=2400),
              ~playerIds=
                Match.ids(
                  ~whiteId="Gypsy________________",
                  ~blackId="Joel_Robinson________",
                ),
            ),
            Match.t(
              ~id="zdlBHBAqgV2qabn2oBa2a",
              ~result=Match.results(~whiteScore=0.0, ~blackScore=1.0),
              ~newRating=Match.ratings(~whiteRating=1400, ~blackRating=2100),
              ~origRating=Match.ratings(~whiteRating=1400, ~blackRating=2100),
              ~playerIds=
                Match.ids(
                  ~whiteId="TVs_Frank____________",
                  ~blackId="Dr_Clayton_Forrester_",
                ),
            ),
            Match.t(
              ~id="8fGxU3tLpd8GibuSQr9-Y",
              ~result=Match.results(~whiteScore=0.5, ~blackScore=0.5),
              ~newRating=Match.ratings(~whiteRating=1197, ~blackRating=1764),
              ~origRating=Match.ratings(~whiteRating=800, ~blackRating=1800),
              ~playerIds=
                Match.ids(
                  ~whiteId="Newbie_McNewberson___",
                  ~blackId="Tom_Servo____________",
                ),
            ),
          |],
          [||],
        |],
        ~tieBreaks=[|0, 1, 2, 3|],
        ~name="Pairing with draws",
      ),
    ),
  |]);