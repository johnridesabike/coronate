/*
  Copyright (c) 2022 John Jackson.

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
module Activity = {
  @module("react-feather") @react.component
  external make: unit => React.element = "Activity"
}
module Alert = {
  @module("react-feather") @react.component
  external make: unit => React.element = "AlertTriangle"
}
module ArrowDown = {
  @module("react-feather") @react.component
  external make: unit => React.element = "ArrowDown"
}
module ArrowLeft = {
  @module("react-feather") @react.component
  external make: unit => React.element = "ArrowLeft"
}
module ArrowUp = {
  @module("react-feather") @react.component
  external make: unit => React.element = "ArrowUp"
}
module Award = {
  @module("react-feather") @react.component
  external make: (~className: string=?) => React.element = "Award"
}
module Check = {
  @module("react-feather") @react.component
  external make: unit => React.element = "Check"
}
module CheckCircle = {
  @module("react-feather") @react.component
  external make: unit => React.element = "CheckCircle"
}
module ChevronDown = {
  @module("react-feather") @react.component
  external make: unit => React.element = "ChevronDown"
}
module ChevronLeft = {
  @module("react-feather") @react.component
  external make: unit => React.element = "ChevronLeft"
}
module ChevronUp = {
  @module("react-feather") @react.component
  external make: (~style: ReactDOM.Style.t=?) => React.element = "ChevronUp"
}
module Circle = {
  @module("react-feather") @react.component
  external make: unit => React.element = "Circle"
}
module Clock = {
  @module("react-feather") @react.component
  external make: unit => React.element = "Clock"
}
module Download = {
  @module("react-feather") @react.component
  external make: unit => React.element = "Download"
}
module Edit = {
  @module("react-feather") @react.component
  external make: unit => React.element = "Edit"
}
module ExternalLink = {
  @module("react-feather") @react.component
  external make: unit => React.element = "ExternalLink"
}
module Help = {
  @module("react-feather") @react.component
  external make: unit => React.element = "HelpCircle"
}
module Home = {
  @module("react-feather") @react.component
  external make: unit => React.element = "Home"
}
module Info = {
  @module("react-feather") @react.component
  external make: unit => React.element = "Info"
}
module Layers = {
  @module("react-feather") @react.component
  external make: unit => React.element = "Layers"
}
module List = {
  @module("react-feather") @react.component
  external make: unit => React.element = "List"
}
module Menu = {
  @module("react-feather") @react.component
  external make: unit => React.element = "Menu"
}
module Plus = {
  @module("react-feather") @react.component
  external make: unit => React.element = "Plus"
}
module Repeat = {
  @module("react-feather") @react.component
  external make: unit => React.element = "Repeat"
}
module Settings = {
  @module("react-feather") @react.component
  external make: unit => React.element = "Settings"
}
module Trash = {
  @module("react-feather") @react.component
  external make: unit => React.element = "Trash2"
}
module UserMinus = {
  @module("react-feather") @react.component
  external make: unit => React.element = "UserMinus"
}
module UserPlus = {
  @module("react-feather") @react.component
  external make: unit => React.element = "UserPlus"
}
module Users = {
  @module("react-feather") @react.component
  external make: unit => React.element = "Users"
}
module X = {
  @module("react-feather") @react.component
  external make: (~className: string=?) => React.element = "X"
}
module More = {
  @module("react-feather") @react.component
  external make: unit => React.element = "MoreHorizontal"
}

/*
type simpleIcon = {
  svg: string,
  title: string,
  hex: string,
  path: string,
}

module SimpleIcon = (
  IconData: {
    let icon: simpleIcon
  },
) => {
  @react.component
  let make = (
    ~height="24",
    ~width="24",
    ~className="",
    ~style=ReactDOM.Style.make(),
    ~ariaLabel=IconData.icon.title ++ " Icon",
    ~ariaHidden=false,
  ) =>
    <svg
      role="img"
      viewBox="0 0 24 24"
      height
      width
      className
      style={
        open ReactDOM.Style
        make(~fill="#" ++ IconData.icon.hex, ())->combine(style)
      }
      ariaLabel
      ariaHidden>
      <path d=IconData.icon.path />
    </svg>
  React.setDisplayName(make, IconData.icon.title)
}
*/
