const fs = require('fs');
const { storeIndexTemplate } = require('./templates/redux');
const { storeIndexMainTemplate } = require('./templates/redux/indexMainApp');
const { reducerTemplate } = require('./templates/redux/reducers');
const { serviceTemplate } = require('./templates/redux/services');
const { effectTemplate } = require('./templates/redux/effects');
const { typesTemplate } = require('./templates/redux/types');
const { expressTemplate } = require('./templates/redux/express');
const { apiTemplate } = require('./templates/redux/api');
const { actionTemplate, commonActionsTemplate, } = require('./templates/redux/actions');
const { mkDir, mkFile } = require('./mk');
const { appendImports, insertComma } = require('./appendImports');
const { testsTemplate } = require('./templates/redux/tests');
const { runLinter } = require('./runLinter');
const { getTestPayload } = require('./utils');

function createReduxState(answers, path, json) {
  if (answers.name) {
    path += `/${json.redux.folder}`;
    mkDir(path);

    const name = answers.name.charAt(0).toLowerCase() + answers.name.slice(1);

    createIndex(answers, path, json);
    createCommonActions(path);
    createTypes(answers, path, name);
    // createMocks(answers, name);
    // answers.initServer && createServer(answers, name);
    createAction(answers, path, name);
    if (answers.async) {
      createEffect(answers, path, name);
      createService(answers, path, name);
    }

    if (answers.tests) {
      createTests(answers, path, name, json);
    }

    createReducer(answers, path, name);
    createState(answers, path, name);
    runLinter(`${json.root}`);
  } else {
    console.log('No action name was provided');
  }
}

// ---------------------------------------------------------------------------------------------------------------------

function createIndex(answers, path, json) {
  const file = path + '/index.ts';
  if (!json.redux.mainApplication && !json.applications) {
    mkFile(file, storeIndexMainTemplate());
  } else {
    const appName = answers.application === '[Create New]' ? answers.applicationName : answers.application;

    if (appName.toLowerCase() === json.redux.mainApplication.toLowerCase()) {
      mkFile(file, storeIndexMainTemplate());
    } else if (json.redux.createIndexForDependents !== false) {
      mkFile(file, storeIndexTemplate());
    }
  }
}

// ---------------------------------------------------------------------------------------------------------------------

function createCommonActions(path) {
  path += '/_common';
  mkDir(path);

  path += `/actions.ts`;
  mkFile(path, commonActionsTemplate());
}

// ---------------------------------------------------------------------------------------------------------------------

function createTypes(answers, path, name) {
  path += '/types';
  mkDir(path);

  path += `/${ name }.types.ts`;
  mkFile(path, typesTemplate(name, answers), () => {

    fs.readFile(path, { encoding: 'utf8' }, (err, data) => {
      const writeStream = fs.createWriteStream(path, { flags: 'a' });
      const fileData = data.split('\n');
      writeStream.write(typesTemplate(name, answers, fileData));
    });
  });
}

// ---------------------------------------------------------------------------------------------------------------------

function createAction(answers, path, name) {
  path += '/actions';
  mkDir(path);

  path += `/${ name }.actions.ts`;
  mkFile(path, actionTemplate(name, answers, true), () => {

    fs.readFile(path, { encoding: 'utf8' }, (err, data) => {
      appendImports(['types'], data, path, name, answers, () => {
        const writeStream = fs.createWriteStream(path, { flags: 'a' });
        writeStream.write(actionTemplate(name, answers));
      });
    });
  });
}

// ---------------------------------------------------------------------------------------------------------------------

function createEffect(answers, path, name) {
  path += '/effects';
  mkDir(path);

  path += `/${ name }.effects.ts`;
  mkFile(path, effectTemplate(name, path, answers, true), () => {

    fs.readFile(path, { encoding: 'utf8' }, (err, data) => {
      appendImports(['actions', 'services', 'types'], data, path, name, answers, () => {
        const writeStream = fs.createWriteStream(path, { flags: 'a' });
        writeStream.write(effectTemplate(name, path, answers));
      });
    });
  });
}

// ---------------------------------------------------------------------------------------------------------------------

function createService(answers, path, name) {
  path += '/services';
  mkDir(path);

  path += `/${ name }.services.ts`;
  mkFile(path, serviceTemplate(name, path, answers, true), () => {

    fs.readFile(path, { encoding: 'utf8' }, (err, data) => {
      appendImports(['types'], data, path, name, answers, () => {
        const writeStream = fs.createWriteStream(path, { flags: 'a' });
        writeStream.write(serviceTemplate(name, path, answers));
      });
    });

  });
}

// ---------------------------------------------------------------------------------------------------------------------

