<div align="center">
<img alt="Logo" src="graphics-src/icon-min.svg" height="128" width="128" />
<h1>Chessahoochee</h1>
</div>

<p align="center">Chessahoochee is a web app for managing Swiss-style chess tournaments.</p>

## 🧐 About

Chessahoochee was originally built to help the chess players at Chattahoochee Valley Libraries (which is where its goofy name comes from). It's a free alternative to pricey professional tournament software. Anyone, even a tournament newbie with a locked-down public-access computer, can use it to run their tournament.

<p align="center"><a href="https://johnridesa.bike/chessahoochee/">👉 Click here for a live demo ♟</a></p>

[Read more about how to use the app here](https://johnridesa.bike/software/chessahoochee/). It's mostly version 1.0 feature-complete, but it is definitely still in beta.

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

If you want to make your own changes, then it's recommended to fork the repository on GitHub and clone your forked version.

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
- [React](https://reactjs.org/) - interface
- [Electron](https://electronjs.org/) - standalone executables
- [Ramda](https://ramdajs.com/) - utility functions
- [LocalForage](https://localforage.github.io/localForage/) - IndexedDB storage
- [tcomb](https://github.com/gcanti/tcomb) - type safety
- [Feather](https://feathericons.com/) - icons
- [Simple Icons](http://simpleicons.org/) - more icons

## ✍️ Authors

- [@johnridesabike](https://github.com/johnridesabike) - Idea and initial work

## 🎉 Acknowledgements 

The three "kings" in the logo are derived from the Mérida chess font, which was informally licensed as "freeware."

Some human interface decisions (colors, buttons, etc.) are based on the [Photon Design System](https://design.firefox.com/photon/) for an elegant, OS-neutral, appearance.
