import { Chat } from '../models/mongooseModel.js';

export const createChat = async (req, res, next) => {
  let { opponentId, username } = req.query;
  console.log(opponentId);

  if (opponentId === undefined || !username) {
    return next({
      log: 'error in MongooseController.createChat, user did not specify an opponentId or username',
      status: 400,
      message: 'server says: you have to specify an opponentId and username',
    });
  }
  console.log('creating chat session.');
  let message = await Chat.create({
    username: username,
    password: '1234',
    start_time: Date.now(),
    opponentId: opponentId,
  });
  console.log(` ok, started user sesh and got ${message}`);
  res.locals.mongoQueryResults = message;
  return next();
};

export const endChat = async (req, res, next) => {
  let { username } = req.query;

  if (!username) {
    return next({
      log: 'user error in endChat they did not specify a username',
      status: 400,
      message: `Server says: you have to specify a username`,
    });
  }
  console.log('ending user chat session');
  try {
    let message = await Chat.deleteOne({
      username: username,
      password: '1234',
    });

    if (message.deletedCount == 0) {
      return next({
        log: 'User was not in the database',
        status: 400,
        message: 'Server says: this username does not have an active session, you cant end this chat!',
      });
    }
    console.log(` ok, ended user sesh and got ${message}`);
    res.locals.mongoQueryResults = message;
    return next();
  } catch (error) {
    return next({
      log: `Error in mongooseController.endChat ${error}`,
      status: 500,
      message: 'error ending chat session, check your username and password.',
    });
  }
};

export const getChatData = async (req, res, next) => {
  const { username } = req.query;

  if (!username) {
    return next({
      log: `user error in getChatData. Did not specify a username`,
      status: 400,
      message: `Server says: you have to specify a username.`,
    });
  }

  try {
    const message = await Chat.findOne({
      username: username,
      password: '1234',
    });
    if (message === null) {
      return next({
        log: 'User was not in the database',
        status: 400,
        message: 'Server says: this username does not have an active session, call init to create one!',
      });
    }

    res.locals.currentChatState = message.conversation;
    res.locals.opponentId = message.opponentId;
    res.locals.currentUsername = username;

    return next();
  } catch (error) {
    return next({
      log: `Error in mongooseController.getChatData ${error}`,
      status: 400,
      message: 'error getting chat session data, check your username and password.',
    });
  }
};

export const saveConversationToChat = async (_req, res, next) => {
  let chatState = res.locals.currentChatState;
  let newUserMessage = res.locals.message;
  let aiMessage = res.locals.aiMessage;
  let username = res.locals.currentUsername;

  if (!chatState || !aiMessage || !newUserMessage || !username) {
    return next({
      log: 'error, in middleware, we got to saveConversationToChat and did not have currentChatState or aiMessage or currentUsername on res.locals!',
      status: 500,
      message: 'internal server error tell the devs code: 5061',
    });
  }

  console.log(aiMessage);
  let newConversation = chatState;
  newConversation.push({ role: 'user', content: newUserMessage });
  newConversation.push({ role: 'assistant', content: aiMessage.content });

  res.locals.finalChatState = newConversation;
  try {
    let message = await Chat.findOneAndUpdate({ username: username, password: '1234' }, { conversation: newConversation });
    res.locals.mongoQueryResults = message;
    console.log('updated the database Chat, got this message ' + message + 'from mongoose');
    return next();
  } catch (error) {
    return next({
      log: `ERROR in mongooseController.saveConversationToChat, ${error}`,
      status: 500,
      message: `error saving your conversation.`,
    });
  }
};
