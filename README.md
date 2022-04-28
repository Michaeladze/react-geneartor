# react-generator-cmd

Install dependencies
```js
yarn add redux react-redux redux-observable redux-actions redux-actions-ts axios axios-observable express cors
```
Install devDependencies
```js
yarn add -D redux-devtools-extension @types/redux-actions @types/react-redux jest ts-jest @types/jest
```

Install CLI
```js
yarn add -D react-generator-cmd
```

Add script to package.json
```js
scripts: {
  "g": "node node_modules/react-generator-cmd/dist"
}
```

Run generator
```js
npm run g
yarn g
```

To run tests add this lines to package.json
```js
"jest": {
    "transform": {
      "^.+\\.(ts|tsx)?$": "ts-jest"
    },
    "testEnvironment": "jsdom"
  }
```

## Config

Create a `g.json` file in the root folder.

`root` - the root folder where files are created

`structure` - the structure of your folders in the project. You can add dynamic names by using `:` prefix. When generator detects the dynamic name, it will ask to create new folder inside it or select the existing one.

`css` - accepts values `css | scss | less | styled` or any other custom value with extension e.g. styles.ts. 

`redux.folder` - the folder where redux is stored.

`redux.mainApplication` - if you have multiple large parts of the project that want to have their own redux states and to be combined into one at the main application dynamically, you can specify main application here. Generator will create specific index.ts file with all the registrations and injection functions.

`redux.registerDependents` - specify if you want to register reducers and effects in index.ts for applications different from the one specified in "mainApplication" field.

`testAlias` - `spec | test`.

`explicit` - boolean. By default, is set to `false`. If a folder contains just one folder inside, with explicit flag equal to true generator will still ask you about that folder.

`router.path` - how the router folder will be named.

`router.pageAlias` - a key from your structure that associated with pages.

`applications` - if your project contains of multiple applications, define the folder where those applications are located. For example, "lerna" applications are located in "packages" folder.
Notice, that the structure, router and redux paths will be relative to the application folder.

#### Example:

```json
{
  "root": "./src",
  "structure": {
    "components": {
      "shared": "",
      "features": {
        ":id": ""
      },
      "pages": "",
      "templates": "",
      "popups": ""
    }
  },
  "css": "css",
  "redux": {
    "folder": "redux",
    "mainApplication": "portal"
  },
  "testAlias": "spec",
  "explicit": false,
  "router": {
    "path": "/router",
    "pageAlias": "pages"
  },
  "applications": "/applications"
}
```
