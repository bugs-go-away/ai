import express from 'express';

import {
	parseMessage,
	receiveAIMessage,
} from '../controllers/chatController.js';

import {
	createChat,
	endChat,
	getChatData,
	saveConversationToChat,
} from '../controllers/mongooseController.js';

const router = express.Router();

router.post('/init', createChat, (_req, res, _next) => {
	res.status(200).json({ ok: true });
});

//    none -> GETCHATDATA -> res.locals.currentChatState
//    chat sent in body -> parseMessage -> res.locals.message
//    res.locals.currentChatState && res.locals.message ->  CHATCONTROLLER -> res.locals.aiMessage
//
//    res.locals.username && res.locals.message && res.locals.aiMessage && res.locals.currentChatState -> SAVE_CONVERSATION_TO_CHAT
//
router.post(
	'/message',
	getChatData,
	parseMessage,
	receiveAIMessage,
	/* query openay for new message */
	saveConversationToChat,
	(_req, res, _next) => {
		res.status(200).json({
			endMessage: { didEnd: false, reason: null },
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
