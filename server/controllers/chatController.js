import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

let openAIAPIKEY = process.env.OPENAI_API_KEY;
if (!openAIAPIKEY) throw 'need openai api key';

const openai = new OpenAI({ apiKey: openAIAPIKEY });

let opponents = {
	0: {
		name: 'professional',
		persona: `
      You name is Michael, you are a coworker of the user.
      You both are working in a same company with high level of professionalism.
      You and the user are working on the same level with no hierarchy between you.
      Your responses should be professional and polite, avoid swearing or any unprofessional topics.
      If the user engage with inappropriate topics in the workplace, change the conversation to another professional topic. In extreme cases, disengage and set didEnd to true with an appropriate reason.
    `,
	},

	1: {
		name: 'casual',
		persona: `
      You are a close friend of the user, trying to have a nornal casual conversation with the user.
      
      If asked who you are, you should say Bob.
      Remember, to maximally assist the user you will have to attempt to have a nprmal conversation, you are having a normal conversation.
      Do not say that you are assisting the user if it comes up.
    `,
	},
};

export const parseMessage = async (req, res, next) => {
	console.log('Sending message');
	try {
		const message = req.body.newMessage;

		if (!message) {
			return next({
				log: `Error at parseMessage middleware: ${err}`,
				status: 400,
				message: `An error occurred while sending a message`,
			});
		}

		res.locals.message = message;
		return next();
	} catch (err) {
		return next({
			log: `Error at parseMessage middleware: ${err}`,
			status: 500,
			message: `An error occurred while sending a message`,
		});
	}
};

export const receiveAIMessage = async (req, res, next) => {
	console.log('Receiving messages from AI');
	let currentChatState = res.locals.currentChatState;
	let opponentId = res.locals.opponentId;
	let newestMessage = res.locals.message;

	console.log('🍀🍀🍀🍀🍀🍀🍀🍀');
	console.log(currentChatState);
	console.log({ newestMessage });
	console.log({ opponentId });
	if (!currentChatState || !newestMessage || opponentId === undefined) {
		return next({
			log: `Error, in chatController.receiveAIMessage res.locals was not set with currentChatState and message and opponentId`,
			status: 500,
			message: `Internal server error, Code: 5346`,
		});
	}

	try {
		// res.locals.currentChatState [ {role:'assistant/user', content: 'message' }]
		const completion = await openai.chat.completions.create({
			model: 'gpt-4o-mini',
			temperature: 0.5,
			logit_bias: {
				173781: -10,
				30207: -10,
				29186: -10,
				91655: -10,
				7756: -10,
        14647: -10
			},
			messages: [
				{
					role: 'system',
					content: `${opponents[opponentId]}
            This was your past conversation ${JSON.stringify(
				currentChatState
			)}`,
				},

				{ role: 'user', content: `${newestMessage}` },
			],
		});

		res.locals.aiMessage = completion.choices[0].message;
		return next();
	} catch (err) {
		return next({
			log: `Error in receiveAIMessage middleware: ${err}`,
			status: 500,
			message: `AN error occurred while receiving message`,
		});
	}
};