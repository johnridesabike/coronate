## Code of conduct

[Read the code of conduct!](https://github.com/johnridesabike/coronate/tree/master/CODE_OF_CONDUCT.md) It's short and to-the-point.

## Bug reports, suggestions, and questions:

[Click here to open a new issue](https://github.com/johnridesabike/coronate/issues).

## Other types of feedback:

The direction of this project is currently 100% influenced by my own use case. If you would find this project useful but some part of it doesn't play nicely with your needs, let me know! (Via an [issue](https://github.com/johnridesabike/coronate/issues) or an [email](mailto:johnbicyclejackson@icloud.com).) I would like as many people as possible to benefit from the work that went into this.

My own work environment has some very specific (and ususual) conditions which led to the decisions I've made so far for the project. I'm happy to hear from users who must also work in unique environments.

## Directories of interest

- [`/src/pairing-scoring/`](https://github.com/johnridesabike/coronate/tree/master/src/pairing-scoring) includes the logic for pairing players and calculating tiebreaks. It has its own to-do list, [which you can read here](https://github.com/johnridesabike/coronate/tree/master/src/pairing-scoring/TODO.md).
- The React JSX components are stored in [`/src/pages/`](https://github.com/johnridesabike/coronate/tree/master/src/pages) (top-level pages and their sub-pages) and [`/src/components/`](https://github.com/johnridesabike/coronate/tree/master/src/components) (smaller components reused throughout the pages).
- [`/graphics-src/`](https://github.com/johnridesabike/coronate/tree/master/graphics-src) includes the files for the logo, along with scripts to build them into different formats.

## About the code style

This project uses [Ramda](https://ramdajs.com/) as it's utility library, and a lot of its code is optimized to play nicely with Ramda's flavor of functional programming. 

## Type system

This project uses [tcomb](https://github.com/gcanti/tcomb) to ensure type-safety where it's necessary. There are a few custom types viewable in [`/src/data-types/types.js`](https://github.com/johnridesabike/coronate/blob/master/src/data-types/types.js) and [`/src/pairing-scoring/types.js`](https://github.com/johnridesabike/coronate/blob/master/src/pairing-scoring/types.js). 
