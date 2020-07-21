/*******************************************************************************
  Misc. utilities
 ******************************************************************************/
[@bs.module "nanoid"] external nanoid: unit => string = "nanoid";

/*******************************************************************************
  Browser stuff
 ******************************************************************************/
module FileReader = {
  type t;
  [@bs.new] external make: unit => t = "FileReader";
  type onloadArg = {. "target": {. "result": string}};
  [@bs.set] external setOnLoad: (t, onloadArg => unit) => unit = "onload";
  [@bs.send] external readAsText: (t, string) => unit = "readAsText";
};

/*******************************************************************************
  LocalForage
  This code has moved to https://github.com/johnridesabike/bs-localforage
 ******************************************************************************/
/*******************************************************************************
  Components
 ******************************************************************************/

module VisuallyHidden = {
  [@bs.module "@reach/visually-hidden"] [@react.component]
  external make: (~children: React.element) => React.element = "default";
};
module Dialog = {
  /* This binding is awkward to account for Reason's inability to directly use
     aria-* properties with components. The second make function fixes it for
     us. I don't know if there's a better way of doing this.
     https://dev.to/johnridesabike/binding-external-components-with-aria-properties-in-reasonreact-5pj
     */
  [@bs.module "@reach/dialog"]
  external make: React.component(Js.t({..})) = "Dialog";
  [@react.component]
  let make =
      (
        ~isOpen: bool,
        ~onDismiss: unit => unit,
        ~ariaLabel: string,
        ~children: React.element,
        ~style=ReactDOMRe.Style.make(),
      ) =>
    React.createElement(
      make,
      {
        "isOpen": isOpen,
        "onDismiss": onDismiss,
        "style": style,
        "aria-label": ariaLabel,
        "children": children,
      },
    );
};

module ReachTabs = {
  module Tabs = {
    [@bs.module "@reach/tabs"] [@react.component]
    external make:
      (~index: int=?, ~onChange: int => unit=?, ~children: React.element) =>
      React.element =
      "Tabs";
  };
  module TabList = {
    [@bs.module "@reach/tabs"] [@react.component]
    external make: (~children: React.element) => React.element = "TabList";
  };
  module Tab = {
    [@bs.module "@reach/tabs"] [@react.component]
    external make:
      (~disabled: bool=?, ~children: React.element) => React.element =
      "Tab";
  };
  module TabPanels = {
    [@bs.module "@reach/tabs"] [@react.component]
    external make: (~children: React.element) => React.element = "TabPanels";
  };
  module TabPanel = {
    [@bs.module "@reach/tabs"] [@react.component]
    external make: (~children: React.element) => React.element = "TabPanel";
  };
};

