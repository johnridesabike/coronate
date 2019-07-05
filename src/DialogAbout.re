let github_url = "https://github.com/johnridesabike/coronate";
let license_url = "https://github.com/johnridesabike/coronate/blob/master/LICENSE";

[@react.component]
let make = () => {
  <article
    style={ReactDOMRe.Style.make(
      ~display="flex",
      ~justifyContent="space-between",
      ~width="100%",
      (),
    )}>
    <div
      style={ReactDOMRe.Style.make(~flex="0 0 48%", ~textAlign="center", ())}
      // <img src={logo} height="196" width="196" alt=""/>
    />
    <div style={ReactDOMRe.Style.make(~flex="0 0 48%", ())}>
      <h1
        className="title"
        style={ReactDOMRe.Style.make(~textAlign="left", ())}>
        {React.string("Coronate")}
      </h1>
      <p> {React.string("Copyright &copy; 2019 John&nbsp;Jackson")} </p>
      <p> {React.string("Coronate is free software.")} </p>
      <p>
        <a
          href=github_url
          onClick={e => ElectronUtils.ifElectronOpen(e, github_url)}>
          {React.string("Source code is available")}
        </a>
        <br />
        {React.string(" under the ")}
        <a
          href=license_url
          onClick={e => ElectronUtils.ifElectronOpen(e, license_url)}>
          {React.string("AGPL v3.0 license")}
        </a>
        {React.string(".")}
      </p>
    </div>
  </article>;
};