// Generated by BUCKLESCRIPT VERSION 6.0.3, PLEASE EDIT WITH CARE

import * as Ramda from "ramda";
import * as Caml_array from "bs-platform/lib/es6/caml_array.js";

function add(a, b) {
  return a + b | 0;
}

function arraySum(arr) {
  return arr.reduce(add, 0);
}

function addFloat(a, b) {
  return a + b;
}

function arraySumFloat(arr) {
  return arr.reduce(addFloat, 0.0);
}

function last(arr) {
  return Caml_array.caml_array_get(arr, arr.length - 1 | 0);
}

function splitInHalf(arr) {
  return Ramda.splitAt(arr.length / 2 | 0, arr);
}

export {
  add ,
  arraySum ,
  addFloat ,
  arraySumFloat ,
  last ,
  splitInHalf ,
  
}
/* ramda Not a pure module */