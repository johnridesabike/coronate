type action =
  | SetDialog(bool)
  | SetSidebar(bool)
  | SetTitle(string);

module Body: {
  [@react.component]
  let make:
    (
      ~children: React.element,
      ~footerFunc: unit => React.element=?,
      ~sidebarFunc: unit => React.element=?
    ) =>
    React.element;
};

[@react.component]
let make:
  (~children: (action => unit) => React.element, ~className: string) =>
  React.element;
