<div align="center">
<img alt="Logo" src="graphics/logo.svg" height="128" width="128" />
<h1>Coronate</h1>
<p>Coronate is a web app for managing Swiss-style chess tournaments.</p>
</div>

## About

Coronate is a free chess tournament manager. Anyone, even a tournament newbie
with nothing but a web browser at their public library, can use it to run their
tournament.

<p align="center"><a href="https://coronate.netlify.app/">👉 Click here to open Coronate ♟</a></p>

[Read more about how to use the app here](https://johnridesa.bike/software/coronate/).

![Round screenshot](./screenshot-round.png)
![Scoring screenshot](./screenshot-score-detail.png)

## Enjoy using Coronate?

Coronate is free software, but you're welcome to show your appreciation.

<a href=https://www.buymeacoffee.com/johnridesabike target=_blank>
  <img
    src=https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png
    alt="Buy Me A Coffee"
    height=60
    width=217
    style="height: 60px !important;width: 217px !important;"
  />
</a>

## Development

You will need to install [Node.js] version 18. Coronate might run on other
versions too, but it's not tested on them.

[node.js]: https://nodejs.org/

The source code is mostly written in [ReScript] and [React], which compiles to
JavaScript. You'll need to be at least familiar with these languages and their
toolchains.

[rescript]: https://rescript-lang.org/

[react]: [https://reactjs.org/]

### Installing

For most people, the easiest method is to click the "Clone or Download" button
on [this project's GitHub homepage](https://github.com/johnridesabike/coronate).

If you have Git installed, you can run:

```
git clone https://github.com/johnridesabike/coronate.git
```

If you want to make your own changes, then you should fork this repository on
GitHub and clone your forked version.

Once you have a local copy of the code, run this command in the project's
directory to install its dependencies:

```
npm install
```

## Usage

Coronate works completely in your local browser.

First run this to compile the ReScript source:

```
npm run build:rescript
```

Alternatively, you can run the compiler in watch mode:

```
npm run start:rescript
```

Then run this to start a development version of the app:

```
npm start
```

This will start a server hosting Coronate on your computer. You can then open
the app by clicking the link it shows you.

The server works with the JavaScript files that are created by the ReScript
compiler. If you edit the ReScript source, it will need to recompile before the
changes appear in the live app.

The app keeps your data in your browser's storage, so be mindful that data loss
can happen unexpectedly depending on your settings. The app's "options" page has
a button to back up your data in an external file.

### Other commands

To execute the tests, run:

```
npm test
```

To create an optimized version for your own website, run:

```
npm run build
```

To automatically format all of the ReScript source files, run:

```
npm run format
```

## Contributing

[See this document with information about contributing.](CONTRIBUTING.md)

## Acknowledgments

The three "kings" in the logo are derived from the Mérida chess font, which is
informally licensed as "freeware."

Some human interface decisions (colors, buttons, etc.) are based on the
[Photon Design System](https://design.firefox.com/photon/) for an elegant,
OS-neutral, appearance.
