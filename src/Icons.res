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
module ChevronRight = {
  @module("react-feather") @react.component
  external make: unit => React.element = "ChevronRight"
}
module ChevronUp = {
  @module("react-feather") @react.component
  external make: (~style: ReactDOMRe.Style.t=?) => React.element = "ChevronUp"
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
module Help = {
  @module("react-feather") @react.component
  external make: unit => React.element = "HelpCircle"
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
module Sidebar = {
  @module("react-feather") @react.component
  external make: unit => React.element = "Sidebar"
}
module Trash = {
  @module("react-feather") @react.component
  external make: unit => React.element = "Trash2"
}
module Unfullscreen = {
  @module("react-feather") @react.component
  external make: (~className: string=?) => React.element = "Minimize2"
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
    ~style=ReactDOMRe.Style.make(),
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
        open ReactDOMRe.Style
        make(~fill="#" ++ IconData.icon.hex, ())->combine(style)
      }
      ariaLabel
      ariaHidden>
      <path d=IconData.icon.path />
    </svg>
  React.setDisplayName(make, IconData.icon.title)
}
*/
