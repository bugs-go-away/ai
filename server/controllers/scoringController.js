import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

let openAIAPIKEY = process.env.OPENAI_API_KEY;
if (!openAIAPIKEY) throw 'need openai api key';

const openai = new OpenAI({ apiKey: openAIAPIKEY });

const MAX_MESSAGES = 6;

export const checkEndGame = async (req, res, next) => {
  let finalChatState = res.locals.finalChatState;
  let parsedFinalChatState = await finalChatState.map((obj) => {
    return { role: obj.role, content: obj.content };
  });

  let userConversation = '';
  await finalChatState.map((obj) => {
    userConversation += `${obj.role} -> ${obj.content}
    `;
  });

  if (finalChatState.length > MAX_MESSAGES) {
    console.log('ending game');
    let score = await scoreConversation(userConversation);
    let feedback = await giveFeedback(userConversation);
    res.locals.userScore = score; // set it
    res.locals.didEnd = true; // ur done.
    res.locals.endReason = 'Chat limit exceeded.';
    res.locals.chatFeedback = feedback;
    console.log({ score });
    next();
  } else {
    return next();
  }
};

// helper functions
const scoreConversation = async (finalChatState) => {
  const scorePrompt = `
    You are an expert in social science and have been asked to provide a score which will be combined with other judges scores.

    You will be giving a social skils ranking for user's social skills performance in this conversation, ranged from 1 to 10 based on these criteria, in order to gain a high rank:
    #1. The user's replies should be engaging enough to prompt the reciepient to engage more.
    #2. The user should also make the recipient feel positive emotions in response to the user's messages.
    #3. The user should not be overly pushy to get anything they might want.
    #4. In the user's messages, deduct the rank if there are any negative remarks such as cursing, inappropriate responses or making the recipient feel negative emotions.

    Be honest with your score, brutally honest if needed.

    Only share your rank from a range one out of ten, using whole numbers.

    Your score will be shown to the audience, and so you should only output a number 1 to 10. No addition words are needed.

    For example, if the user makes relatively generic comments you could respond:
    3
    If thy truly outstand you with eloquent speech and great social skills you could respond:
    9
  `;

  try {
    // res.locals.currentChatState [ {role:'assistant/user', content: 'message' }]
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.5,

      messages: [
        {
          role: 'system',
          content: `${scorePrompt}`,
        },

        {
          role: 'user', //
          content: `A person, 'user' had this final performance, can you provide a score 1 to 10 for how well user did according to the criteria? ${finalChatState}`,
        },
      ],
    });
    //res.locals.userScore = completion.choices[0].message.content;
    return completion.choices[0].message.content;
  } catch (error) {
    throw `err${error}`;
  }
};

export const giveFeedback = async (finalChatState) => {
  const feedbackPrompt = `
    You are an expert in social science.

    The 'user' will ask you to give feedback on their social skills in a conversation.
    
    You should give them one paragraph of feedback on what the 'user' did well.
    
    You should also give them one paragraph of feedback on what the 'user' could improve.
    
    Only give feedback on 'user''s comments, and not on what the recipient says, but you could draw information to how well the recipient responds to the user          
  `;

  try {
    // res.locals.currentChatState [ {role:'assistant/user', content: 'message' }]

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.5,

      messages: [
        {
          role: 'system',
          content: `${feedbackPrompt}`, //This is the users conversation: ${JSON.stringify(finalChatState)}
        },
        { role: 'user', content: `Can you give me feedback on how to improve my social skills in this conversation, (i am 'user' in this conversation): ${finalChatState}` },
      ],
    });
    return completion.choices[0].message.content;
  } catch (error) {
    throw 'error querying openai for score.' + error;
  }
};
