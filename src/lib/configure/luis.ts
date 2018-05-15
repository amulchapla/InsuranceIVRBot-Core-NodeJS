import * as async from 'async';
import * as fs from 'fs';
import * as path from 'path';

import { LuisManagementCallback, LuisTrainingClient, ManagementResponse } from 'cognitive-luis-client';
import { Callback } from '.';
import { LUIS, LUIS_MANAGER } from '../services';
import { LUIS_MANAGER_SETTINGS } from '../settings';

const LUIS_APP_PATH = path.resolve(__dirname, '../../data/luis/AdventureWorks.json');
const ENVIRONMENT_CONFIG_PATH = path.resolve(__dirname, '../../environment.json');

export default function(callback: Callback): void {
  console.log('Configuring LUIS AC..');

  async.waterfall([
    // read file
    async.apply(fs.readFile, LUIS_APP_PATH, 'utf8'),

    // parse json
    async.asyncify(JSON.parse),

    // try to import (ok if app exists)
    (app: any, next: LuisManagementCallback) => {
      console.log('[configuration:luis] importing');
      LUIS_MANAGER.tryImportApp(app, next);
    },

    // train
    (resp: ManagementResponse, next: Callback) => {
      console.log('[configuration:luis] training');
      train(LUIS_MANAGER, resp.body, LUIS_MANAGER_SETTINGS.appVersion, next)
    },

    // publish
    (appId: string, next: Callback) => {
      console.log('[configuration:luis] publishing');
      publish(LUIS_MANAGER, appId, LUIS_MANAGER_SETTINGS.appVersion, next);
    },

    // configure self
    (appId: string, next: Callback) => {
      console.log('[configuration:luis] completing');
      configureEnvironment(appId, next);
    },

  ], callback);
}

function publish(client: LuisTrainingClient, appId: string, versionId: string, callback: Callback): void {
  async.waterfall([
    (next: LuisManagementCallback) => client.updateSettings(appId, { public: true }, next),
    (resp: ManagementResponse, next: LuisManagementCallback) => client.publishApp(appId, { versionId, isStaging: false }, next),
    (resp: ManagementResponse, next: Callback) => next(null, appId),
  ], callback);
}

function train(client: LuisTrainingClient, appId: string, appVersion: string, callback: Callback): void {
  async.waterfall([
    (next: LuisManagementCallback) => client.trainApp(appId, appVersion, next),
    (resp: ManagementResponse, next: Callback) => client.waitForTraining(appId, appVersion, next),
    (next: Callback) => next(null, appId),
  ], callback);
}

function configureEnvironment(appId: string, callback: Callback): void {
  async.waterfall([
    async.apply(tryReadFile, ENVIRONMENT_CONFIG_PATH, 'utf8', '{}'),
    async.asyncify(JSON.parse),
    (env: any, next: Callback) => {
      env.LUIS_APP_ID = appId;
      LUIS.setAppId(appId);
      fs.writeFile(ENVIRONMENT_CONFIG_PATH, JSON.stringify(env, null, 2), next);
    },
  ], callback);
}

function tryReadFile(filename: string, encoding: string, contentIfNotExists: string, callback: Callback): void {
  fs.readFile(filename, encoding, (err: Error, content: string) => {
    callback(null, content || contentIfNotExists);
  });
}

// import path = require('path');
// import async = require('async');
// import fs = require('fs');
// import _ = require('lodash');
// import { ManagementResponse } from 'cognitive-luis-client';
// import { Callback } from '.';
// import { LUIS, LUIS_MANAGER } from '../services';
// import { LUIS_MANAGER_SETTINGS } from '../settings';

// const ERROR_APP_EXISTS = 'An application with the same name already exists';
// const ERROR_KEY_EXISTS = 'A subscription with the same key already exists for the user';

