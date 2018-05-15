process.env.CALLBACK_URL = 'http://localhost/mock/api/calls';
process.env.MICROSOFT_APP_ID = '00000000-0000-0000-0000-000000000000';
process.env.MICROSOFT_APP_PASSWORD = 'mock-app-pass';
process.env.port = 0;
process.env.LUIS_REGION = 'westus';
process.env.LUIS_APP_ID = '00000000-0000-0000-0000-000000000000';
process.env.LUIS_KEY = 'mock-luis-key';
process.env.LUIS_MANAGER_KEY = 'mock-key';
process.env.SPEECH_KEY = 'mock-speech-key';
process.env.SPEECH_ENDPOINT = 'https://speech.platform.bing.com/recognize';
process.env.SPEECH_REGION = '';
process.env.SEARCH_SERVICE = 'mock-search-service';
process.env.SEARCH_KEY = 'mock-search-key';
process.env.NO_LOCAL_ENV = 'true';
process.env.LOG_BLOB_CONTAINER = 'mock';
process.env.LOG_DDB_COLLECTION = 'mock';
process.env.LOG_DDB_DATABASE = 'mock';
process.env.BLOB_ACCOUNT = 'mock';
process.env.BLOB_KEY = 'mock';
process.env.DDB_KEY = 'mock';
process.env.DDB_URL = 'mock';
process.env.STORE_DDB_COLLECTION = 'mock';
process.env.STORE_DDB_DATABASE = 'mock';
process.env.SQL_DATABASE = 'mock';
process.env.SQL_PASSWORD = 'mock';
process.env.SQL_HOST = 'mock';
process.env.SQL_USER = 'mock';

const nock = require('nock');
const speech = require('../../dist/lib/services').SPEECH;

beforeEach(() => {
  speech.auth.token = null;
});

beforeAll(() => {
  nock.disableNetConnect();
});

afterAll(() => {
  nock.enableNetConnect();
});

afterEach(() => {
  expect(nock.isDone()).toBe(true);
  nock.cleanAll();
});