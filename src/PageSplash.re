// import Caution from "../components/caution";
// import Icons from "../components/icons";
// import {Notification} from "../components/utility";
// import React from "react";
// import {WindowBody} from "../components/window";
// import {ifElectronOpen} from "../electron-utils";
// import {loadDemoDB} from "../hooks/db";
// import logo from "../icon-min.svg";
// import styles from "./splash.module.css";

let github_url = "https://github.com/johnridesabike/coronate";
let license_url = "https://github.com/johnridesabike/coronate/blob/master/LICENSE";
let issues_url = "https://github.com/johnridesabike/coronate/issues/new";

[@react.component]
let make = () => {
  // <WindowBody footer={<Caution />} footerProps={{style: {border: "none"}}}>
  <div className="splash__splash">
    // <aside className={styles.hint}>
    //     <ol>
    //         <li>
    //             <button
    //                 className="button-primary"
    //                 onClick={loadDemoDB}
    //             >
    //                 Click here to load the demo data
    //             </button>{" "}
    //             (optional)
    //         </li>
    //         <li>
    //             <Icons.ArrowLeft /> Select a menu item.
    //         </li>
    //         <li>
    //             Start creating your tournaments!
    //         </li>
    //     </ol>
    //     <Notification warning>
    //         If you experience glitches or crashes,<br />
    //         clear your browser cache and try again.
    //     </Notification>
    // </aside>

      <div className="splash__title">
        <div
          className="splash__titleIcon"
          // <img src={logo} alt="" height="96" width="96" />
        />
        <div className="splash__titleText">
          <h1
            className="title"
            style={ReactDOMRe.Style.make(~fontSize="40px", ())}>
            {React.string("Coronate")}
          </h1>
          <p className="splash__subtitle caption-30">
            {React.string("Tournament manager")}
          </p>
        </div>
      </div>
      <footer className="body-20 splash__footer">
        <div style={ReactDOMRe.Style.make(~textAlign="left", ())}>
          <p> {React.string("Copyright &copy; 2019 John Jackson.")} </p>
          <p>
            {React.string("Coronate is free software.")}
            <br />
            <a href=github_url>
              // onClick={(e) => ifElectronOpen(e, github_url)}
               {React.string("Source code is available")} </a>
            {React.string(" under the ")}
            <a href=license_url>
              // onClick={(e) => ifElectronOpen(e, LICENSE_URL)}
               {React.string("AGPL v3.0 license")} </a>
            {React.string(".")}
          </p>
        </div>
        <div style={ReactDOMRe.Style.make(~textAlign="right", ())}>
          <p>
            <a href=issues_url>
              // onClick={(e) => ifElectronOpen(e, ISSUES_URL)}
               {React.string("Suggestions and bug reports are welcome.")} </a>
          </p>
          <p>
            {React.string("Built with JavaScript and ")}
            <a href="https://reactjs.org/">
              // onClick={(e) => ifElectronOpen(
              //     e,
              //     "https://reactjs.org/"
              // )}
               {React.string("React")} </a>
            {React.string(".")}
            <span style={ReactDOMRe.Style.make(~fontSize="16px", ())}>
              <Icons.JavaScript />
              <Icons.ReactIcon />
            </span>
          </p>
        </div>
      </footer>
    </div>;
    // </WindowBody>
};