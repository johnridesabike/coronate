// Generated by BUCKLESCRIPT VERSION 6.0.3, PLEASE EDIT WITH CARE

import * as React from "react";
import * as ReactDOMRe from "reason-react/src/ReactDOMRe.js";
import * as Caml_option from "bs-platform/lib/es6/caml_option.js";
import * as React$1 from "simple-icons/icons/react";
import * as Reason from "simple-icons/icons/reason";

var Activity = /* module */[];

var Alert = /* module */[];

var ArrowDown = /* module */[];

var ArrowLeft = /* module */[];

var ArrowUp = /* module */[];

var Award = /* module */[];

var Check = /* module */[];

var CheckCircle = /* module */[];

var ChevronDown = /* module */[];

var ChevronLeft = /* module */[];

var ChevronRight = /* module */[];

var ChevronUp = /* module */[];

var Circle = /* module */[];

var Download = /* module */[];

var Edit = /* module */[];

var Help = /* module */[];

var Info = /* module */[];

var Layers = /* module */[];

var List = /* module */[];

var Plus = /* module */[];

var Repeat = /* module */[];

var Settings = /* module */[];

var Sidebar = /* module */[];

var Trash = /* module */[];

var Unfullscreen = /* module */[];

var UserMinus = /* module */[];

var UserPlus = /* module */[];

var Users = /* module */[];

var X = /* module */[];

function SimpleIcon(IconData) {
  var Icons$SimpleIcon = function (Props) {
    var match = Props.height;
    var height = match !== undefined ? match : "24";
    var match$1 = Props.width;
    var width = match$1 !== undefined ? match$1 : "24";
    var match$2 = Props.className;
    var className = match$2 !== undefined ? match$2 : "";
    var match$3 = Props.style;
    var style = match$3 !== undefined ? Caml_option.valFromOption(match$3) : { };
    var match$4 = Props.ariaLabel;
    var ariaLabel = match$4 !== undefined ? match$4 : IconData[/* icon */0].title + " Icon";
    var match$5 = Props.ariaHidden;
    var ariaHidden = match$5 !== undefined ? match$5 : false;
    return React.createElement("svg", {
                "aria-hidden": ariaHidden,
                "aria-label": ariaLabel,
                className: className,
                role: "img",
                style: ReactDOMRe.Style[/* combine */0]({
                      fill: "#" + IconData[/* icon */0].hex
                    }, style),
                height: height,
                width: width,
                viewBox: "0 0 24 24"
              }, React.createElement("path", {
                    d: IconData[/* icon */0].path
                  }));
  };
  Icons$SimpleIcon.displayName = IconData[/* icon */0].title;
  return /* module */[/* make */Icons$SimpleIcon];
}

var IconData = /* module */[/* default */Reason.default];

function Icons$SimpleIcon(Props) {
  var match = Props.height;
  var height = match !== undefined ? match : "24";
  var match$1 = Props.width;
  var width = match$1 !== undefined ? match$1 : "24";
  var match$2 = Props.className;
  var className = match$2 !== undefined ? match$2 : "";
  var match$3 = Props.style;
  var style = match$3 !== undefined ? Caml_option.valFromOption(match$3) : { };
  var match$4 = Props.ariaLabel;
  var ariaLabel = match$4 !== undefined ? match$4 : IconData[/* icon */0].title + " Icon";
  var match$5 = Props.ariaHidden;
  var ariaHidden = match$5 !== undefined ? match$5 : false;
  return React.createElement("svg", {
              "aria-hidden": ariaHidden,
              "aria-label": ariaLabel,
              className: className,
              role: "img",
              style: ReactDOMRe.Style[/* combine */0]({
                    fill: "#" + IconData[/* icon */0].hex
                  }, style),
              height: height,
              width: width,
              viewBox: "0 0 24 24"
            }, React.createElement("path", {
                  d: IconData[/* icon */0].path
                }));
}

Icons$SimpleIcon.displayName = IconData[/* icon */0].title;

var Reason$1 = /* module */[/* make */Icons$SimpleIcon];

var IconData$1 = /* module */[/* default */React$1.default];

