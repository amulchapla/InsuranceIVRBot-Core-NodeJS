import async = require('async');
import { SearchResponse, SearchResult } from 'azure-search-client';
import fs = require('fs');
import path = require('path');
import { Callback } from '.';
import { SEARCH } from '../services';
import { SEARCH_SETTINGS, SQL_SETTINGS } from '../settings';

const rootDir = '../../data/search';

export default function(callback: Callback) {
  const connectionString = formatConnectionString(SQL_SETTINGS.server, SQL_SETTINGS.userName, SQL_SETTINGS.password, SQL_SETTINGS.options.database);
  console.log('[configuration:search] starting');

  async.series([

    // create index
    (next: Callback) => createResource('schema.json', (schema, done) => {
      console.log('[configuration:search] creating index');
      SEARCH.createIndex(schema, done);
    }, next),

    // create datasource
    (next: Callback) => createResource('datasource.json', (datasource, done) => {
      console.log('[configuration:search] creating data source');
      datasource.credentials.connectionString = connectionString;
      SEARCH.createDatasource(datasource, done);
    }, next),

    // create indexer
    (next: Callback) => createResource('indexer.json', (indexer, done) => {
      console.log('[configuration:search] creating indexer');
      SEARCH.createIndexer(indexer, done);
    }, next),

    // run the indexer
    (next: Callback) => {
      console.log('[configuration:search] running indexer');
      SEARCH.runIndexer('products', next);
    },

    // wait
    (next: Callback) => waitForResults(next),

  ], callback);
}

function waitForResults(callback: Callback): void {
  console.log('[configuration:search] waiting for indexing');
  async.doWhilst(
    (next: any) => SEARCH.search(SEARCH_SETTINGS.index, {count: true}, next),
    (...args: any[]) => { // typedef is broken
      const resp = args[0] as SearchResponse<SearchResult>;
      return resp.result['@search.count'] === 0;
    },
    callback);
}

function continueOnExists(callback: Callback): Callback {
  return (err: Error) => {
    if (!err || err.message.includes('already exists')) {
      callback(null);
    } else {
      callback(err);
    }
  };
}

function createResource(filePath: string, create: (resource: any, done: Callback) => void, callback: Callback): void {
  async.waterfall([
    async.apply(fs.readFile, resolve(filePath), 'utf8'),
    async.asyncify(JSON.parse),
    (resource: any, next: Callback) => create(resource, continueOnExists(next)),
  ], callback);
}

function resolve(filePath: string): string {
  return path.resolve(__dirname, rootDir, filePath);
}

function formatConnectionString(host: string, user: string, password: string, database: string): string {
  return `Server=tcp:${host},1433;
    Initial Catalog=${database};
    Persist Security Info=False;
    User ID=${user};
    Password=${password};
    MultipleActiveResultSets=False;
    Encrypt=True;
    TrustServerCertificate=False;
    Connection Timeout=30;`;
}
