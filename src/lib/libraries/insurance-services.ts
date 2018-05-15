import { SearchResultDocument } from 'azure-search-client';
import {
  CallSession, IBotStorage, ICallConnector,
  IDialogResult, IPromptChoiceResult, IPromptConfirmResult,
  Library, Prompts, ResumeReason,
  UniversalCallBot } from 'botbuilder-calling';
import { IUnderstandResult, SpeechDialog } from 'botbuilder-calling-speech';
import { LuisResult } from "cognitive-luis-client";
import { APP, ProductSkuSelection } from '../app';
import { prompt, promptChoices, rejectSubEntities } from '../util';
import { SpeechResult } from 'cognitive-speech-client';

const INSURANCE_SERVICES_NAME = 'InsuranceServices';
const INSURANCE_SERVICES_ROOT = '/';
export const INSURANCE_SERVICES_DIALOG = `${INSURANCE_SERVICES_NAME}:${INSURANCE_SERVICES_ROOT}`;
export const INSURANCE_SERVICES_LIB = new Library(INSURANCE_SERVICES_NAME);

interface IProductResult extends IDialogResult<SearchResultDocument> { }
interface ISkuResult extends IDialogResult<SkuChoice> { }
interface SkuChoice { name: string; sku: string; }

/**
 * DIALOG
 * ordering workflow
 */
INSURANCE_SERVICES_LIB.dialog(INSURANCE_SERVICES_ROOT, [
  (session: CallSession, args, next) => {
    session.beginDialog('/insuranceServices');
  },
  
  (session: CallSession, args: IPromptConfirmResult, next) => {
    if (args.response) {
        console.log('get-quotes 35 args', args);
        session.beginDialog('/');
    } else {
      session.endDialog('Thanks for your interest! Goodbye.');
    }
  },
]);

 /**
  * DIALOG
  * query products from speech
  */
INSURANCE_SERVICES_LIB.dialog('/insuranceServices', [
  (session: CallSession, args: any, next) => {
    SpeechDialog.understandSpeech(session, 'Thank you for calling Insurance Company with your Insurance needs!, How may I help you? I can help you with a new quote or claim status');
    //console.log('get quotes 48', args);    
  },
  //(session: CallSession, args: IUnderstandResult, next) => {
    (session: CallSession, args, next) => {
    if (args.error) {
      return session.error(args.error);
    } 

    //const speech: SpeechResult = args.response.speech;
    //const luis: LuisResult = args.response.language;
    //console.log('get-quotes args', args);
    //console.log('get-quotes intents', args.response.language.intents);
    //console.log('get-quotes topintents', args.response.language.topScoringIntent);
    //session.endDialog('You said speech', speech.header.name, 'with intent', luis.topScoringIntent, 'and provided entities', luis.entities.length);    
  },  
]);




