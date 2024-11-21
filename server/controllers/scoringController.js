import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

let openAIAPIKEY = process.env.OPENAI_API_KEY;
if (!openAIAPIKEY) throw 'need openai api key';

const openai = new OpenAI({ apiKey: openAIAPIKEY });

const MAX_MESSAGES = 6;

export const checkEndGame = async (req, res, next) => {
  let finalChatState = res.locals.finalChatState;
  if (finalChatState.length > MAX_MESSAGES) {
    console.log('ending game');
    let score = await scoreConversation(finalChatState);
    res.locals.userScore = score; // set it
    res.locals.didEnd = true; // ur done.
    console.log({ score });
    next();
  } else {
    return next();
  }
};

// helper functions
const scoreConversation = async (finalChatState) => {
  console.log(`scoring... this nonsense ... ${finalChatState}`);
  const scorePrompt = `
    You are an expert in social science and have been asked to provide a score which will be combined with other judges scores. 
    You will be giving a social skils ranking for user's social skills performance in this conversation, ranged from 1 to 10 based on these criteria, in order to gain a high rank:
    #1. The user's replies should be engaging to prompt the oppon  
    #2. The user should also make the recipient feel positive emotions in response to the user's messages.
    #3. The user should not be overly pushy to get anything they might want.
  `;

  try {
    // res.locals.currentChatState [ {role:'assistant/user', content: 'message' }]
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.5,

      messages: [
        {
          role: 'system',
          content: `${scorePrompt}
          Only share your rank out of ten, using whole numbers.
          Your score will be shown to the audience, and so you should only output a number 1 to 10.`,
        },

        { role: 'user', content: `A person, 'user' had this final performance, can you provide a score 1 to 10 for how well user did according to the criteria? ${finalChatState}` },
      ],
    });
    console.log(completion.choices[0].message.content);
    //res.locals.userScore = completion.choices[0].message.content;
    return completion.choices[0].message.content;
  } catch (error) {
    throw `err${error}`;
  }
};

export const giveFeedback = async (req, res, next) => {
  try {
    // res.locals.currentChatState [ {role:'assistant/user', content: 'message' }]
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.5,

      messages: [
        {
          role: 'system',
          content: ``,
        },
        ...currentChatState,

        { role: 'user', content: `${newestMessage}` },
      ],
    });
  } catch (error) {
    return next({
      log: `error querying openai for score.`,
      status: 500,
      message: { err: 'error calculating score... you must bee too good.' },
    });
  }
};
