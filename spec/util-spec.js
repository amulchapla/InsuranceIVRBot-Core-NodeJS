// const nock = require('nock');

// xdescribe('BotUtil', () => {
//   let util;

//   beforeAll(() => {
//     util = require('../dist/lib/bot-util').util;
//   });

//   describe('properties', () => {
//     it('should have LuisClient', () => {
//       expect(util.luis).toBeDefined();
//     });

//     it('should have SpeechClient', () => {
//       expect(util.speech).toBeDefined();
//     });

//     it('should have SearchClient', () => {
//       expect(util.search).toBeDefined();
//     });
//   });

//   describe('document-to-entity matching', () => {
//     let mapping;
//     let document;
//     let entities;
//     beforeEach(() => {
//       mapping = [{entity:'Categories', field:'category'}, {entity:'Colors', field:'colors'}, {entity:'Size', field:'size'}];
//     });

//     describe('when document matches all entities', () => {
//       beforeEach(() => {
//         document = {category:['foo'], colors:['red'], size:'L'};
//         entities = [{type:'Categories', resolution:{foo:'foo'}}, {type:'Colors', resolution:{red:'red'}}, {type:'Size', resolution:{L:'L'}}];
//       });

//       it('should indicate document-entity match', () => {
//         expect(util.hasAllEntities(document, entities, mapping)).toBe(true);
//       });

//       describe('and an unmapped entity is present', () => {
//         beforeEach(() => {
//           entities = [{type:'Categories', resolution:{foo:'foo'}}, {type:'Colors', resolution:{red:'red'}}, {type:'Size', resolution:{L:'L'}}, {type:'Unmapped', resolution:{junk:'junk'}}];
//         });

//         it('should ignore unmapped entity', () => {
//           expect(util.hasAllEntities(document, entities, mapping)).toBe(true);
//         });
//       });
//     });

//     describe('when document does not match all entities', () => {
//       beforeEach(() => {
//         document = {category:['foo'], colors:['red']};
//         entities = [{type:'Categories', resolution:{foo:'foo'}}, {type:'Colors', resolution:{red:'red'}}, {type:'Size', resolution:{L:'L'}}];
//       });

//       it('should indicate no document-entity match', () => {
//         expect(util.hasAllEntities(document, entities, mapping)).toBe(false);
//       });
//     });

//     describe('with 0 entities', () => {
//       beforeEach(() => {
//         document = {category:['foo'], colors:['red']};
//         entities = [];
//       });

//       it('should indicate document-entity match', () => {
//         expect(util.hasAllEntities(document, entities, mapping)).toBe(true);
//       });
//     });

//   });

//   describe('scope-search string generation', () => {
//     let mapping;
//     let entities;
//     beforeEach(() => {
//       mapping = [{entity:'Categories', field:'category'}, {entity:'Colors', field:'colors'}, {entity:'Size', field:'size', weight:2}];
//     });

//     describe('with 0 entities', () => {
//       beforeEach(() => {
//         entities = [];
//       });

//       it('should produce valid search scopes', () => {
//         expect(util.getEntityScopes(entities, mapping)).toBe('');
//       });
//     });

//     describe('with 1 entity', () => {
//       beforeEach(() => {
//         entities = [{type:'Categories', resolution:{foo:'foo'}}];
//       });

//       it('should produce valid search scopes', () => {
//         expect(util.getEntityScopes(entities, mapping)).toBe("category:'foo'");
//       });

//       describe('and a weight', () => {
//         beforeEach(() => {
//           entities = [{type:'Size', resolution:{L:'L'}}];
//         });

//         it('should produce valid search scopes', () => {
//           expect(util.getEntityScopes(entities, mapping)).toBe("size:'L'^2");
//         });
//       });

//       describe('and an unmapped entity is present', () => {
//         beforeEach(() => {
//           entities = [{type:'Categories', resolution:{foo:'foo'}}, {type:'Unmapped', resolution:{junk:'junk'}}];
//         });

//         it('should ignore unmapped entity', () => {
//           expect(util.getEntityScopes(entities, mapping)).toBe("category:'foo'");
//         });
//       });
//     });

//     describe('with 2 entities', () => {
//       beforeEach(() => {
//         entities = [{type:'Categories', resolution:{foo:'foo'}}, {type:'Colors', resolution:{red:'red'}}];
//       });

//       it('should produce valid search scopes', () => {
//         expect(util.getEntityScopes(entities, mapping)).toBe("category:'foo' colors:'red'");
//       });
//     });
//   });

//   describe('speech & language recognition', () => {
//     describe('with successful recognition', () => {
//       beforeEach(() => {
//         nock('https://api.cognitive.microsoft.com')
//           .post('/sts/v1.0/issueToken')
//           .reply(200, 'a-mock-token');
//         nock('https://speech.platform.bing.com')
//           .post('/recognize')
//           .query(true)
//           .reply(200, {header:{status:'success', name:'mock 1', lexical:'mock one'}});
//         nock('https://westus.api.cognitive.microsoft.com')
//           .get('/luis/v2.0/apps/00000000-0000-0000-0000-000000000000')
//           .query(true)
//           .reply(200, {query:'', topScoringIntent:{}, intents:[], entities:[]});
//       });

