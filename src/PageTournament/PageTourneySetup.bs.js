// Generated by BUCKLESCRIPT VERSION 6.0.3, PLEASE EDIT WITH CARE

import * as Block from "bs-platform/lib/es6/block.js";
import * as Curry from "bs-platform/lib/es6/curry.js";
import * as React from "react";
import * as Belt_Option from "bs-platform/lib/es6/belt_Option.js";
import * as Caml_option from "bs-platform/lib/es6/caml_option.js";
import * as ReactFeather from "react-feather";
import * as Utils$Coronate from "../Utils.bs.js";
import * as VisuallyHidden from "@reach/visually-hidden";

function makeDateInput(date) {
  var year = date.getFullYear().toString();
  var rawMonth = date.getMonth();
  var rawDate = date.getDate();
  var match = rawMonth < 9.0;
  var month = match ? "0" + (rawMonth + 1.0).toString() : (rawMonth + 1.0).toString();
  var match$1 = rawDate < 10.0;
  var day = match$1 ? "0" + rawDate.toString() : rawDate.toString();
  return /* array */[
            year,
            month,
            day
          ].join("-");
}

function PageTourneySetup(Props) {
  var tournament = Props.tournament;
  var tourneyDispatch = tournament[/* tourneyDispatch */8];
  var tourney = tournament[/* tourney */7];
  var match = React.useState((function () {
          return /* NotEditing */2;
        }));
  var setEditing = match[1];
  var editing = match[0];
  var nameInput = React.useRef(null);
  var dateInput = React.useRef(null);
  var focusRef = function (myref) {
    Belt_Option.map(Caml_option.nullable_to_opt(myref.current), (function (x) {
            x.focus();
            return /* () */0;
          }));
    return /* () */0;
  };
  React.useEffect((function () {
          switch (editing) {
            case 0 : 
                focusRef(nameInput);
                break;
            case 1 : 
                focusRef(dateInput);
                break;
            case 2 : 
                break;
            
          }
          return undefined;
        }), /* array */[editing]);
  var changeToOne = function (param) {
    Curry._1(tourneyDispatch, /* UpdateByeScores */Block.__(13, [1.0]));
    return Utils$Coronate.alert("Bye scores updated to 1.");
  };
  var changeToOneHalf = function (param) {
    Curry._1(tourneyDispatch, /* UpdateByeScores */Block.__(13, [0.5]));
    return Utils$Coronate.alert("Bye scores updated to ½.");
  };
  var updateDate = function ($$event) {
    var match = $$event.currentTarget.value.split("-");
    var match$1;
    if (match.length !== 3) {
      match$1 = /* tuple */[
        "2000",
        "01",
        "01"
      ];
    } else {
      var year = match[0];
      var month = match[1];
      var day = match[2];
      match$1 = /* tuple */[
        year,
        month,
        day
      ];
    }
    var year$1 = Number(match$1[0]);
    var month$1 = Number(match$1[1]) - 1.0;
    var date = Number(match$1[2]);
    return Curry._1(tourneyDispatch, /* SetDate */Block.__(8, [new Date(year$1, month$1, date)]));
  };
  return React.createElement("div", {
              className: "content-area"
            }, editing !== 0 ? React.createElement("h1", {
                    style: {
                      textAlign: "left"
                    }
                  }, React.createElement("span", {
                        className: "inputPlaceholder"
                      }, tourney[/* name */3]), " ", React.createElement("button", {
                        className: "button-ghost",
                        onClick: (function (param) {
                            return Curry._1(setEditing, (function (param) {
                                          return /* Name */0;
                                        }));
                          })
                      }, React.createElement(ReactFeather.Edit, { }), React.createElement(VisuallyHidden.default, {
                            children: "Edit name"
                          }))) : React.createElement("form", {
                    className: "display-20",
                    style: {
                      textAlign: "left"
                    },
                    onSubmit: (function (param) {
                        return Curry._1(setEditing, (function (param) {
                                      return /* NotEditing */2;
                                    }));
                      })
                  }, React.createElement("input", {
                        ref: nameInput,
                        className: "display-20",
                        style: {
                          textAlign: "left"
                        },
                        type: "text",
                        value: tourney[/* name */3],
                        onChange: (function ($$event) {
                            return Curry._1(tourneyDispatch, /* SetName */Block.__(5, [$$event.currentTarget.value]));
                          })
                      }), " ", React.createElement("button", {
                        className: "button-ghost",
                        onClick: (function (param) {
                            return Curry._1(setEditing, (function (param) {
                                          return /* NotEditing */2;
                                        }));
                          })
                      }, React.createElement(ReactFeather.Check, { }))), editing !== 1 ? React.createElement("p", {
                    className: "caption-30"
                  }, React.createElement(Utils$Coronate.DateFormat[/* make */2], {
                        date: tourney[/* date */1]
                      }), " ", React.createElement("button", {
                        className: "button-ghost",
                        onClick: (function (param) {
                            return Curry._1(setEditing, (function (param) {
                                          return /* Date */1;
                                        }));
                          })
                      }, React.createElement(ReactFeather.Edit, { }), React.createElement(VisuallyHidden.default, {
                            children: "Edit date"
                          }))) : React.createElement("form", {
                    className: "caption-30",
                    onSubmit: (function (param) {
                        return Curry._1(setEditing, (function (param) {
                                      return /* NotEditing */2;
                                    }));
                      })
                  }, React.createElement("input", {
                        ref: dateInput,
                        className: "caption-30",
                        type: "date",
                        value: makeDateInput(tourney[/* date */1]),
                        onChange: updateDate
                      }), " ", React.createElement("button", {
                        className: "button-ghost",
                        onClick: (function (param) {
                            return Curry._1(setEditing, (function (param) {
                                          return /* NotEditing */2;
                                        }));
                          })
                      }, React.createElement(ReactFeather.Check, { }))), React.createElement("h2", undefined, "Change bye scores"), React.createElement("button", {
                  "aria-describedby": "score-desc",
                  onClick: changeToOne
                }, "Change byes to 1"), " ", React.createElement("button", {
                  "aria-describedby": "score-desc",
                  onClick: changeToOneHalf
                }, "Change byes to ½"), React.createElement("p", {
                  className: "caption-30",
                  id: "score-desc"
                }, "This will update all bye matches which have been previously\n                scored in this tournament. To change the default bye value in\n                future matches, go to the ", React.createElement(Utils$Coronate.Router[/* HashLink */1][/* make */0], {
                      children: "app options",
                      to_: "/options"
                    }), "."));
}

var make = PageTourneySetup;

export {
  makeDateInput ,
  make ,
  
}
/* react Not a pure module */
