![Coronate logo.](./graphics/logo.svg)

# Coronate

Coronate is a web app for managing Swiss-style chess tournaments.

[Web app](https://coronate.netlify.app/) |
[Issue tracker](https://github.com/johnridesabike/coronate/issues) |
[Source code on GitHub](https://github.com/johnridesabike/coronate) |
[Sourcehut mirror](https://sr.ht/~johnridesabike/coronate/) |
[Mailing list](https://lists.sr.ht/~johnridesabike/public-inbox)

## Help wanted!

Maintenance is currently paused for Coronate. This has almost always been a
one-person passion project, and there simply isn't time to work on it these
days. The [version hosted here](https://coronate.netlify.app/) should continue
to work for the forseeable future, and its code will always be open-source.
Anyone may use the Coronate source code in accordance with its
[license](./LICENSE).

If you have a special interest in working with Coronate that you wish to
discuss, please still feel free to reach out through my maling list
(<~johnridesabike/public-inbox@lists.sr.ht>) or the GitHub issue tracker.

## About

Coronate is a free chess tournament manager. Anyone, even a tournament newbie
with nothing but a web browser at their public library, can use it to run their
tournament.

[👉 Click here to open Coronate ♟](https://coronate.netlify.app/)

[Read more about how to use the app here](https://johnridesa.bike/software/coronate/).

[Read the frequently asked questions here](./docs/faq.md).

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

You will need to install [Node.js] version 22. Coronate might run on other
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
# Install Corepack:
npm install -g corepack

# Install dependencies:
pnpm install
```

## Usage

Coronate works completely in your local browser.

First run this to compile the ReScript source:

```
pnpm run build:rescript
```

Alternatively, you can run the compiler in watch mode:

```
pnpm run start:rescript
```

Then run this to start a development version of the app:

```
pnpm start
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
pnpm test
```

To create an optimized version for your own website, run:

```
pnpm run build
```

To automatically format all of the ReScript source files, run:

```
pnpm run format
```

## Contributing, hacking, and more

[See this document with information about contributing.](CONTRIBUTING.md)

Coronate tries to have easy-to-use formats so users can truly own their data.
[For example, you can use this python script to output standings](https://github.com/johnridesabike/coronate/issues/90).

## Acknowledgments

The three "kings" in the logo are derived from the Mérida chess font, which is
informally licensed as "freeware."

Some human interface decisions (colors, buttons, etc.) are based on the
[Photon Design System](https://design.firefox.com/photon/) for an elegant,
OS-neutral, appearance.
