/*
  Copyright (c) 2022 John Jackson.

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
/* ******************************************************************************
  Helper types
 ******************************************************************************/

module Options = {
  type t = {
    currentLocale: string,
    zeroFormat: string,
    nullFormat: string,
    defaultFormat: string,
    scalePercentBy100: bool,
  }
  let make = (~currentLocale, ~zeroFormat, ~nullFormat, ~defaultFormat, ~scalePercentBy100) => {
    currentLocale,
    zeroFormat,
    nullFormat,
    defaultFormat,
    scalePercentBy100,
  }
}
module Delimiters = {
  type t = {
    thousands: string,
    decimal: string,
  }
  let make = (~thousands, ~decimal) => {thousands, decimal}
}
module Abbreviations = {
  type t = {
    thousand: string,
    million: string,
    billion: string,
    trillion: string,
  }
  let make = (~thousand, ~million, ~billion, ~trillion) => {
    thousand,
    million,
    billion,
    trillion,
  }
}
module Currency = {
  type t = {symbol: string}
  let make = (~symbol) => {symbol: symbol}
}
module Locale = {
  type t = {
    delimiters: Delimiters.t,
    abbreviations: Abbreviations.t,
    ordinal: float => string,
    currency: Currency.t,
  }
  let make = (~delimiters, ~abbreviations, ~ordinal, ~currency) => {
    delimiters,
    abbreviations,
    ordinal,
    currency,
  }
}
module RegExps = {
  type t = {
    format: Js.Re.t,
    unformat: Js.Re.t,
  }
  let make = (~format, ~unformat) => {format, unformat}
}
module Format = {
  type formatFn = (float, string, (. float) => float) => string
  type unformatFn = string => float

  type t = {
    regexps: RegExps.t,
    @as("format")
    formatFn: formatFn,
    @as("unformat")
    unformatFn: unformatFn,
  }
  let make = (~regexps, ~formatFn, ~unformatFn) => {
    regexps,
    formatFn,
    unformatFn,
  }
}

type numeral = {
  version: string,
  options: Options.t,
}
/* ******************************************************************************
  The use this to create Numeral instances that accept and return specific
  types.
 ******************************************************************************/
module Make = (
  M: {
    type input
    type output
    type parsedOutput
    let parseOutput: output => parsedOutput
  },
) => {
  @module("numeral") external numeral: numeral = "default"
  @send external reset: numeral => unit = "reset"
  @send
  external registerLocale_: (numeral, ~what: string, ~key: string, ~value: Locale.t) => Locale.t =
    "register"
  let registerLocale = (key, value) => numeral->registerLocale_(~what="locale", ~key, ~value)
  @send
  external registerFormat_: (numeral, ~what: string, ~key: string, ~value: Format.t) => Format.t =
    "register"

  let registerFormat = (key, value) => numeral->registerFormat_(~what="format", ~key, ~value)
  @send external locale_: (numeral, ~key: string=?) => string = "locale"
  let locale = (~key) => numeral->locale_(~key)
  @send
  external localeData_: (numeral, ~key: string=?) => Locale.t = "localeData"
  let localeData = (~key) => numeral->localeData_(~key)
  @send external zeroFormat_: (numeral, string) => unit = "zeroFormat"
  let setZeroFormat = str => numeral->zeroFormat_(str)
  /* [@bs.send] external nullFormat: (t, string) => unit = "nullFormat"; */
  @send
  external setDefaultFormat_: (numeral, string) => unit = "defaultFormat"
  let setDefaultFormat = str => numeral->setDefaultFormat_(str)
  @send external validate_: (numeral, 'a, 'b) => bool = "validate"
  let validate = (a, b) => numeral->validate_(a, b)
  /* ****************************************************************************
    Numeral instances
   ****************************************************************************/
  type t
  @module("numeral") external make: M.input => t = "default"
  @module("numeral") external fromNumeral: t => t = "default"
  @send external clone: t => t = "clone"
  @send external formatDefault: t => string = "format"
  @send external format: (t, string) => string = "format"
  @send
  external formatRound: (t, string, @uncurry (float => float)) => string = "format"
  @send external unformat_: (t, string) => M.output = "unformat"
  let unformat = (t, value) => t->unformat_(value)->M.parseOutput
  @send external value_: t => M.output = "value"
  let value = t => t->value_->M.parseOutput
  /* [@bs.send] external valueOf: t => float = "valueOf"; */
  @send external set: (t, M.input) => t = "set"
  @send external add: (t, M.input) => t = "add"
  @send external subtract: (t, M.input) => t = "subtract"
  @send external multiply: (t, M.input) => t = "multiply"
  @send external divide: (t, M.input) => t = "divide"
  @send external difference_: (t, M.input) => M.output = "difference"
  let difference = (t, value) => t->difference_(value)->M.parseOutput
}
/* ******************************************************************************
  The base numeral object
 ******************************************************************************/
