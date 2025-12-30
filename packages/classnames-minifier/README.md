# classnames-minifier

[![npm version](https://badge.fury.io/js/classnames-minifier.svg)](https://badge.fury.io/js/classnames-minifier)

Library for configuring style _(css/scss/sass)_ modules to generate compressed classes (`.header` -> `.a`, `.nav` -> `.b`, ..., `.footer` -> `.aad`, etc.) with support for changes and rebuilding without clearing the built application.

## Reasons

_Compressing classes_ can reduce the size of the generated html and css by up to _20%_, which will have a positive effect on page rendering and metrics (primarily [FCP](https://web.dev/first-contentful-paint/))

## Installation

**Using npm:**

```bash
npm i classnames-minifier
```

**Using yarn:**

```bash
yarn add classnames-minifier
```

## Configuration

### Options

- `prefix` - custom prefix that will be added to each updated class;
- `reservedNames` - array of reserved names that should not be used by this package (must include prefix);
- `cacheDir` - directory where this library will write the cache. Passing this parameter will enable caching. Use this option only if your framework really needs it;
- `distDir` - directory where the project is being assembled. Used only when caching is enabled to synchronize caches between this library and the project;
- `disableDistDeletion` - option that allows you to disable the automatic deletion of the dist folder if necessary (_f.e. differences in package setup in cache and now or first launch_);

Configuration example:

```js
// webpack.config.js
const classnamesMinifier = new ClassnamesMinifier({
  prefix: "_",
  reservedNames: ["_en", "_de"],
});
// ...
loaders.push({
  loader: require.resolve("css-loader"),
  options: {
    importLoaders: 3,
    modules: {
      mode: "local",
      getLocalIdent: classnamesMinifier.getLocalIdent,
    },
  },
});
```

If the framework you are using utilizes component caching between builds, you can configure caching in classnames-minifier as well. As a result, module classes between builds will use the same compressed classes.

```js
// webpack.config.js
const classnamesMinifier = new ClassnamesMinifier({
  distDir: path.join(process.cwd(), "build"),
  cacheDir: path.join(process.cwd(), "build/cache"),
});
// ...
loaders.push(
  classnamesMinifier.postLoader,
  {
    loader: require.resolve("css-loader"),
    options: {
      importLoaders: 3,
      modules: {
        mode: "local",
        getLocalIdent: classnamesMinifier.getLocalIdent,
      },
    },
  },
  classnamesMinifier.preLoader
);
```

## License

[MIT](https://github.com/alexdln/classnames-minifier/blob/main/LICENSE)
