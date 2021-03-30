@@text("
 This contains all of the logic and components that make up the window,
 including titlebar, default sidebar, and layout.
 ")
type action =
  | SetDialog(bool)
  | SetSidebar(bool)
  | SetTitle(string)

module Body: {
  @react.component
  let make: (
    ~children: React.element,
    ~windowDispatch: action => unit,
    ~footerFunc: unit => React.element=?,
    ~sidebarFunc: (action => unit) => React.element=?,
  ) => React.element
}

@react.component
let make: (~children: (action => unit) => React.element, ~className: string) => React.element
