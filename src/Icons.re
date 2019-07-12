[@bs.module "react-feather"] [@react.component]
external activity: unit => React.element = "Activity";
[@bs.module "react-feather"] [@react.component]
external alert: unit => React.element = "AlertTriangle";
[@bs.module "react-feather"] [@react.component]
external arrowDown: unit => React.element = "ArrowDown";
[@bs.module "react-feather"] [@react.component]
external arrowLeft: unit => React.element = "ArrowLeft";
[@bs.module "react-feather"] [@react.component]
external arrowUp: unit => React.element = "ArrowUp";
[@bs.module "react-feather"] [@react.component]
external award: unit => React.element = "Award";
[@bs.module "react-feather"] [@react.component]
external check: unit => React.element = "Check";
[@bs.module "react-feather"] [@react.component]
external checkCircle: unit => React.element = "CheckCircle";
[@bs.module "react-feather"] [@react.component]
external chevronDown: unit => React.element = "ChevronDown";
[@bs.module "react-feather"] [@react.component]
external chevronLeft: unit => React.element = "ChevronLeft";
[@bs.module "react-feather"] [@react.component]
external chevronRight: unit => React.element = "ChevronRight";
[@bs.module "react-feather"] [@react.component]
external chevronUp: (~style: ReactDOMRe.Style.t=?) => React.element = "ChevronUp";
[@bs.module "react-feather"] [@react.component]
external circle: unit => React.element = "Circle";
[@bs.module "react-feather"] [@react.component]
external download: unit => React.element = "Download";
[@bs.module "react-feather"] [@react.component]
external edit: unit => React.element = "Edit";
[@bs.module "react-feather"] [@react.component]
external help: unit => React.element = "HelpCircle";
[@bs.module "react-feather"] [@react.component]
external info: unit => React.element = "Info";
[@bs.module "react-feather"] [@react.component]
external layers: unit => React.element = "Layers";
[@bs.module "react-feather"] [@react.component]
external list: unit => React.element = "List";
[@bs.module "react-feather"] [@react.component]
external plus: unit => React.element = "Plus";
[@bs.module "react-feather"] [@react.component]
external repeat: unit => React.element = "Repeat";
[@bs.module "react-feather"] [@react.component]
external settings: unit => React.element = "Settings";
[@bs.module "react-feather"] [@react.component]
external sidebar: unit => React.element = "Sidebar";
[@bs.module "react-feather"] [@react.component]
external trash: unit => React.element = "Trash2";
[@bs.module "react-feather"] [@react.component]
external unfullscreen: unit => React.element = "Minimize2";
[@bs.module "react-feather"] [@react.component]
external userMinus: unit => React.element = "UserMinus";
[@bs.module "react-feather"] [@react.component]
external userPlus: unit => React.element = "UserPlus";
[@bs.module "react-feather"] [@react.component]
external users: unit => React.element = "Users";
[@bs.module "react-feather"] [@react.component]
external x: (~className:string=?) => React.element = "X";

[@bs.deriving abstract]
type simpleIcon = {
  svg: string,
  title: string,
  hex: string,
};

module SimpleIcon = {
  [@react.component]
  let make = (~icon) =>
    <span
      dangerouslySetInnerHTML={"__html": icon->svgGet}
      ariaLabel={icon->titleGet}
      style={ReactDOMRe.Style.make(~fill="#" ++ icon->hexGet, ())}
      role="img"
    />;
};

module Reason = {
  [@bs.module "simple-icons/icons/reason"]
  external icon: simpleIcon = "default";
  [@react.component]
  let make = () => <SimpleIcon icon />;
};

module ReactIcon = {
  [@bs.module "simple-icons/icons/react"]
  external icon: simpleIcon = "default";
  [@react.component]
  let make = () => <SimpleIcon icon />;
};

// https://github.com/microsoft/vscode/tree/master/src/vs/workbench/browser/parts/titlebar/media
module Close = {
  [@react.component]
  let make = () =>
    <svg
      fill="none"
      height="11"
      viewBox="0 0 11 11"
      width="11"
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6.279 5.5L11 10.221l-.779.779L5.5 6.279.779 11 0 10.221 4.721 5.5 0 .779.779 0 5.5 4.721 10.221 0 11 .779 6.279 5.5z"
        fill="#000"
      />
    </svg>;
};

module Maximize = {
  [@react.component]
  let make = () =>
    <svg
      fill="none"
      height="11"
      viewBox="0 0 11 11"
      width="11"
      xmlns="http://www.w3.org/2000/svg">
      <path d="M11 0v11H0V0h11zM9.899 1.101H1.1V9.9H9.9V1.1z" fill="#000" />
    </svg>;
};

module Minimize = {
  [@react.component]
  let make = () =>
    <svg
      fill="none"
      height="11"
      viewBox="0 0 11 11"
      width="11"
      xmlns="http://www.w3.org/2000/svg">
      <path d="M11 4.399V5.5H0V4.399h11z" fill="#000" />
    </svg>;
};

module Restore = {
  [@react.component]
  let make = () =>
    <svg
      fill="none"
      height="11"
      viewBox="0 0 11 11"
      width="11"
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M11 8.798H8.798V11H0V2.202h2.202V0H11v8.798zm-3.298-5.5h-6.6v6.6h6.6v-6.6zM9.9 1.1H3.298v1.101h5.5v5.5h1.1v-6.6z"
        fill="#000"
      />
    </svg>;
};