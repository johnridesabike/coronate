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
  @module("@radix-ui/react-visually-hidden") @react.component
  external make: (~children: React.element) => React.element = "Root"
}

module Dialog = {
  module Root = {
    /* `open` is a reserved word in ReScript, so it can't be used as a labeled
     argument name; the props object is built manually instead. */
    @module("@radix-ui/react-dialog")
    external make: React.component<{..}> = "Root"
    @react.component
    let make = (~isOpen: bool, ~onOpenChange: bool => unit, ~children: React.element) =>
      React.createElement(
        make,
        {"open": isOpen, "onOpenChange": onOpenChange, "children": children},
      )
  }
  module Portal = {
    @module("@radix-ui/react-dialog") @react.component
    external make: (~children: React.element) => React.element = "Portal"
  }
  module Overlay = {
    @module("@radix-ui/react-dialog") @react.component
    external make: (~className: string, ~children: React.element=?) => React.element = "Overlay"
  }
  module Content = {
    @module("@radix-ui/react-dialog")
    external make: React.component<{..}> = "Content"
    @react.component
    let make = (~style: ReactDOM.Style.t={}, ~className: string, ~children: React.element) =>
      React.createElement(
        make,
        {
          "style": style,
          "className": className,
          /* No `Dialog.Description` is rendered, so this is cleared instead of
           pointing at a description element that doesn't exist. */
          "aria-describedby": Nullable.null,
          "children": children,
        },
      )
  }
  module Title = {
    @module("@radix-ui/react-dialog") @react.component
    external make: (~className: string=?, ~children: React.element) => React.element = "Title"
  }

  @react.component
  let make = (
    ~isOpen: bool,
    ~onDismiss: unit => unit,
    ~ariaLabel: string,
    ~children: React.element,
    ~style: ReactDOM.Style.t={},
    /* Only modifier classes; the base `dialog-content` is added below. */
    ~className: string="",
    /* Radix requires a `Title` for accessibility. It's visible by default;
     dialogs whose content already includes its own heading can hide it. */
    ~visuallyHiddenTitle: bool=false,
  ) => {
    let title = <Title className="dialog-title"> {React.string(ariaLabel)} </Title>
    /* `Content` is nested inside `Overlay` (a documented Radix pattern) so the
     fixed overlay scrolls long dialogs. */
    /* `dialog-content` holds the base dialog styling; callers pass only
     modifier classes, so it has to be added here or dialogs render unstyled.
     Modifiers are defined after it in the stylesheet so they win the cascade. */
    let className = String.trim("dialog-content " ++ className)
    <Root
      isOpen
      onOpenChange={newIsOpen =>
        if !newIsOpen {
          onDismiss()
        }}
    >
      <Portal>
        <Overlay className="dialog-overlay">
          <Content style className>
            {visuallyHiddenTitle ? <VisuallyHidden> title </VisuallyHidden> : title}
            children
          </Content>
        </Overlay>
      </Portal>
    </Root>
  }
}

module Tabs = {
  module Root = {
    @module("@radix-ui/react-tabs") @react.component
    external make: (
      ~value: string=?,
      ~defaultValue: string=?,
      ~onValueChange: string => unit=?,
      ~className: string=?,
      ~children: React.element,
    ) => React.element = "Root"
  }
  module List = {
    @module("@radix-ui/react-tabs") @react.component
    external make: (~className: string=?, ~children: React.element) => React.element = "List"
  }
  module Trigger = {
    @module("@radix-ui/react-tabs") @react.component
    external make: (
      ~value: string,
      ~disabled: bool=?,
      ~className: string=?,
      ~children: React.element,
    ) => React.element = "Trigger"
  }
  module Content = {
    /* `forceMount` keeps inactive panels in the DOM; the `.tab-panel` CSS
     hides them via `data-state` instead. */
    @module("@radix-ui/react-tabs") @react.component
    external make: (
      ~value: string,
      ~forceMount: bool=?,
      ~className: string=?,
      ~children: React.element,
    ) => React.element = "Content"
  }
}
