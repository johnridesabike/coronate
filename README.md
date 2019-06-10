<div align="center">
<img alt="Logo" src="graphics-src/icon_inkscape.svg" height="128" width="128" />
<h1>Chessahoochee</h1>
</div>

<p align="center">Chessahoochee is a web app for managing Swiss-style chess tournaments.</p>

## 🧐 About

Chessahoochee was originally built to help the chess players at Chattahoochee Valley Libraries (which is where its goofy name comes from). It's a free alternative to pricey professional tournament software. Anyone, even a tournament newbie with a locked-down public-access computer, can use it to run their tournament.

<p align="center"><a href="https://johnridesa.bike/chessahoochee/">👉 Click here for a live demo ♟</a></p>

## 🏁 Getting Started

These are the basic steps you'll need to follow to get a development copy of Chessahoochee running on your machine:

### Prerequisites

You'll need [Node.js](https://nodejs.org/) version 10. Chessahoochee probably runs on other versions too, but it's not tested on them.

### Installing

#### 1: Grab the code

For most people, the easiest method to to click the "Clone or Download" button on [this project's GitHub homepage](https://github.com/johnridesabike/chessahoochee).

If you have Git installed, you can also run:
```
git clone https://github.com/johnridesabike/chessahoochee.git
```

#### 2: Install the dependencies

Once you have a local copy of the code, run this command in the project's directory to install its dependencies:
```
npm install
```

## 🔧 Running the tests

The current tests are incomplete and only test a few of the most fragile functions.

You can run the tests with the command:
```
npm test
```

## 🎈 Usage

Chessahoochee works completely in your local browser. You can run your live demo of it with the command:
```
npm start
```
and then open this URL: `http://localhost:3000`.

Because it keeps your data in your browser's storage, be mindful that data loss can happen unexpectedly depending on your settings. The app's "options" page has a button to back up your data in an external file.

To use the standalone Electron version, run:
```
npm run start:electron
```
Or if you're on Windows, then run:
```
npm run start:electron-win
```
The Electron functionality is almost identical to the web version. The biggest difference is that it stores your data separately from your browser.

## 🚀 Deployment 

Chessahoochee has several build commands for different deployment methods:

`npm run build` will create an optimized version that can be uploaded to your own website.

`npm run build:electron-all` Will create standalone Electron bundles for Mac and Windows. The Windows version is "portable", which means it has no installer and it stores all of its data in the same folder as its executable. If you're on a Windows system, run `npm run build:electron-win` to only build the Windows version.

Linux builds have not been tested yet.

## ⛏️ Built Using

- [Node.js](https://nodejs.org/en/) - JavaScript runtime
- [React](https://reactjs.org/) - interface
- [Electron](https://electronjs.org/) - standalone executables
- [Ramda](https://ramdajs.com/) - utility functions and state management
- [LocalForage](https://localforage.github.io/localForage/) - IndexedDB storage
- [tcomb](https://github.com/gcanti/tcomb) - type safety
- [Feather](https://feathericons.com/) - icons
- [Simple Icons](http://simpleicons.org/) - more icons

## ✍️ Authors

- [@johnridesabike](https://github.com/johnridesabike) - Idea and initial work

## 🎉 Acknowledgements 

The three "kings" in the logo are derived from a [GPLv2+](https://www.gnu.org/licenses/gpl-2.0.txt) licensed derivation of the "Merida" icon set. The original Merida was informally licensed as "freeware."
