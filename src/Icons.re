module Activity = {
  [@bs.module "react-feather"] [@react.component]
  external make: unit => React.element = "Activity";
};
module Alert = {
  [@bs.module "react-feather"] [@react.component]
  external make: unit => React.element = "AlertTriangle";
};
module ArrowDown = {
  [@bs.module "react-feather"] [@react.component]
  external make: unit => React.element = "ArrowDown";
};
module ArrowLeft = {
  [@bs.module "react-feather"] [@react.component]
  external make: unit => React.element = "ArrowLeft";
};
module ArrowUp = {
  [@bs.module "react-feather"] [@react.component]
  external make: unit => React.element = "ArrowUp";
};
module Award = {
  [@bs.module "react-feather"] [@react.component]
  external make: (~className: string=?) => React.element = "Award";
};
module Check = {
  [@bs.module "react-feather"] [@react.component]
  external make: unit => React.element = "Check";
};
module CheckCircle = {
  [@bs.module "react-feather"] [@react.component]
  external make: unit => React.element = "CheckCircle";
};
module ChevronDown = {
  [@bs.module "react-feather"] [@react.component]
  external make: unit => React.element = "ChevronDown";
};
module ChevronLeft = {
  [@bs.module "react-feather"] [@react.component]
  external make: unit => React.element = "ChevronLeft";
};
module ChevronRight = {
  [@bs.module "react-feather"] [@react.component]
  external make: unit => React.element = "ChevronRight";
};
module ChevronUp = {
  [@bs.module "react-feather"] [@react.component]
  external make: (~style: ReactDOMRe.Style.t=?) => React.element = "ChevronUp";
};
module Circle = {
  [@bs.module "react-feather"] [@react.component]
  external make: unit => React.element = "Circle";
};
module Clock = {
  [@bs.module "react-feather"] [@react.component]
  external make: unit => React.element = "Clock";
};
module Download = {
  [@bs.module "react-feather"] [@react.component]
  external make: unit => React.element = "Download";
};
module Edit = {
  [@bs.module "react-feather"] [@react.component]
  external make: unit => React.element = "Edit";
};
module Help = {
  [@bs.module "react-feather"] [@react.component]
  external make: unit => React.element = "HelpCircle";
};
module Info = {
  [@bs.module "react-feather"] [@react.component]
  external make: unit => React.element = "Info";
};
module Layers = {
  [@bs.module "react-feather"] [@react.component]
  external make: unit => React.element = "Layers";
};
module List = {
  [@bs.module "react-feather"] [@react.component]
  external make: unit => React.element = "List";
};
module Plus = {
  [@bs.module "react-feather"] [@react.component]
  external make: unit => React.element = "Plus";
};
module Repeat = {
  [@bs.module "react-feather"] [@react.component]
  external make: unit => React.element = "Repeat";
};
module Settings = {
  [@bs.module "react-feather"] [@react.component]
  external make: unit => React.element = "Settings";
};
module Sidebar = {
  [@bs.module "react-feather"] [@react.component]
  external make: unit => React.element = "Sidebar";
};
module Trash = {
  [@bs.module "react-feather"] [@react.component]
  external make: unit => React.element = "Trash2";
};
module Unfullscreen = {
  [@bs.module "react-feather"] [@react.component]
  external make: (~className: string=?) => React.element = "Minimize2";
};
module UserMinus = {
  [@bs.module "react-feather"] [@react.component]
  external make: unit => React.element = "UserMinus";
};
module UserPlus = {
  [@bs.module "react-feather"] [@react.component]
  external make: unit => React.element = "UserPlus";
};
module Users = {
  [@bs.module "react-feather"] [@react.component]
  external make: unit => React.element = "Users";
};
module X = {
  [@bs.module "react-feather"] [@react.component]
  external make: (~className: string=?) => React.element = "X";
};

type simpleIcon = {
  svg: string,
  title: string,
  hex: string,
  path: string,
};

module SimpleIcon = (IconData: {let icon: simpleIcon;}) => {
  [@react.component]
  let make =
      (
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
      style=ReactDOMRe.Style.(
        make(~fill="#" ++ IconData.icon.hex, ())->combine(style)
      )
      ariaLabel
      ariaHidden>
      <path d={IconData.icon.path} />
    </svg>;
  React.setDisplayName(make, IconData.icon.title);
};

module Reason =
  SimpleIcon({
    [@bs.module "simple-icons/icons/reason"]
    external icon: simpleIcon = "default";
  });

module React =
  SimpleIcon({
    [@bs.module "simple-icons/icons/react"]
    external icon: simpleIcon = "default";
  });

/*
  https://github.com/microsoft/vscode/tree/master/src/vs/workbench/browser/parts/titlebar/media
 */
module Close = {
  [@react.component]
  let make = (~className="") =>
    <svg
      fill="none"
      height="11"
      viewBox="0 0 11 11"
      width="11"
      xmlns="http://www.w3.org/2000/svg"
      className>
      <path
        d="M6.279 5.5L11 10.221l-.779.779L5.5 6.279.779 11 0 10.221 4.721 5.5 0 .779.779 0 5.5 4.721 10.221 0 11 .779 6.279 5.5z"
        fill="#000"
      />
    </svg>;
};

module Maximize = {
  [@react.component]
  let make = (~className="") =>
    <svg
      fill="none"
      height="11"
      viewBox="0 0 11 11"
      width="11"
      xmlns="http://www.w3.org/2000/svg"
      className>
      <path d="M11 0v11H0V0h11zM9.899 1.101H1.1V9.9H9.9V1.1z" fill="#000" />
    </svg>;
};

module Minimize = {
  [@react.component]
  let make = (~className="") =>
    <svg
      fill="none"
      height="11"
      viewBox="0 0 11 11"
      width="11"
      xmlns="http://www.w3.org/2000/svg"
      className>
      <path d="M11 4.399V5.5H0V4.399h11z" fill="#000" />
    </svg>;
};

module Restore = {
  [@react.component]
  let make = (~className="") =>
    <svg
      fill="none"
      height="11"
      viewBox="0 0 11 11"
      width="11"
      xmlns="http://www.w3.org/2000/svg"
      className>
      <path
        d="M11 8.798H8.798V11H0V2.202h2.202V0H11v8.798zm-3.298-5.5h-6.6v6.6h6.6v-6.6zM9.9 1.1H3.298v1.101h5.5v5.5h1.1v-6.6z"
        fill="#000"
      />
    </svg>;
};