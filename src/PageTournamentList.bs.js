// Generated by BUCKLESCRIPT VERSION 6.0.3, PLEASE EDIT WITH CARE

import * as Block from "bs-platform/lib/es6/block.js";
import * as Curry from "bs-platform/lib/es6/curry.js";
import * as React from "react";
import * as ReactFeather from "react-feather";
import * as Belt_MapString from "bs-platform/lib/es6/belt_MapString.js";
import * as Hooks$Coronate from "./Hooks.bs.js";
import * as Window$Coronate from "./Window.bs.js";
import * as VisuallyHidden from "@reach/visually-hidden";

function s(prim) {
  return prim;
}

function PageTournamentList(Props) {
  var match = Hooks$Coronate.Db[/* useAllTournaments */8](/* () */0);
  var tourneys = match[0];
  var match$1 = Hooks$Coronate.useSortedTable(Belt_MapString.valuesToArray(tourneys), /* KeyDate */Block.__(3, [(function (prim) {
              return prim.date;
            })]), true);
  var sortDispatch = match$1[1];
  React.useState((function () {
          return "";
        }));
  var match$2 = React.useState((function () {
          return false;
        }));
  var setIsDialogOpen = match$2[1];
  var match$3 = Window$Coronate.WindowContext[/* useWindowContext */3](/* () */0);
  var windowDispatch = match$3[1];
  React.useEffect((function () {
          Curry._1(windowDispatch, /* SetTitle */Block.__(5, ["Tournament list"]));
          return (function (param) {
                    return Curry._1(windowDispatch, /* SetTitle */Block.__(5, [""]));
                  });
        }), /* array */[windowDispatch]);
  React.useEffect((function () {
          Curry._1(sortDispatch, /* SetTable */Block.__(2, [Belt_MapString.valuesToArray(tourneys)]));
          return undefined;
        }), /* tuple */[
        tourneys,
        sortDispatch
      ]);
  var match$4 = Belt_MapString.isEmpty(tourneys);
  return React.createElement(Window$Coronate.WindowBody[/* make */0], {
              children: React.createElement("div", {
                    className: "content-area"
                  }, React.createElement("div", {
                        className: "toolbar toolbar__left"
                      }, React.createElement("button", {
                            onClick: (function (param) {
                                return Curry._1(setIsDialogOpen, (function (param) {
                                              return true;
                                            }));
                              })
                          }, React.createElement(ReactFeather.Plus, { }), " Add tournament")), match$4 ? React.createElement("p", undefined, "No tournaments are added yet.") : React.createElement("table", undefined, React.createElement("caption", undefined, "Tournament list"), React.createElement("thead", undefined, React.createElement("tr", undefined, React.createElement("th", undefined, "Name"), React.createElement("th", undefined, "Date"), React.createElement("th", undefined, React.createElement(VisuallyHidden.default, {
                                          children: "Controls"
                                        }))))))
            });
}

var make = PageTournamentList;

export {
  s ,
  make ,
  
}
/* react Not a pure module */
