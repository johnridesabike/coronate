module Options: {
  type t = {
    currentLocale: string,
    zeroFormat: string,
    nullFormat: string,
    defaultFormat: string,
    scalePercentBy100: bool,
  }
  let make: (
    ~currentLocale: string,
    ~zeroFormat: string,
    ~nullFormat: string,
    ~defaultFormat: string,
    ~scalePercentBy100: bool,
  ) => t
}

module Delimiters: {
  type t = {
    thousands: string,
    decimal: string,
  }
  let make: (~thousands: string, ~decimal: string) => t
}

module Abbreviations: {
  type t = {
    thousand: string,
    million: string,
    billion: string,
    trillion: string,
  }
  let make: (~thousand: string, ~million: string, ~billion: string, ~trillion: string) => t
}
module Currency: {
  type t = {symbol: string}
  let make: (~symbol: string) => t
}
module Locale: {
  type t = {
    delimiters: Delimiters.t,
    abbreviations: Abbreviations.t,
    ordinal: float => string,
    currency: Currency.t,
  }
  let make: (
    ~delimiters: Delimiters.t,
    ~abbreviations: Abbreviations.t,
    ~ordinal: float => string,
    ~currency: Currency.t,
  ) => t
}
module RegExps: {
  type t = {
    format: Js.Re.t,
    unformat: Js.Re.t,
  }
  let make: (~format: Js.Re.t, ~unformat: Js.Re.t) => t
}

module Format: {
  type formatFn = (float, string, (. float) => float) => string
  type unformatFn = string => float

  type t = {
    regexps: RegExps.t,
    @as("format")
    formatFn: formatFn,
    @as("unformat")
    unformatFn: unformatFn,
  }
  let make: (~regexps: RegExps.t, ~formatFn: formatFn, ~unformatFn: unformatFn) => t
}

type numeral = {
  version: string,
  options: Options.t,
}
@module("numeral") external numeral: numeral = "default"
@bs.send external reset: numeral => unit = "reset"
let registerLocale: (string, Locale.t) => Locale.t
let registerFormat: (string, Format.t) => Format.t
let locale: (~key: string) => string
let localeData: (~key: string) => Locale.t
let setZeroFormat: string => unit
let setDefaultFormat: string => unit
let validate: ('a, 'b) => bool
type t
@module("numeral") external make: float => t = "default"
@module("numeral") external fromNumeral: t => t = "default"
@module("numeral") external fromInt: int => t = "default"
@bs.send external clone: t => t = "clone"
@bs.send external formatDefault: t => string = "format"
@bs.send external format: (t, string) => string = "format"
@bs.send
external formatRound: (t, string, @uncurry (float => float)) => string = "format"
let unformat: (t, string) => float
let value: t => float
@bs.send external set: (t, float) => t = "set"
@bs.send external add: (t, float) => t = "add"
@bs.send external subtract: (t, float) => t = "subtract"
@bs.send external multiply: (t, float) => t = "multiply"
@bs.send external divide: (t, float) => t = "divide"
let difference: (t, float) => float
module String: {
  @module("numeral") external numeral: numeral = "default"
  @bs.send external reset: numeral => unit = "reset"
  let registerLocale: (string, Locale.t) => Locale.t
  let registerFormat: (string, Format.t) => Format.t
  let locale: (~key: string) => string
  let localeData: (~key: string) => Locale.t
  let setZeroFormat: string => unit
  let setDefaultFormat: string => unit
  let validate: ('a, 'b) => bool
  type t
  @module("numeral") external make: string => t = "default"
  @module("numeral") external fromNumeral: t => t = "default"
  @bs.send external clone: t => t = "clone"
  @bs.send external formatDefault: t => string = "format"
  @bs.send external format: (t, string) => string = "format"
  @bs.send
  external formatRound: (t, string, @uncurry (float => float)) => string = "format"
  let unformat: (t, string) => option<float>
  let value: t => option<float>
  @bs.send external set: (t, string) => t = "set"
  @bs.send external add: (t, string) => t = "add"
  @bs.send external subtract: (t, string) => t = "subtract"
  @bs.send external multiply: (t, string) => t = "multiply"
  @bs.send external divide: (t, string) => t = "divide"
  let difference: (t, string) => option<float>
}
module Helpers: {
  type t
  @get external getHelpers: numeral => t = "_"
  type numberToFormat = (float, string, (. float) => float) => string
  @get
  external getNumberToFormat: t => numberToFormat = "numberToFormat"
  let numberToFormat: (
    ~value: float,
    ~format: string,
    ~roundingFunction: (. float) => float,
  ) => string
  type stringToNumber = string => float
  @get external getStringToNumber: t => stringToNumber = "stringToNumber"
  let stringToNumber: string => float
  type includes = (string, string) => bool
  @get external getIncludes: t => includes = "includes"
  let includes: (string, string) => bool
  type insert = (string, string, int) => string
  @get external getInsert: t => insert = "insert"
  let insert: (string, string, int) => string
  type multiplier = string => float
  @get external getMultiplier: t => multiplier = "multiplier"
  let multiplier: string => float
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
  let correctionFactor1: float => float
  let correctionFactor2: (float, float) => float
  let correctionFactor3: (float, float, float) => float
  let correctionFactor4: (float, float, float, float) => float
  let correctionFactor5: (float, float, float, float, float) => float
  type toFixed = (float, int, (. float) => float, int) => float
  @get external getToFixed: t => toFixed = "toFixed"
  let toFixed: (float, int, (. float) => float, int) => float
}