function Icons$SimpleIcon$1(Props) {
  var match = Props.height;
  var height = match !== undefined ? match : "24";
  var match$1 = Props.width;
  var width = match$1 !== undefined ? match$1 : "24";
  var match$2 = Props.className;
  var className = match$2 !== undefined ? match$2 : "";
  var match$3 = Props.style;
  var style = match$3 !== undefined ? Caml_option.valFromOption(match$3) : { };
  var match$4 = Props.ariaLabel;
  var ariaLabel = match$4 !== undefined ? match$4 : IconData$1[/* icon */0].title + " Icon";
  var match$5 = Props.ariaHidden;
  var ariaHidden = match$5 !== undefined ? match$5 : false;
  return React.createElement("svg", {
              "aria-hidden": ariaHidden,
              "aria-label": ariaLabel,
              className: className,
              role: "img",
              style: ReactDOMRe.Style[/* combine */0]({
                    fill: "#" + IconData$1[/* icon */0].hex
                  }, style),
              height: height,
              width: width,
              viewBox: "0 0 24 24"
            }, React.createElement("path", {
                  d: IconData$1[/* icon */0].path
                }));
}

Icons$SimpleIcon$1.displayName = IconData$1[/* icon */0].title;

var React$2 = /* module */[/* make */Icons$SimpleIcon$1];

function Icons$Close(Props) {
  var match = Props.className;
  var className = match !== undefined ? match : "";
  return React.createElement("svg", {
              className: className,
              height: "11",
              width: "11",
              fill: "none",
              viewBox: "0 0 11 11",
              xmlns: "http://www.w3.org/2000/svg"
            }, React.createElement("path", {
                  d: "M6.279 5.5L11 10.221l-.779.779L5.5 6.279.779 11 0 10.221 4.721 5.5 0 .779.779 0 5.5 4.721 10.221 0 11 .779 6.279 5.5z",
                  fill: "#000"
                }));
}

var Close = /* module */[/* make */Icons$Close];

function Icons$Maximize(Props) {
  var match = Props.className;
  var className = match !== undefined ? match : "";
  return React.createElement("svg", {
              className: className,
              height: "11",
              width: "11",
              fill: "none",
              viewBox: "0 0 11 11",
              xmlns: "http://www.w3.org/2000/svg"
            }, React.createElement("path", {
                  d: "M11 0v11H0V0h11zM9.899 1.101H1.1V9.9H9.9V1.1z",
                  fill: "#000"
                }));
}

var Maximize = /* module */[/* make */Icons$Maximize];

function Icons$Minimize(Props) {
  var match = Props.className;
  var className = match !== undefined ? match : "";
  return React.createElement("svg", {
              className: className,
              height: "11",
              width: "11",
              fill: "none",
              viewBox: "0 0 11 11",
              xmlns: "http://www.w3.org/2000/svg"
            }, React.createElement("path", {
                  d: "M11 4.399V5.5H0V4.399h11z",
                  fill: "#000"
                }));
}

var Minimize = /* module */[/* make */Icons$Minimize];

function Icons$Restore(Props) {
  var match = Props.className;
  var className = match !== undefined ? match : "";
  return React.createElement("svg", {
              className: className,
              height: "11",
              width: "11",
              fill: "none",
              viewBox: "0 0 11 11",
              xmlns: "http://www.w3.org/2000/svg"
            }, React.createElement("path", {
                  d: "M11 8.798H8.798V11H0V2.202h2.202V0H11v8.798zm-3.298-5.5h-6.6v6.6h6.6v-6.6zM9.9 1.1H3.298v1.101h5.5v5.5h1.1v-6.6z",
                  fill: "#000"
                }));
}

var Restore = /* module */[/* make */Icons$Restore];

export {
  Activity ,
  Alert ,
  ArrowDown ,
  ArrowLeft ,
  ArrowUp ,
  Award ,
  Check ,
  CheckCircle ,
  ChevronDown ,
  ChevronLeft ,
  ChevronRight ,
  ChevronUp ,
  Circle ,
  Download ,
  Edit ,
  Help ,
  Info ,
  Layers ,
  List ,
  Plus ,
  Repeat ,
  Settings ,
  Sidebar ,
  Trash ,
  Unfullscreen ,
  UserMinus ,
  UserPlus ,
  Users ,
  X ,
  SimpleIcon ,
  Reason$1 as Reason,
  React$2 as React,
  Close ,
  Maximize ,
  Minimize ,
  Restore ,
  
}
/* IconData Not a pure module */