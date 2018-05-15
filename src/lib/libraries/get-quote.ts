import {
  CallSession, IBotStorage, ICallConnector,
  IConfirmPromptOptions, IDialogResult, IPromptChoiceResult,
  IPromptConfirmResult, IPromptDigitsResult, Library,
  Prompts, ResumeReason, UniversalCallBot } from 'botbuilder-calling';
import { IUnderstandRecording, LuisDialog, SpeechDialog } from 'botbuilder-calling-speech';
import { SQL, DOCUMENTS } from '../services';
import { SEARCH_SETTINGS } from '../settings';
import {
  ORDER_DETAILS_SQL, ORDER_INFO_SQL, ORDER_STATUS,
  ORDER_STATUS_TEXT, ORDER_STATUS_VERB } from './lookup-order.const';
import _ = require('lodash');
import { ColumnValue, Request, TYPES } from 'tedious';
import { SpeechResult } from 'cognitive-speech-client';

const GET_QUOTE_NAME = 'GetQuote';
const GET_QUOTE_ROOT = '/';
export const GET_QUOTE_DIALOG = `${GET_QUOTE_NAME}:${GET_QUOTE_ROOT}`;
export const GET_QUOTE_LIB = new Library(GET_QUOTE_NAME);

const CUSTOMER_IDS = [29531, 29584, 29612, 29644, 29741, 29781, 29847, 30025, 30072, 30089];



function onError(session: CallSession, err: Error): void {
  session.error(err);
  session.endDialog('Sorry, there was a problem with our system.');
}

/**
 * DIALOG
 * get a new quote
 */
GET_QUOTE_LIB.dialog(GET_QUOTE_ROOT, new LuisDialog([
  (session, args: IUnderstandRecording, next) => {
    console.log('New Quote Information - Debug ON');
    SpeechDialog.recognizeSpeech(session, 'OK! I will help you with a new insurance quote. What is your 5 digit zip code?');    
  },
  //(session, args: IPromptDigitsResult, next) => {
  (session, args, next) => {
    if (args.error) {
      return onError(session, args.error);
    }
    //console.log('Zipcode provided', args.response.speech);
    var myzip = args.response.speech.header.name;
    //session.privateConversationData['ZipCode'] = myzip;
    session.conversationData['ZipCode'] = myzip;
    //session.userData.name = "UserData" + Date;
    session.userData['ZipCode'] = myzip;
    console.log('Zipcode response:', myzip);
    SpeechDialog.recognizeSpeech(session, 'Are you currently insured?');      
  },

  (session, args, next) => {
    if (args.error) {
      return onError(session, args.error);
    }
    var myinsured = args.response.speech.header.name;
    //session.privateConversationData['CurrentlyInsured'] = myinsured;
    session.conversationData['CurrentlyInsured'] = myinsured;
    session.userData['CurrentlyInsured'] = myinsured;
    console.log('Currently Insured or not response:', myinsured);
    SpeechDialog.recognizeSpeech(session, 'What is the make and model of your car?');          
  },
  (session, args, next) => {
    if (args.error) {
      return onError(session, args.error);
    }
    var mymakemodel = args.response.speech.header.name;
    console.log('Car Make & Model response:', mymakemodel);
    session.conversationData['MakeModel'] = mymakemodel;
    session.userData['MakeModel'] = mymakemodel;
    SpeechDialog.recognizeSpeech(session, 'What is the address where vehicle is garaged?');          
  },
  (session, args, next) => {
    if (args.error) {
      return onError(session, args.error);
    }
    var myaddress = args.response.speech.header.name;
    console.log('Vehicle Garage Address response:', myaddress);
    session.conversationData['Address'] = myaddress;
    session.userData['Address'] = myaddress;
    SpeechDialog.recognizeSpeech(session, 'What is the Garaging City?');        
  },
  (session, args, next) => {
    if (args.error) {
      return onError(session, args.error);
    }
    var mycity = args.response.speech.header.name;
    console.log('Vehicle Garaging City response:', mycity);
    session.conversationData['City'] = mycity;
    session.userData['City'] = mycity;
    SpeechDialog.recognizeSpeech(session, 'Is the Vehicle Paid For, Financed or Leased?');         
  },
  (session, args, next) => {
    if (args.error) {
      return onError(session, args.error);
    }
    var myownerinfo = args.response.speech.header.name;
    console.log('Vehicle Ownership response:', myownerinfo);
    session.conversationData['OwnershipInfo'] = myownerinfo;
    session.userData['OwnershipInfo'] = myownerinfo;
    SpeechDialog.recognizeSpeech(session, 'What is your phone number?');         
  },
  (session, args, next) => {
    if (args.error) {
      return onError(session, args.error);
    }
    var myphone = args.response.speech.header.name;
    session.conversationData['PhoneNo'] = myphone;
    session.userData['PhoneNo'] = myphone;
    session.userData['date'] = Date.now();
    console.log('Phone Number response:', myphone);
    session.endDialog('Thank you! I will transfer you to an agent to purchase this quote. Please stay on the line!');    
  },
]).triggerAction({
  match: 'intent.get.quote',
  // threshold: 0.8,
}));

