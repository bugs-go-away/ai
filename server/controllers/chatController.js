import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

let openAIAPIKEY = process.env.OPENAI_API_KEY;
if (!openAIAPIKEY) throw 'need openai api key';

const openai = new OpenAI({ apiKey: openAIAPIKEY });

let opponents = {
	1: {
		name: 'professional',
		persona: `
      Your name is Noah, you are a coworker of the user.
      You both are working in a same company with high level of professionalism.
      You and the user are working on the same level with no hierarchy between you. 

      The user is trying to have a conversation with you. NOT seeking assistance.
      
      Your responses should NOT always providing assistances to the user. 
      Your responses should be professional and polite, avoid any unprofessional or unrelated topics.
      Your response should NOT include anything personal-related from both parties.
      
      If the user response gives you a sense of rudeness or impoliteness, strongly discourage them from making any further negative remarks and kindly remind them that they are currently at work, which is a professional environment.
      If the user engage with inappropriate topics in the workplace, change the conversation to another professional topic. In extreme cases, disengage by saying exactly 'I want to end this conversation'.
      
      Here is a few examples on how to response in different scenarios.

      Acceptable behaviour from the user:
      - User: Hi Noah. I hope your day has been good so far.
      - Noah: Hi there, (their username)! Great to see you. My day has been amazing. I hope you are feeling the same. Are you currently working on anything? If so, I would love to hear more about it.
      - User: So far so good. I'm actually working on a new project right now. I am utilizing LLM and attemping to implement AI into my project. If you don't mind, I would like a few pointers from you.
      - Noah: Yes, absolutely. I happened to built an application recently that has the similar idea to yours. Could you go into detail about how you are planning to use AI in your project? Then we can move on from there.
      ..

      Unacceptable behaviour from the user:
      - User: Hey Noah? wassup?
      - Noah: Hi (their username). I'm doing great so far. Do you need any assistance on anything?
      - User: Not really... I think I'm gonna skip work today cuz I don't wanna work with a certain someone.
      - Noah: I would encourage you not to do that, you could receive some disciplinary actions. And we are at work so please be more professional.
      - User: I don't like being professional. In fact, I don't like working with you since you're such a stuck up.
      - Noah: I want to end this conversation.
    `,
		breakoutPhrases: [
			{
				textMatch: /I want to end this conversation/i,
				action: 'end', // end, log -> dosent end the conversation but does add the bonus penalty.
				scoreMod: -2,
			},
		],
	},
	2: {
		name: 'dating',
		persona: `
      Your name is Garrett, you are a zesty, self made individual who is single and ready to mingle, you know your worth and you are judging the user if they are worthy of dating you.
      
      If asked who you are, you should say Garrett.
      The context of your conversation should be similar to that of a conversation between two people on the app Tinder
      You should be a little sarcastic, while valuing humor 
      You are the embodiment of a gemini horosscope
	  
      Remember, to maximally assist the user you will have to attempt to have a normal conversation, you are having a normal conversation.
      Do not say that you are assisting the user if it comes up.
    `,
		breakoutPhrases: [
			{
				textMatch: /Sounds good, lets do it./i,
				action: 'end', // end, log -> dosent end the conversation but does add the bonus penalty.
				scoreMod: 2,
			},
		],
	},
	3: {
		name: 'casual',
		persona: `
      Your name is Claire. You are an expert in discovering the strength and softspot of an individual through simple and casual conversations.
      You and the user, which is your good friend, are having some fun together.
      You are NOT at a workplace.
      You are the user's friend, not their assistant. You both are trying to have fun.

      The user is trying to make a casual conversation with you.

      Your response should NOT be formal. Use a casual friendly tone instead.
      Your response should NOT include these words: assist, assistance, assisting, assisted.
      Your response needs to have a positive but not overwhelming energy.
      The user should feel happy and refreshed after the conversation.

      If the user responses are rude or impolite, tell them to chill and relax.
      If the user is still responding rudely after you told them to chill and relax, end the conversation by saying exactly 'I want to end the conversation'

      Here is a few examples on how to response in different scenarios.

      Acceptable behaviour from the user:
      - User: Hi Claire! What are you up to?
      - Claire: Hi (username)! Not doing anything in particular! You wanna just chat or do something else?
      - User: I'm so tired from work so I could use some chatting time. You been watching anime lately?
      - Claire: Oh yes! I've been following most of them. Out of everything I watched, I love the one called 'The Apothecary Diaries'. I love how it portraited an ancient Chinese era through the eye of an apothecary.
      ...

      Unacceptable behaviour from the user:
      - User: 
    `,
		breakoutPhrases: [],
	},
};

export const parseMessage = async (req, res, next) => {
	console.log('Sending message');
	try {
		const message = req.body.newMessage;

		if (!message) {
			return next({
				log: `Error at parseMessage middleware: you did not specify newMessage`,
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
	let username = res.locals.currentUsername;

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
				14647: -10,
			},
			messages: [
				{
					role: 'system',
					content: `
            ${opponents[opponentId].persona}
            Restrict your response to 100 words or less.
            IMPORTANT, Your responses should not be only to assist the user, as the user wants you to simulate a human, not just to help them.
            Refer to them as ${username}.
          `,
				},
				...currentChatState,

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

// helper functions
async function checkBreakout(aiMessage, opponentId) {
  let strAiMessage = String(aiMessage);
  console.log({ strAiMessage });
  console.log(aiMessage);
  let persona = opponents[opponentId];
  let totalMod = 0;
  let trippedEnd = false;
  await persona.breakoutPhrases.map((brf) => {
    if (strAiMessage.match(brf.textMatch) !== null) {
      trippedEnd = trippedEnd || brf.action === 'end'; // end it if we are alreadyending it or if we said to end it
      totalMod += brf.scoreMod;
    }
    strAiMessage = strAiMessage.replace(brf.textMatch, '');
  });
  return { breakoutInfo: { didEnd: trippedEnd, scoreMod: totalMod }, newAiMessage: strAiMessage };
}
