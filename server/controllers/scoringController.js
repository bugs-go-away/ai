import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

let openAIAPIKEY = process.env.OPENAI_API_KEY;
if (!openAIAPIKEY) throw 'need openai api key';

const openai = new OpenAI({ apiKey: openAIAPIKEY });

export const scoreConversation = async (req, res, next) => {
  let finalChatState = res.locals.finalChatState;
  const scorePrompt = `
    You are an expert in social science.
    You will be giving a social skils ranking for user's social skills performance in this conversation, ranged from 1 to 10 based on these criteria, in order to gain a high rank:
    #1. The user's replies should be engaging to prompt the oppon  
    #2. you can also alter your ranking based on how well the recipient responds to the user's interaction.
    #3. the user should also make the recipient feel positive emotions in response to the user's messages.
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
          This was the conversation, you should be ranking 'user' ${finalChatState}`,
        },

        { role: 'user', content: `${newestMessage}` },
      ],
    });
  } catch (error) {
    return next({
      log: `error querying openai for score.`,
      status: 500,
      message: { err: 'error calculating score... you must be too good.' },
    });
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
