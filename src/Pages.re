module CautionFooter = {
  [@react.component]
  let make = () =>
    <aside className="caution__container body-20">
      <p className="caution__text">
        {React.string(
           "This is beta software. Want to help make it better? Check out the ",
         )}
        <span role="img" ariaHidden=true> {React.string({j| 👉 |j})} </span>
        {React.string(Utils.Entities.nbsp)}
        <a
          className="caution__link"
          href=Utils.github_url
          onClick={e => e->ElectronUtils.ifElectronOpen}>
          {React.string("Git repository")}
        </a>
        {React.string(".")}
      </p>
    </aside>;
};

module Splash = {
  [@react.component]
  let make = () => {
    <Window.WindowBody footerFunc={() => <CautionFooter />}>
      <div className="splash__splash">
        <aside className="splash__hint">
          <ol>
            <li>
              <button
                className="button-primary" onClick={_ => Db.loadDemoDB()}>
                {React.string("Click here to load the demo data")}
              </button>
              {React.string("(optional)")}
            </li>
            <li>
              <Icons.arrowLeft />
              {React.string(" Select a menu item.")}
            </li>
            <li> {React.string("Start creating your tournaments!")} </li>
          </ol>
          <Utils.Notification kind=Utils.Warning>
            {"If you experience glitches or crashes," |> React.string}
            <br />
            {"clear your browser cache and try again." |> React.string}
          </Utils.Notification>
        </aside>
        <div className="splash__title">
          <div className="splash__titleIcon">
            <img src=Utils.WebpackAssets.logo alt="" height="96" width="96" />
          </div>
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
            <p>
              {React.string(
                 "Copyright " ++ Utils.Entities.copy ++ " 2019 John Jackson.",
               )}
            </p>
            <p>
              {React.string("Coronate is free software.")}
              <br />
              <a
                href=Utils.github_url
                onClick={e => e->ElectronUtils.ifElectronOpen}>
                {React.string("Source code is available")}
              </a>
              {React.string(" under the ")}
              <a
                href=Utils.license_url
                onClick={e => e->ElectronUtils.ifElectronOpen}>
                {React.string("AGPL v3.0 license")}
              </a>
              {React.string(".")}
            </p>
          </div>
          <div style={ReactDOMRe.Style.make(~textAlign="right", ())}>
            <p>
              <a
                href=Utils.issues_url
                onClick={e => e->ElectronUtils.ifElectronOpen}>
                {React.string("Suggestions and bug reports are welcome.")}
              </a>
            </p>
            <p>
              {React.string("Built with ")}
              <a
                href="https://reasonml.github.io/reason-react/"
                onClick={e => e->ElectronUtils.ifElectronOpen}>
                {React.string("ReasonReact")}
              </a>
              {React.string(". ")}
              <span style={ReactDOMRe.Style.make(~fontSize="16px", ())}>
                <Icons.Reason />
                {React.string(" ")}
                <Icons.ReactIcon />
              </span>
            </p>
          </div>
        </footer>
      </div>
    </Window.WindowBody>;
  };
};

module NotFound = {
  [@react.component]
  let make = () =>
    <p className="content-area"> {React.string("Page not found.")} </p>;
};