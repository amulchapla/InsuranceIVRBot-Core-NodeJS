import { IConnector, MemoryBotStorage, UniversalBot } from 'botbuilder';

export default function(connector: IConnector): UniversalBot {
  const bot = new UniversalBot(connector);
  bot.set('storage', new MemoryBotStorage());
  bot.dialog('/', (session) => {
    session.endConversation('Hello! This bot only responds to voice calls. For more information, please see https://github.com/Azure/cortana-intelligence-call-center-solution');
  });
  return bot;
}
