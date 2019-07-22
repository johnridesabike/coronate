[%raw "require(\"./styles\")"]

ReactDOMRe.renderToElementWithId(<App />, "root");

module ServiceWorker = {
  [@bs.module "./serviceWorker"]
  external unregister: unit => unit = "unregister";
};

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
ServiceWorker.unregister();