// export default function(callback: Callback) {
//   const appPath = path.resolve(__dirname, '../../data/luis/AdventureWorks.json');
//   async.waterfall([
//     async.apply(fs.readFile, appPath, 'utf8'),
//     async.asyncify(JSON.parse),
//     (app: any, next: Callback) => LUIS_MANAGER.importApp(app, null, continueOnAppExists(next)),
//     (resp: ManagementResponse, next: Callback) => train(resp.body, next),
//     (appId: string, next: Callback) => publish(appId, next),
//   ], callback);
// }

// function train(appId: string, callback: Callback): void {
//   async.waterfall([
//     (next: Callback) => LUIS_MANAGER.trainApp(appId, LUIS_MANAGER_SETTINGS.appVersion, next),
//     (resp: ManagementResponse, next: Callback) => waitForTraining(appId, next),
//     (next: Callback) => next(null, appId),
//   ], callback);
// }

// function waitForTraining(appId: string, callback: Callback): void {
//   async.doDuring(
//     (next: Callback) => LUIS_MANAGER.trainingStatus(appId, LUIS_MANAGER_SETTINGS.appVersion, next),
//     (...args: any[]) => { // typedef for async lacks correct argument definition
//       const resp: ManagementResponse = args[0];
//       const next: Callback = args[1];
//       const pending = resp.body.some((x: any) => x.details.status === 'InProgress'); // TODO check for errors
//       if (pending) {
//         setTimeout(() => next(null, true), 2500);
//       } else {
//         setImmediate(next, null, false);
//       }
//     },
//     callback);
// }

// function publish(appId: string, callback: Callback): void {
//   const envPath = path.resolve(__dirname, '../../environment.json');
//   async.waterfall([
//     (next: any) => {
//       LUIS_MANAGER.addSubscriptionKey("ciqs", LUIS_MANAGER_SETTINGS.endPointKey, continueOnKeyExists(next));
//     },
//     (resp: any, next: any) => {
//       LUIS_MANAGER.assignAppKey(appId, LUIS_MANAGER_SETTINGS.appVersion, LUIS_MANAGER_SETTINGS.endPointKey, next);
//     },
//     (resp: any, next: any) => {
//       LUIS_MANAGER.publishApp(appId, { versionId: LUIS_MANAGER_SETTINGS.appVersion, isStaging: false }, next);
//     },
//     (resp: any, next: any) => {
//       fs.readFile(envPath, 'utf8', continueOnFileNotExists(next));
//     },
//     async.asyncify(JSON.parse),
//     (data: any, next: any) => {
//       data.LUIS_APP_ID = appId;
//       LUIS.setAppId(appId);
//       fs.writeFile(envPath, JSON.stringify(data, null, 2), next);
//     },
//   ], callback);
// }

// function findAppId(callback: Callback) {
//   async.waterfall([
//     (next: any) => LUIS_MANAGER.listUserApps(null, next),
//     (resp: ManagementResponse, next: any) => {
//       const app = resp.body.find((x: any) => x.name === LUIS_MANAGER_SETTINGS.appName);
//       if (app) {
//         next(null, {body: app.id});
//       } else {
//         next(new Error(`Cannot find LUIS app with name ${LUIS_MANAGER_SETTINGS.appName}`), null);
//       }
//     },
//   ], callback);
// }

// function continueOnFileNotExists(callback: Callback): Callback {
//   return (err: Error, data: string) => {
//     callback(null, data || '{}');
//   };
// }

// function continueOnAppExists(callback: Callback): Callback {
//   return (err: Error, resp: ManagementResponse) => {
//     if (err && _.get(resp, 'body.error.message') === ERROR_APP_EXISTS) {
//       findAppId(callback);
//     } else {
//       callback(err, resp);
//     }
//   };
// }

// function continueOnKeyExists(callback: Callback): Callback {
//   return (err: Error, resp: ManagementResponse) => {
//     if (err && _.get(resp, 'body.error.message') === ERROR_KEY_EXISTS) {
//       callback(null, {body: LUIS_MANAGER_SETTINGS.endPointKey});
//     } else {
//       callback(err, resp);
//     }
//   };
// }
