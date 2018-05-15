import async = require('async');
import { CallSession, IDialogResult, IMiddlewareMap } from 'botbuilder-calling';
import { NextFunction, Request, Response } from 'express';
import fs = require('fs');
import path = require('path');
import { clearInterval } from 'timers';
import { LUIS_MANAGER_SETTINGS } from '../settings';
import configureLuis from './luis';
import configureSearch from './search';
import configureSql from './sql';

export type Callback = (err: Error, ...args: any[]) => void;

const CONFIGURED_PATH = path.resolve(__dirname, '../../data/.configured');
const CONFIG_STATE = { configured: true, configuring: false };

/**
 * Perform remote service configuration, only if they are not already configured
 * @param callback Callback when done
 */
function configureIfNotConfigured(callback: Callback) {
  isConfigured((err, configured) => {
    if (err) {
      callback(err);
    } else if (configured) {
      callback(null);
    } else {
      configure(callback);
    }
  });
}

/**
 * Check configuration state
 * @param callback Callback when done
 */
function isConfigured(callback: (err: Error, configured: boolean) => void): void {
  if (CONFIG_STATE.configured) {
    return callback(null, true);
  } else {
    fs.readFile(CONFIGURED_PATH, (err) => {

      // not configured
      if (err && err.code === 'ENOENT') {
        callback(null, false);

      // read error!
      } else if (err) {
        callback(err, null);

      // is configured
      } else {
        CONFIG_STATE.configured = true;
        callback(null, true);
      }
    });
  }
}

export const configurationBotMiddleware: IMiddlewareMap = {
  botbuilder: (session: CallSession, next: (...args: any[]) => void): void => {

    function repeatWorkingMessage(fn?: () => void): NodeJS.Timer {
      return setInterval(() => {
        session.send('Setting up your bot.');
        if (fn) { fn(); }
      }, 1500);
    }

    function onError(err: Error) {
      console.error('Error during configuration', err);
      session.error(err);
      next();
    }

    // new requests should block until app is configured
    if (CONFIG_STATE.configuring) {
      console.log('Waiting...');
      const timer = repeatWorkingMessage(() => {
        if (CONFIG_STATE.configured) {
          clearInterval(timer);
          next();
        }
      });
      return;
    }

    // perform configuration
    isConfigured((err, configured) => {
      if (err) {
        return onError(err);
      } else if (configured) {
        return next();
      }

      const timer = repeatWorkingMessage();
      configureIfNotConfigured((err) => {
        clearInterval(timer);
        if (err) {
          return onError(err);
        } else {
          next();
        }
      });
    });
  },
};

function configureDataServices(callback: Callback): void {
  console.log('[configuration] starting data services');
  async.series([
    (next: Callback) => configureSql(next),
    (next: Callback) => configureSearch(next),
  ], callback);
}

function configureServices(callback: Callback): void {
  console.log('[configuration] starting services');
  async.parallel([
    (next: Callback) => configureDataServices(next),
    (next: Callback) => configureLuis(next),
  ], callback);
}

function completeConfiguration(callback: Callback): void {
  console.log('[configuration] completing');
  CONFIG_STATE.configured = true;
  CONFIG_STATE.configuring = false;
  fs.writeFile(CONFIGURED_PATH, new Date().toString(), callback);
}

function configure(callback: Callback) {
  console.log('[configuration] starting');
  CONFIG_STATE.configuring = true;
  async.series([
    (next: Callback) => configureServices(next),
    (next: Callback) => completeConfiguration(next),
  ], callback);
}
