import express = require('express');
import { ChatConnector } from 'botbuilder';
import { CallConnector } from 'botbuilder-calling';
import createCallBot from './lib/create-call-bot';
import createChatBot from './lib/create-chat-bot';
import createServer from './lib/create-server';
import { CALL_SETTINGS, CHAT_SETTINGS, PORT } from './lib/settings';

const app = express();
const server = createServer(app);
const callConnector = new CallConnector(CALL_SETTINGS);
const chatConnector = new ChatConnector(CHAT_SETTINGS);
createCallBot(callConnector);
createChatBot(chatConnector);

// routes
app.post('/api/calls', callConnector.listen());
app.post('/api/chat', chatConnector.listen());

// start server
server.listen(PORT, () => console.log(`Listening on ${PORT}`));
