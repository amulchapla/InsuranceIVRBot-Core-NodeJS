const MockSpeechService = require('cognitive-speech-client').MockSpeechService;
const MockLuisService = require('cognitive-luis-client').MockLuisService;
const MockSearchService = require('azure-search-client').MockSearchService;

describe('bot', () => {
  let mockCallConnector;
  let mockSpeechService;
  let mockLuisService;
  let mockSearchService;
  beforeAll(() => {
    const createBot = require('../dist/lib/create-bot').default;
    const MockCallConnector = require('botbuilder-calling-test').MockCallConnector;
    const MemoryBotStorage = require('botbuilder-calling').MemoryBotStorage;
    mockCallConnector = new MockCallConnector({rootDir:`${__dirname}/data/bot/test-1`});
    createBot(mockCallConnector, new MemoryBotStorage());
  });

  beforeEach(() => {
    mockSpeechService = new MockSpeechService('https://speech.platform.bing.com', process.env.SPEECH_REGION);
    mockLuisService = new MockLuisService(process.env.LUIS_APP_ID);
    mockSearchService = new MockSearchService(process.env.SEARCH_SERVICE);
  });

  it('should process an order', (done) => {
    // mockSpeechService
    //   .auth(200)
    //   .recognize(200, require('./data/speech/red-bicycle.json'));
    // mockLuisService
    //   .recognize(200, 'red bicycle', require('./data/luis/red-bicycle.json'));
    // mockSearchService
    //   .postQuery(200, 'adventureworks', require('./data/search/query/red-bicycle.json'), require('./data/search/result/red-bicycle.json'));
    mockCallConnector.requestFromFiles([
      '1493804885263-conversation.json',
      '1493804894124-conversationResult.json',
    ], (err, [
      event1,
      event2,
    ]) => {
      // if (err) throw err;

      // expect(event1).toHaveAction(['answer', 'record']);
      // expect(event1).toHavePrompt('Hi, Please say a product name.');

      // expect(event2).toHaveAction('recognize');
      // expect(event2).toHavePrompt('I found 3 matches. For Road-250, press or say 1. For Road-550-W, say 2. For Mountain-400-W, say 3.');
      // expect(event2).toHaveChoices([
      //   {name:'Road-250', variants:['Road-250', '1'], dtmf:'1'},
      //   {name:'Road-550-W', variants:['Road-550-W', '2'], dtmf:'2'},
      //   {name:'Mountain-400-W', variants:['Mountain-400-W', '3'], dtmf:'3'},
      // ]);

      console.log('event1', JSON.stringify(event1));
      console.log('event2', JSON.stringify(event2));

      done();
    });
  });
});