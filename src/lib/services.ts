import { SearchClient } from 'azure-search-client';
import { BlobService } from 'azure-storage';
import { speechLibrary } from 'botbuilder-calling-speech';
import { BotLogger } from 'botbuilder-logging';
import { DocumentDbBotStorage } from 'botbuilder-storage-documentdb';
import { LuisClient, LuisTrainingClient } from 'cognitive-luis-client';
import { SpeechAuthClient, SpeechClient } from 'cognitive-speech-client';
import { DocumentClient } from 'documentdb';
import { SqlClient } from './mssql';
import {
  BLOB_SETTINGS, DDB_SETTINGS, LOG_SETTINGS,
  LUIS_MANAGER_SETTINGS, LUIS_SETTINGS, SEARCH_SETTINGS,
  SPEECH_SETTINGS, SQL_SETTINGS, STORAGE_SETTINGS } from './settings';

export const BLOBS = new BlobService(BLOB_SETTINGS.account, BLOB_SETTINGS.key); // TODO retry options
export const DOCUMENTS = new DocumentClient(DDB_SETTINGS.url, { masterKey: DDB_SETTINGS.key }); // TODO retry options
export const LUIS = new LuisClient(LUIS_SETTINGS.appId, LUIS_SETTINGS.key, LUIS_SETTINGS.region);
export const LUIS_MANAGER = new LuisTrainingClient(LUIS_MANAGER_SETTINGS.key);
export const SEARCH = new SearchClient(SEARCH_SETTINGS.service, SEARCH_SETTINGS.key, SEARCH_SETTINGS.version);
export const SPEECH = new SpeechClient(new SpeechAuthClient(SPEECH_SETTINGS.key, SPEECH_SETTINGS.region, true), SPEECH_SETTINGS.endpoint);
export const BOT_LOGGER = new BotLogger(BLOBS, DOCUMENTS, LOG_SETTINGS).on('error', console.error);
export const BOT_STORAGE = new DocumentDbBotStorage(DOCUMENTS, STORAGE_SETTINGS.documentdb);
export const BOT_SPEECH_LIB = speechLibrary(SPEECH, LUIS);
export const SQL = new SqlClient(SQL_SETTINGS);