function createApi(answers, name) {
  const path = 'backend/index.js';
  mkFile(path, apiTemplate(name, answers), () => {

    fs.readFile(path, { encoding: 'utf8' }, (err, data) => {

      const lines = data.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (lines[i] === '// [NEW ENDPOINT]') {
          lines[i] = lines[i].replace('// [NEW ENDPOINT]', apiTemplate(name, answers) + '\n// [NEW ENDPOINT]');
        }
      }

      fs.writeFile(path, lines.join('\n'), (err) => {
        if (err) {
          console.log(err);
        }
      });
    });

  });
}

// ---------------------------------------------------------------------------------------------------------------------

function createReducer(answers, path, name) {
  path += '/reducers';
  mkDir(path);

  path += `/${ name }.reducer.ts`;
  mkFile(path, reducerTemplate(name, path, answers, true, true), () => {

    fs.readFile(path, { encoding: 'utf8' }, (err, data) => {
      appendImports(['actions', 'types'], data, path, name, answers, () => {

        fs.readFile(path, { encoding: 'utf8' }, (err, data) => {
          if (data) {
            const lines = data.split('\n');
            const capName = answers.name.charAt(0).toUpperCase() + answers.name.slice(1);
            const successType = answers.successType || 'any';

            for (let i = 0; i < lines.length; i++) {

              if (lines[i].includes(`export interface I${ capName }State`)) {
                let j = i;
                while (!lines[j].includes('}')) {
                  j++;
                }
                const reducerKey = answers.reducerKey ? `  ${answers.reducerKey}: ${ successType };\n` : '';
                lines[j] = lines[j].replace('}', `${ reducerKey }}`);
              }

              if (lines[i].includes('export const initialState')) {
                let j = i;
                while (!lines[j].includes('};')) {
                  j++;
                }
                const reducerKey = answers.reducerKey ? `  ${answers.reducerKey}: ${getTestPayload(successType)},\n` : '';
                lines[j] = lines[j].replace('}', `${ reducerKey }}`);
              }
            }

            fs.writeFile(path, lines.join('\n'), (err) => {
              if (err) {
                console.log(err);
              }
            });
          }
        })
      });
    });

  });
}

// ---------------------------------------------------------------------------------------------------------------------

function createState(answers, path, name) {
  const indexPath = `${path}/index.ts`;

  fs.readFile(indexPath, { encoding: 'utf8' }, (err, data) => {
    if (data) {
      const lines = data.split('\n');
      const capName = answers.name.charAt(0).toUpperCase() + answers.name.slice(1);
      let hasReducerImport = false;
      let hasEffectImport = false;

      let effectImport = `import { ${ answers.actionName }Effect$ } from './effects/${ name }.effects';\n`;

      for (let i = 0; i < lines.length; i++) {

        if (lines[i].includes(`./reducers/${ name }.reducer`)) {
          hasReducerImport = true;
        }

        if (answers.async && lines[i].includes(`./effects/${ name }.effects`)) {
          hasEffectImport = true;
          insertComma(lines, i, '}');
          lines[i] = lines[i].replace('}', `${ answers.actionName }Effect$ }`);
        }

        if (lines[i].includes('[imports:end]')) {
          const reducerImport = !hasReducerImport ? `import ${ name }Reducer, { I${ capName }State } from './reducers/${ name }.reducer';\n` : '';
          if (hasEffectImport || !answers.async) {
            effectImport = '';
          }

          lines[i - 1] = lines[i - 1].replace('', `${ effectImport }${ reducerImport }`);
        }

        if (!hasReducerImport && lines[i].includes('[reducers:end]')) {
          lines[i - 1] = lines[i - 1].replace('', `  ${ name }: ${ name }Reducer, \n`);
        }

        if (answers.async && lines[i].includes('[effects:end]')) {
          lines[i - 1] = lines[i - 1].replace('', `  ${ answers.actionName }Effect$, \n`);
        }

        if (!hasReducerImport && lines[i].includes('[types:end]')) {
          lines[i - 1] = lines[i - 1].replace('', `  ${ name }: I${ capName }State; \n`);
        }
      }

      fs.writeFile(indexPath, lines.join('\n'), (err) => {
        if (err) {
          console.log(err);
        }
      });
    }
  });
}

// ---------------------------------------------------------------------------------------------------------------------

function createServer(answers, name) {
  let path = 'backend';
  mkDir(path);

  path += '/index.js';
  mkFile(path, expressTemplate());
}

// ---------------------------------------------------------------------------------------------------------------------

function createTests(answers, path, name, json) {
  path += '/_tests';
  mkDir(path);

  path += `/${name}`;
  mkDir(path);

  const testAlias = json.testAlias || 'spec';

  path += `/${ answers.actionName }.${testAlias}.ts`;
  mkFile(path, testsTemplate(name, answers));
}

// ---------------------------------------------------------------------------------------------------------------------

module.exports = {
  createReduxState
};
