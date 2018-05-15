import {
  CallSession, IBotStorage, ICallConnector,
  IDialogResult, IPromptChoiceResult, IPromptConfirmResult,
  Library, Prompts, ResumeReason,
  UniversalCallBot } from 'botbuilder-calling';
import { IUnderstandRecording, LuisDialog, SpeechDialog } from 'botbuilder-calling-speech';
import { SEARCH } from '../services';
import { SEARCH_SETTINGS } from '../settings';

const PRODUCT_INFO_NAME = 'ProductInfo';
const PRODUCT_INFO_ROOT = '/';
export const PRODUCT_INFO_DIALOG = `${PRODUCT_INFO_NAME}:${PRODUCT_INFO_ROOT}`;
export const PRODUCT_INFO_LIB = new Library(PRODUCT_INFO_NAME);

/**
 * DIALOG
 * lookup product info
 */
PRODUCT_INFO_LIB.dialog(PRODUCT_INFO_ROOT, new LuisDialog([
  (session, args: IUnderstandRecording, next) => {
    console.log('args', args);
    const queryText = args.language.entities.filter((x) => x.type === 'product').map((x) => x.entity)[0]
      || args.speech.header.name;
    const query = {search: queryText, searchFields: 'name', select: 'name,description_EN,minListPrice', top: 1};
    console.log('query', query);
    SEARCH.search(SEARCH_SETTINGS.index, query, (err, resp) => {
      if (err) {
        session.error(err);
        session.endDialog('Sorry, there was a problem finding your information.');
      } else if (resp.result.value.length) {
        const info = resp.result.value[0];
        const price = Math.ceil(info.minListPrice);
        session.endDialog(`Here's what I found for ${info.name}: ${info.description_EN}; Starting at ${price} dollars`);
      }
    });
  },
]).triggerAction({
  match: 'intent.product.info',
  // threshold: 0.8,
}));

/**
 * DIALOG
 * lookup product price
 */
PRODUCT_INFO_LIB.dialog('/price', new LuisDialog([
  (session, args: IUnderstandRecording, next) => {
    console.log('args', args);
    const queryText = args.language.entities.filter((x) => x.type === 'product').map((x) => x.entity)[0]
      || args.speech.header.name;
    const query = {search: queryText, searchFields: 'name', select: 'name,minListPrice,maxListPrice', top: 1};
    console.log('query', query);
    SEARCH.search(SEARCH_SETTINGS.index, query, (err, resp) => {
      if (err) {
        session.error(err);
        session.endDialog('Sorry, there was a problem finding your information.');
      } else if (resp.result.value.length) {
        const info = resp.result.value[0];
        const priceLo = Math.ceil(info.minListPrice);
        const priceHi = Math.ceil(info.maxListPrice);
        if (priceLo === priceHi) {
          session.endDialog(`The ${info.name} costs ${priceLo} dollars.`);
        } else {
          session.endDialog(`The ${info.name} ranges in price from ${priceLo} to ${priceHi} dollars.`);
        }
      }
    });
  },
]).triggerAction({
  match: 'intent.product.price',
  // threshold: 0.8,
}));
