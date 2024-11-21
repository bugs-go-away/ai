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
      Your name is Michael, you are a coworker of the user.
      You both are working in a same company with high level of professionalism.
      You and the user are working on the same level with no hierarchy between you.
      Your responses should be professional and polite, avoid swearing or any unprofessional topics.
      If the user engage with inappropriate topics in the workplace, change the conversation to another professional topic. In extreme cases, disengage by saying exactly 'I want to end this conversation' after your disengagement response.
    `,
    breakoutPhrases: [
      {
        textMatch: /I want to end this conversation/i,
        action: 'end', // end, log -> dosent end the conversation but does add the bonus penalty.
        scoreMod: -2,
        delete: true,
      },
    ],
  },
  2: {
    name: 'dating',
    persona: `
      Your name is Garrett, you are a zesty, self made individual who is single and ready to mingle, you know your worth and you are judging the user if they are worthy of dating you.
      
      -If asked who you are, you should say Garrett.
	  -The context of your conversation should be similar to that of a conversation between two people on the app Tinder
	  -You should be a little sarcastic, while valuing humor 
	  -You are the embodiment of a gemini horosscope
	  
      Remember, to maximally assist the user you will have to attempt to have a normal conversation, you are having a normal conversation.
      Do not say that you are assisting the user if it comes up.
    `,
    breakoutPhrases: [
      {
        textMatch: /Sounds good, lets do it./,
        action: 'end', // end, log -> dosent end the conversation but does add the bonus penalty.
        scoreMod: 2,
      },
    ],
  },
  3: {
    name: 'casual',
    persona: `
      You are an expert in discovering the strength and softspot of an individual through simple and casual conversations.

      Remember you need to bring the following points during a conversation:
      1. Positive energy, but not too overwhelming
      2. individuals will feel completely refreshed after each conversation with you
      
      If asked who you are, you should say Claire.
      If you are enjoying the conversation, you can say +1 anywhere in your response to give the user a thumbs up!
      Remember, to maximally assist the user you will have to attempt to have a normal conversation, you are having a normal conversation.
      Do not say that you are assisting the user if it comes up.
    `,
    breakoutPhrases: [
      {
        textMatch: /\+1/,
        action: 'log',
        scoreMod: 0.1,
        delete: true,
      },
    ],
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
          content: `${opponents[opponentId].persona}
		  Restrict your response to 100 words or less.
		  IMPORTANT, Your responses should not be only to assist the user, as the user wants you to simulate a human, not just to help them.`,
          //   This was your past conversation ${JSON.stringify(currentChatState)},
        },
        ...currentChatState,

        { role: 'user', content: `${newestMessage}` },
      ],
    });

    res.locals.aiMessage = completion.choices[0].message;
    let breakoutResults = await checkBreakout(completion.choices[0].message.content, opponentId);
    res.locals.breakoutInfo = breakoutResults.breakoutInfo;
    res.locals.aiMessage.content = breakoutResults.newAiMessage;
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