//       it('should define speech and luis results', (done) => {
//         util.recognizeIntent(new Buffer(10), (err, result) => {
//           if (err) throw err;
//           expect(err).toBeNull();
//           expect(result).toBeDefined();
//           expect(result.speech).toBeDefined();
//           expect(result.luis).toBeDefined();
//           done();
//         });
//       });
//     });

//     describe('with speech error', () => {
//       beforeEach(() => {
//         nock('https://api.cognitive.microsoft.com')
//           .post('/sts/v1.0/issueToken')
//           .reply(200, 'a-mock-token');
//         nock('https://speech.platform.bing.com')
//           .post('/recognize')
//           .query(true)
//           .reply(404);
//         nock('https://westus.api.cognitive.microsoft.com')
//           .get('/luis/v2.0/apps/00000000-0000-0000-0000-000000000000')
//           .query(true)
//           .optionally()
//           .reply(200, {query:'', topScoringIntent:{}, intents:[], entities:[]});
//       });

//       it('should define error', (done) => {
//         util.recognizeIntent(new Buffer(10), (err, result) => {
//           expect(err).toBeDefined();
//           expect(err.message).toBe('Speech recognizer returned HTTP 404');
//           expect(result).toBeUndefined();
//           done();
//         });
//       });
//     });
//   });

//   describe('validation', () => {
//     describe('of speech', () => {
//       describe('with null result', () => {
//         it('should indicate invalid', () => {
//           expect(util.validSpeech(null)).toBe(false);
//         })
//       });
//       describe('with successful result', () => {
//         it('should indicate valid', () => {
//           expect(util.validSpeech({header:{status:'success'}})).toBe(true);
//         })
//       });
//       describe('with error result', () => {
//         it('should be invalid', () => {
//           expect(util.validSpeech({header:{status:'failure'}})).toBe(false);
//         })
//       });
//     });

//     describe('of IRecording', () => {
//       describe('with null result', () => {
//         it('should indicate invalid', () => {
//           expect(util.validRecording(null)).toBe(false);
//         });
//       });
//       describe('with buffer', () => {
//         it('should indicate valid', () => {
//           expect(util.validRecording({recordedAudio:new Buffer(1)})).toBe(true);
//         });
//       });
//       describe('with null buffer', () => {
//         it('should indicate invalid', () => {
//           expect(util.validRecording({recordedAudio:null})).toBe(false);
//         });
//       });
//       describe('with empty buffer', () => {
//         it('should indicate invalid', () => {
//           expect(util.validRecording({recordedAudio:new Buffer(0)})).toBe(false);
//         });
//       });
//     });
//   });

//   describe('prompt', () => {
//     describe('with 1 segment', () => {
//       it('should write a valid prompt', () => {
//         expect(util.prompt('test')).toBe('test');
//       });
//     });
//     describe('with 2 segments', () => {
//       it('should write a valid prompt', () => {
//         expect(util.prompt('test', 'abc')).toBe('test abc');
//       });
//     });
//     describe('with null segment', () => {
//       it('should write a valid prompt', () => {
//         expect(util.prompt('test', null, 'abc')).toBe('test abc');
//       });
//     });
//     describe('with nested segment', () => {
//       it('should write a valid prompt', () => {
//         expect(util.prompt('test', ['foo', null, 'bar'], 'abc')).toBe('test foo bar abc');
//       });
//     });
//     describe('with numeric segment', () => {
//       it('should write a valid prompt', () => {
//         expect(util.prompt('test', 123, 'abc')).toBe('test 123 abc');
//       });
//     });

//     describe('choices', () => {
//       describe('without DTMF', () => {
//         it('should produce a valid prompt', () => {
//           expect(util.promptChoices(['a', 'b', 'c'], false)).toEqual({
//             prompt: 'For a, say 1. For b, say 2. For c, say 3.',
//             values: [
//               {name:'a', speechVariation:['a', '1'], dtmfVariation:'1'},
//               {name:'b', speechVariation:['b', '2'], dtmfVariation:'2'},
//               {name:'c', speechVariation:['c', '3'], dtmfVariation:'3'}
//             ]
//           });
//         });
//       });

//       describe('with DTMF', () => {
//         it('should produce a valid prompt', () => {
//           expect(util.promptChoices(['a', 'b', 'c'], true)).toEqual({
//             prompt: 'For a, press or say 1. For b, say 2. For c, say 3.',
//             values: [
//               {name:'a', speechVariation:['a', '1'], dtmfVariation:'1'},
//               {name:'b', speechVariation:['b', '2'], dtmfVariation:'2'},
//               {name:'c', speechVariation:['c', '3'], dtmfVariation:'3'}
//             ]
//           });
//         })
//       });
//     });
//   });

//   // TODO possible to test util.retry?
// });