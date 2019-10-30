<div align="center">
<img alt="Logo" src="graphics-src/icon-min.svg" height="128" width="128" />
<h1>Coronate</h1>
</div>

<p align="center">Coronate is a web app for managing Swiss-style chess tournaments.</p>

## 🧐 About

Coronate is a free alternative to pricey professional tournament software. Anyone, even a tournament newbie with a locked-down public-access computer, can use it to run their tournament.

<p align="center"><a href="https://johnridesa.bike/coronate/">👉 Click here for a live demo ♟</a></p>

[Read more about how to use the app here](https://johnridesa.bike/software/coronate/).

![Round screenshot](./screenshot-round.png)
![Scoring screenshot](./screenshot-score-detail.png)

## 🏁 Getting Started

These are the basic steps you'll need to follow to get a development copy of Coronate running on your machine:

### Prerequisites

You'll need [Node.js](https://nodejs.org/) version 10. Coronate probably runs on other versions too, but it's not tested on them.

### Installing

#### 1: Grab the code

For most people, the easiest method is to click the "Clone or Download" button on [this project's GitHub homepage](https://github.com/johnridesabike/coronate).

If you have Git installed, you can also run:
```
git clone https://github.com/johnridesabike/coronate.git
```

If you want to make your own changes, then it's recommended to fork the repository on GitHub and clone your forked version.

#### 2: Install the dependencies

Once you have a local copy of the code, run this command in the project's directory to install its dependencies:
```
npm install
```

## 🎈 Usage

Coronate works completely in your local browser. Running it only requires two commands.

First run this:

```
npm run re:watch
```

*Note: If you're using an editor that can compile Reason code automatically, such as VS Code and [reason-vscode](https://marketplace.visualstudio.com/items?itemName=jaredly.reason-vscode), then you don't need to run `re:watch`*

Then run this:

```
npm start
```

And then open this URL: `http://localhost:3000`.

Because it keeps your data in your browser's storage, be mindful that data loss can happen unexpectedly depending on your settings. The app's "options" page has a button to back up your data in an external file.


To use the standalone Electron version, then run this instead of `start`:
```
npm run start:electron
```
Or if you're on Windows, then run:
```
npm run start:electron-win
```
The Electron functionality is almost identical to the web version. The biggest difference is that it stores your data separately from your browser.

## 🔧 Running the tests

The current tests are incomplete and only test a few of the most fragile functions.

Just as with using the live version, you need to run `npm run re:watch` first (but not if you're using an editor that compiles Reason automatically).

Then you can run the tests with the command:
```
npm test
```

## 🚀 Deployment 

To create an optimized version that can be uploaded to your own website, run:

```
npm run build
```

To create a standalone Electron app for Mac and Windows, run: 
```
npm run build:electron-all
```

If you're on a Windows system, run this to only build the Windows version:
```
npm run build:electron-win
```


The Windows version is "portable." It has no installer and stores all of its data in the same folder as its executable.

Linux builds have not been tested.

## ⛏️ Built Using

- [Node.js](https://nodejs.org/en/) - JavaScript runtime
- [Create React App](https://create-react-app.dev) - Build and development configuration
- [ReasonML](https://reasonml.github.io) - most of the code
- [ReasonReact](https://reasonml.github.io/reason-react/) - interface
- [LocalForage](https://localforage.github.io/localForage/) - IndexedDB storage
- [bs-css](https://github.com/SentiaAnalytics/bs-css) (with [Emotion](https://emotion.sh/)) - styling
- [Electron](https://electronjs.org/) - standalone executables
- [Feather](https://feathericons.com/) - icons
- [Simple Icons](http://simpleicons.org/) - more icons

## ✍️ Authors

- [@johnridesabike](https://github.com/johnridesabike) - Idea and initial work

## 🎉 Acknowledgements 

The three "kings" in the logo are derived from the Mérida chess font, which was informally licensed as "freeware."

Some human interface decisions (colors, buttons, etc.) are based on the [Photon Design System](https://design.firefox.com/photon/) for an elegant, OS-neutral, appearance.
