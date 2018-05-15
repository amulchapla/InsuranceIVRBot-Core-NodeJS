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

const ORDER_PRODUCT_NAME = 'OrderProduct';
const ORDER_PRODUCT_ROOT = '/';
export const ORDER_PRODUCT_DIALOG = `${ORDER_PRODUCT_NAME}:${ORDER_PRODUCT_ROOT}`;
export const ORDER_PRODUCT_LIB = new Library(ORDER_PRODUCT_NAME);

interface IProductResult extends IDialogResult<SearchResultDocument> { }
interface ISkuResult extends IDialogResult<SkuChoice> { }
interface SkuChoice { name: string; sku: string; }

/**
 * DIALOG
 * ordering workflow
 */
ORDER_PRODUCT_LIB.dialog(ORDER_PRODUCT_ROOT, [
  (session: CallSession, args, next) => {
    session.beginDialog('/findProduct');
  },
  (session: CallSession, args: ISkuResult, next) => {
    Prompts.confirm(session, `You are ordering ${args.response.name} ${args.response.sku}. Would you like to order another product?`);
  },
  (session: CallSession, args: IPromptConfirmResult, next) => {
    if (args.response) {
      session.beginDialog('/');
    } else {
      session.endDialog('Thanks for your order! Goodbye.');
    }
  },
]);

 /**
  * DIALOG
  * query products from speech
  */
ORDER_PRODUCT_LIB.dialog('/findProduct', [
  (session: CallSession, args: any, next) => {
    SpeechDialog.understandSpeech(session, 'Hi Thank you for calling Answer Financial Local, Please say a product name.');
  },
  (session: CallSession, args: IUnderstandResult, next) => {
    if (args.error) {
      return session.error(args.error);
    } else if (args.resumed === ResumeReason.canceled) {
      return session.replaceDialog('/findProduct');
    }

    /* next line causes session.dialogData to be lost */
    // session.send('Checking...').sendBatch();

    APP.findProduct(args.response.speech, args.response.language, (err, matches) => {
      if (err) {
        return session.error(err);
      }

      session.dialogData.luis = args.response.language;

      // no matching products
      if (matches.length === 0) {
        session.send(`Sorry, I did not find any products matching "${args.response.speech.header.name}".`);
        session.replaceDialog('/findProduct');

      // multiple products
      } else if (matches.length > 1) {
        session.beginDialog('/chooseProductName', matches);

      // found the product
      } else {
        next({response: matches[0], resumed: ResumeReason.forward});
      }
    });
  },
  (session: CallSession, args: IProductResult, next) => {
    const luis: LuisResult = session.dialogData.luis;
    session.beginDialog('/chooseProductSKU', {
      entities: rejectSubEntities(luis.entities),
      product: args.response.name,
      selected: {},
      skus: JSON.parse(args.response.products || '{}'),
    } as ProductSkuSelection);
  },
]);

/**
 * DIALOG
 * disambiguate product name
 */
ORDER_PRODUCT_LIB.dialog('/chooseProductName', [
  (session: CallSession, args: SearchResultDocument[], next) => {
    const matches: SearchResultDocument[] = session.dialogData.matches = args;
    const choices = matches.map((x) => ({name: x.name }));
    const choicesText = choices.map((x, i) => `For ${x.name}, say ${i + 1}.`).join(' ');
    const promptText = `I found ${matches.length} matches. ${choicesText}`; // TODO or, start over
    SpeechDialog.understandChoice(session, promptText, { choices });
  },

  (session: CallSession, args: IUnderstandResult, next) => {
    if (args.error) {
      return session.error(args.error);
    } else if (args.resumed === ResumeReason.canceled) {
      return session.replaceDialog('/chooseProductName', session.dialogData.matches);
    }
    const matches: SearchResultDocument[] = session.dialogData.matches;
    const product = matches.find((x) => x.name === args.response.choice.name);
    session.endDialogWithResult({response: product, resumed: ResumeReason.completed} as IProductResult);
  },
]);

/**
 * DIALOG
 * disambiguate product SKU
 */
ORDER_PRODUCT_LIB.dialog('/chooseProductSKU', [
  (session: CallSession, args: ProductSkuSelection, next) => {
    session.dialogData.args = args;
    const skus = APP.getSkuChoices(args);

    if (skus.length === 1) {
      const sku: SkuChoice = { name: args.product, sku: skus[0].productNumber };
      return session.endDialogWithResult({response: sku, resumed: ResumeReason.completed} as ISkuResult);
    }

    const attribute = APP.getNextSkuAttribute(skus);
    // const choices = promptChoices(attribute.choices, true);
    // const promptText = prompt(`What ${attribute.name}?`, choices.prompt); // TODO or, start over
    args.attribute = attribute.name;
    const choices = attribute.choices.map((x, i) => ({
      dtmfVariation: (i + 1).toString(),
      name: x,
      speechVariation: [x, (i + 1).toString()],
    }));
    const choicesText = attribute.choices.slice(0, -1).join(', ') + ` or ${attribute.choices[attribute.choices.length - 1]}`;
    const promptText = `What ${attribute.name}? ${choicesText}.`;
    // Prompts.choice(session, promptText, choices.values); // TODO prompting numbers is difficult to understand
    // SpeechDialog.understandChoice(session, promptText, { choices });
    Prompts.choice(session, promptText, choices);
  },

  (session: CallSession, choice: IPromptChoiceResult, next) => {
    if (choice.error) {
      session.error(choice.error);
    } else {
      const skuData: ProductSkuSelection = session.dialogData.args;
      skuData.selected[skuData.attribute] = choice.response.entity;
      session.beginDialog('/chooseProductSKU', skuData);
    }
  },
]);
