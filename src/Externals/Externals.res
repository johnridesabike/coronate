/*
  Copyright (c) 2022 John Jackson.

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
@module("nanoid") external nanoid: unit => string = "nanoid"

module FileReader = {
  type t
  @new external make: unit => t = "FileReader"
  type onloadArg = {"target": {"result": string}}
  @set external setOnLoad: (t, onloadArg => unit) => unit = "onload"
  @send external readAsText: (t, string) => unit = "readAsText"
}

module VisuallyHidden = {
  @module("@reach/visually-hidden") @react.component
  external make: (~children: React.element) => React.element = "default"
}

module Dialog = {
  /* This binding is awkward to account for ReScript's inability to directly use
     aria-* properties with components. The second make function fixes it for
     us. I don't know if there's a better way of doing this.
     https://dev.to/johnridesabike/binding-external-components-with-aria-properties-in-reasonreact-5pj
 */
  @module("@reach/dialog")
  external make: React.component<{..}> = "Dialog"
  @react.component
  let make = (
    ~isOpen: bool,
    ~onDismiss: unit => unit,
    ~ariaLabel: string,
    ~children: React.element,
    ~style=ReactDOM.Style.make(),
    ~className,
  ) =>
    React.createElement(
      make,
      {
        "isOpen": isOpen,
        "onDismiss": onDismiss,
        "style": style,
        "aria-label": ariaLabel,
        "children": children,
        "className": className,
      },
    )
}

module ReachTabs = {
  module Tabs = {
    @module("@reach/tabs") @react.component
    external make: (
      ~index: int=?,
      ~onChange: int => unit=?,
      ~children: React.element,
    ) => React.element = "Tabs"
  }
  module TabList = {
    @module("@reach/tabs") @react.component
    external make: (~children: React.element) => React.element = "TabList"
  }
  module Tab = {
    @module("@reach/tabs") @react.component
    external make: (~disabled: bool=?, ~children: React.element) => React.element = "Tab"
  }
  module TabPanels = {
    @module("@reach/tabs") @react.component
    external make: (~children: React.element) => React.element = "TabPanels"
  }
  module TabPanel = {
    @module("@reach/tabs") @react.component
    external make: (~children: React.element) => React.element = "TabPanel"
  }
}
