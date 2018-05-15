import async = require('async');
import fs = require('fs');
import path = require('path');
import { Connection, Request } from 'tedious';
import { SqlClient } from '../mssql';
import { SQL } from '../services';
import { Callback } from './';

const rootDir = '../../data/sql';

export default function(callback: Callback): void {
  processScripts(callback);
}

function processScripts(callback: Callback) {
  console.log('[configuration:sql] executing scripts');
  async.series([
    (next: Callback) => executeScript(SQL, 'functions/ufnGetCategory.sql', next),
    (next: Callback) => executeScript(SQL, 'functions/ufnGetColorsJson.sql', next),
    (next: Callback) => executeScript(SQL, 'functions/ufnGetDescription.sql', next),
    (next: Callback) => executeScript(SQL, 'functions/ufnGetProductAttributes.sql', next),
    (next: Callback) => executeScript(SQL, 'functions/ufnGetSizesJson.sql', next),
    (next: Callback) => executeScript(SQL, 'functions/ufnIsDeleted.sql', next),
    (next: Callback) => executeScript(SQL, 'views/vProductsForSearch.sql', next),
    (next: Callback) => executeScript(SQL, 'tables/ProductsForSearch.sql', next),
    (next: Callback) => closeSQL(next),
  ], callback);
}

function closeSQL(callback: Callback): void {
  console.log('[configuration:sql] closing connection');
  SQL.close();
  callback(null);
}

function resolve(filePath: string): string {
  return path.resolve(__dirname, rootDir, filePath);
}

function executeScript(sql: SqlClient, scriptPath: string, callback: Callback): void {
  async.waterfall([
    (next: Callback) => sql.ready(next),
    (connection: Connection, next: Callback) => async.waterfall([
      async.apply(fs.readFile, resolve(scriptPath), 'utf8'),
      (script: string, next: Callback) => {
        connection.execSql(new Request(script, continueOnExists(next)));
      },
    ], next),
  ], callback);
}

function continueOnExists(callback: Callback) {
  return (err: Error) => {
    if (!err || err.message.startsWith('There is already an object named')) {
      callback(null);
    } else {
      callback(err);
    }
  };
}