module Float = Make({
  type input = float
  type output = float
  type parsedOutput = float
  let parseOutput = output => output
})
/* `Float` is the default, initially opened, module */
include Float
@module("numeral") external fromInt: int => t = "default"
module String = Make({
  type input = string
  type output = Js.Nullable.t<float>
  type parsedOutput = option<float>
  let parseOutput = Js.Nullable.toOption
})
/* It probably doesn't make sense to add other types, like `int`, because the
 we can't guarantee that it will stay an int once it goes to the JS side. */
module Helpers = {
  /* These bindings aren't well tested or documented. Use with caution.
   Pull requests and bug reports are welcome! */
  type t
  @get external getHelpers: numeral => t = "_"

  type numberToFormat = (float, string, (. float) => float) => string
  @get external getNumberToFormat: t => numberToFormat = "numberToFormat"
  let numberToFormat = (~value, ~format, ~roundingFunction) =>
    numeral->getHelpers->getNumberToFormat(value, format, roundingFunction)

  type stringToNumber = string => float
  @get external getStringToNumber: t => stringToNumber = "stringToNumber"
  let stringToNumber = value => numeral->getHelpers->getStringToNumber(value)

  type includes = (string, string) => bool
  @get external getIncludes: t => includes = "includes"
  let includes = (string, search) => numeral->getHelpers->getIncludes(string, search)

  type insert = (string, string, int) => string
  @get external getInsert: t => insert = "insert"
  let insert = (string, subString, start) =>
    numeral->getHelpers->getInsert(string, subString, start)

  type multiplier = string => float
  @get external getMultiplier: t => multiplier = "multiplier"
  let multiplier = x => numeral->getHelpers->getMultiplier(x)

  type correctionFactor1 = float => float
  type correctionFactor2 = (float, float) => float
  type correctionFactor3 = (float, float, float) => float
  type correctionFactor4 = (float, float, float, float) => float
  type correctionFactor5 = (float, float, float, float, float) => float
  @get
  external getCorrectionFactor1: t => correctionFactor1 = "correctionFactor"
  @get
  external getCorrectionFactor2: t => correctionFactor2 = "correctionFactor"
  @get
  external getCorrectionFactor3: t => correctionFactor3 = "correctionFactor"
  @get
  external getCorrectionFactor4: t => correctionFactor4 = "correctionFactor"
  @get
  external getCorrectionFactor5: t => correctionFactor5 = "correctionFactor"
  let correctionFactor1 = arg1 => numeral->getHelpers->getCorrectionFactor1(arg1)
  let correctionFactor2 = (arg1, arg2) => numeral->getHelpers->getCorrectionFactor2(arg1, arg2)
  let correctionFactor3 = (arg1, arg2, arg3) =>
    numeral->getHelpers->getCorrectionFactor3(arg1, arg2, arg3)
  let correctionFactor4 = (arg1, arg2, arg3, arg4) =>
    numeral->getHelpers->getCorrectionFactor4(arg1, arg2, arg3, arg4)
  let correctionFactor5 = (arg1, arg2, arg3, arg4, arg5) =>
    numeral->getHelpers->getCorrectionFactor5(arg1, arg2, arg3, arg4, arg5)

  type toFixed = (float, int, (. float) => float, int) => float
  @get external getToFixed: t => toFixed = "toFixed"
  let toFixed = (value, maxDecimals, roundingFunction, optionals) =>
    numeral->getHelpers->getToFixed(value, maxDecimals, roundingFunction, optionals)
}
/* This is a hack to make sure that it works on both Babel ES6 and commonJs.
 This probably isn't safe or stable. */
%%raw(`if (Numeral.default === undefined) {
  Numeral.default = Numeral;
}`)
