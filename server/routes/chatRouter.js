import express from 'express';

import { parseMessage, receiveAIMessage } from '../controllers/chatController.js';

import { createChat, endChat, getChatData, saveConversationToChat } from '../controllers/mongooseController.js';

import { checkEndGame } from '../controllers/scoringController.js';

const router = express.Router();

router.post('/init', createChat, (_req, res, _next) => {
  res.status(200).json({ ok: true });
});

//    none -> GETCHATDATA -> res.locals.currentChatState
//    chat sent in body -> parseMessage -> res.locals.message
//    res.locals.currentChatState && res.locals.message ->  CHATCONTROLLER -> res.locals.aiMessage
//
//    res.locals.username && res.locals.message && res.locals.aiMessage && res.locals.currentChatState -> SAVE_CONVERSATION_TO_CHAT -> res.locals.finalChatState
//		res.locals.finalChatState -> checkEndGame -> res.locals.didEnd && res.locals.score
router.post(
  '/message',
  getChatData,
  parseMessage,
  receiveAIMessage,
  /* query openay for new message */
  saveConversationToChat,
  checkEndGame,
  (req, res, next) => {
    if (res.locals.didEnd === true) {
      endChat(req, res, next); // technically, this will call OUR next and chain on so basically this works, look it up before touching it.
    }
  },
  (_req, res, _next) => {
    res.status(200).json({
      endMessage: { didEnd: res.locals.didEnd ?? false, reason: res.locals.endReason ?? null, score: res.locals.userScore ?? null, feedback: 'you need to change this... like everything about you.' },
      response: { message: res.locals.aiMessage },
    });
  }
);

router.post('/clear', endChat, (req, res, next) => {
  res.status(200).json({
    deletedCount: res.locals.mongoQueryResults.deletedCount,
  });
});

export default router;
