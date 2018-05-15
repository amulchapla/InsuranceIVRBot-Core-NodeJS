import { IChatConnectorSettings } from 'botbuilder';
import { ICallConnectorSettings, IUniversalCallBotSettings } from 'botbuilder-calling';
import fs = require('fs');
import https = require('https');
import _ = require('lodash');
import path = require('path');

// tslint:disable:no-string-literal
https.globalAgent['keepAlive'] = true;
https.globalAgent['options'].keepAlive = true;
// tslint:enable:no-string-literal

export interface SearchEntityMapping {
  entity: string;
  field: string;
  sku?: string;
  weight?: number;
}

export const PORT: string = config('port');

export const CALL_SETTINGS: ICallConnectorSettings = {
  appId: config('MICROSOFT_APP_ID'),
  appPassword: config('MICROSOFT_APP_PASSWORD'),
  callbackUrl: config('CALLBACK_URL'),
} as any;

export const CHAT_SETTINGS: IChatConnectorSettings = {
  appId: config('MICROSOFT_APP_ID'),
  appPassword: config('MICROSOFT_APP_PASSWORD'),
};

// tslint:disable-next-line:no-var-requires
export const BOT_SETTINGS: IUniversalCallBotSettings = require('../bot-settings.json');

export const LUIS_SETTINGS = {
  appId: config('LUIS_APP_ID'),
  key: config('LUIS_KEY'),
  region: config('LUIS_REGION'),
};

export const LUIS_MANAGER_SETTINGS = {
  appName: 'AdventureWorks',
  appVersion: '0.1',
  endPointKey: config('LUIS_KEY'),
  key: config('LUIS_MANAGER_KEY'),
};

export const SPEECH_SETTINGS = {
  endpoint: config('SPEECH_ENDPOINT'),
  key: config('SPEECH_KEY'),
  region: config('SPEECH_REGION'),
};

const SEARCH_ENTITY_MAPPING: SearchEntityMapping[] = [
  { entity: 'Categories', field: 'category' },
  { entity: 'Colors', field: 'colors', sku: 'color' },
  { entity: 'Sizes', field: 'sizes', sku: 'size' },
  { entity: 'Sex', field: 'sex' },
];
export const SEARCH_SETTINGS = {
  entities: SEARCH_ENTITY_MAPPING,
  index: 'adventureworks',
  key: config('SEARCH_KEY'),
  service: config('SEARCH_SERVICE'),
  version: '2016-09-01-Preview',
};

export const LOG_SETTINGS = {
  blobs: {
    container: config('LOG_BLOB_CONTAINER'),
  },
  documents: {
    collectionName: config('LOG_DDB_COLLECTION'),
    collectionThroughput: 5000,
    databaseName: config('LOG_DDB_DATABASE'),
    level: 'verbose',
  },
};

export const BLOB_SETTINGS = {
  account: config('BLOB_ACCOUNT'),
  key: config('BLOB_KEY'),
};

export const DDB_SETTINGS = {
  key: config('DDB_KEY'),
  url: config('DDB_URL'),
};

export const STORAGE_SETTINGS = {
  documentdb: {
    collectionName: config('STORE_DDB_COLLECTION'),
    collectionThroughput: 5000,
    databaseName: config('STORE_DDB_DATABASE'),
    defaultTtl: 86400,
  },
};

export const SQL_SETTINGS = {
  options: {
    database: config('SQL_DATABASE'),
    encrypt: true,
    rowCollectionOnRequestCompletion: true,
    useColumnNames: true,
  },
  password: config('SQL_PASSWORD'),
  server: config('SQL_HOST'),
  userName: config('SQL_USER'),
};

function config(name: string): string {
  const locals = readLocalsSync(path.resolve(__dirname, '../environment.json')); // TODO cache this
  if (_.has(locals, name)) {
    return locals[name];
  } else if (_.has(process.env, name)) {
    return process.env[name];
  } else {
    throw new Error(`Cannot find environment variable '${name}'`);
  }
}

function readLocalsSync(path: string): {[key: string]: any} {
  if (fileExistsSync(path) && process.env.NO_LOCAL_ENV !== 'true') {
    // console.log('reading local env')
    return JSON.parse(fs.readFileSync(path, 'utf8'));
  } else {
    return {};
  }
}

function fileExistsSync(path: string): boolean {
  try {
    fs.statSync(path);
    return true;
  } catch (err) {
    return false;
  }
}
