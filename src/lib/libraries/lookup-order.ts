import {
  CallSession, IBotStorage, ICallConnector,
  IConfirmPromptOptions, IDialogResult, IPromptChoiceResult,
  IPromptConfirmResult, IPromptDigitsResult, Library,
  Prompts, ResumeReason, UniversalCallBot } from 'botbuilder-calling';
import { IUnderstandRecording, LuisDialog, SpeechDialog } from 'botbuilder-calling-speech';
import { SQL } from '../services';
import { SEARCH_SETTINGS } from '../settings';
import {
  ORDER_DETAILS_SQL, ORDER_INFO_SQL, ORDER_STATUS,
  ORDER_STATUS_TEXT, ORDER_STATUS_VERB } from './lookup-order.const';
import _ = require('lodash');
import { ColumnValue, Request, TYPES } from 'tedious';

const LOOKUP_ORDER_NAME = 'LookupOrder';
const LOOKUP_ORDER_ROOT = '/';
export const LOOKUP_ORDER_DIALOG = `${LOOKUP_ORDER_NAME}:${LOOKUP_ORDER_ROOT}`;
export const LOOKUP_ORDER_LIB = new Library(LOOKUP_ORDER_NAME);

const CUSTOMER_IDS = [29531, 29584, 29612, 29644, 29741, 29781, 29847, 30025, 30072, 30089];

interface SQLRow {
  [name: string]: ColumnValue;
}

function onError(session: CallSession, err: Error): void {
  session.error(err);
  session.endDialog('Sorry, there was a problem finding that information.');
}

/**
 * DIALOG
 * lookup order status
 */
LOOKUP_ORDER_LIB.dialog(LOOKUP_ORDER_ROOT, new LuisDialog([
  (session, args: IUnderstandRecording, next) => {
    const prompt = 'Ok, Please speak your customer ID. For this demo, you may speak any four digit number';
    // Prompts.digits(session, prompt, 4);
    Prompts.record(session, prompt);
  },
  (session, args: IPromptDigitsResult, next) => {
    if (args.error) {
      return onError(session, args.error);
    }
    SQL.ready((err, conn) => {
      if (err) {
        return onError(session, err);
      }

      const id = CUSTOMER_IDS[_.random(CUSTOMER_IDS.length - 1)];
      const req = new Request(ORDER_INFO_SQL, (err, count, rows: SQLRow[]) => {
        if (err) {
          return onError(session, err);
        } else if (count >= 1) {
          const row = rows[0];
          const statusText = ORDER_STATUS_TEXT[row.Status.value];
          const statusVerb = ORDER_STATUS_VERB[row.Status.value];
          const shipText = getShippingText(row.Status.value, row);
          const amountDue = Math.ceil(row.TotalDue.value);
          const prompt = `Welcome back, ${row.Title.value} ${row.LastName.value}.
            Your order, number ${row.SalesOrderId.value}, ${statusVerb} ${statusText} ${shipText}.
            The balance on your order is ${amountDue} dollars.
            Would you like to hear the inventory for this order?`;
          session.dialogData.orderId = row.SalesOrderId.value;
          Prompts.confirm(session, prompt);
        } else {
          session.endDialog('Sorry, I did not find any orders for you');
        }
      });
      req.addParameter('CustomerId', TYPES.Int, id);
      conn.execSql(req);
    });
  },
  (session, args: IPromptConfirmResult, next) => {
    if (args.error) {
      return onError(session, args.error);
    }

    if (args.response) {
      SQL.ready((err, conn) => {
        if (err) {
          return onError(session, err);
        }
        const req = new Request(ORDER_DETAILS_SQL, (err, count, rows: SQLRow[]) => {
          if (err) {
            return onError(session, err);
          } else if (count === 0) {
            return session.endDialog('Sorry, I could not find your order.');
          } else {
            const itemsText = rows.map((row) => {
              const amount = Math.ceil(row.LineTotal.value);
              return `${row.OrderQty.value} of ${row.Name.value} in size ${row.Size.value} and color ${row.Color.value}: ${amount} dollars.`;
            }).join(' ');
            session.endDialog(`Order number ${session.dialogData.orderId} contains ${count} line items: ${itemsText}. Thanks again for your order.`);
          }
        });
        req.addParameter('OrderId', TYPES.Int, session.dialogData.orderId);
        conn.execSql(req);
      });
    } else {
      session.endDialog();
    }
  },
]).triggerAction({
  match: 'intent.order.status',
  // threshold: 0.8,
}));

function getShippingText(status: ORDER_STATUS, row: SQLRow): string {
  switch (status) {
    case ORDER_STATUS.Approved:
    case ORDER_STATUS.BackOrdered:
    case ORDER_STATUS.InProcess:
      return `and we will ship to ${row.CompanyName.value} in ${row.City.value}, ${row.StateProvince.value}.`;

    case ORDER_STATUS.Shipped:
      return `to ${row.CompanyName.value} in ${row.City.value}, ${row.StateProvince.value}.`;

    default:
      return '';
  }
}
