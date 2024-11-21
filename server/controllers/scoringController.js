import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

let openAIAPIKEY = process.env.OPENAI_API_KEY;
if (!openAIAPIKEY) throw 'need openai api key';

const openai = new OpenAI({ apiKey: openAIAPIKEY });

const MAX_MESSAGES = 10;
const TARGET_USER_WORD_COUNT_PER_MESSAGE = 5; // -1 bonus point for less than this
const BONUS_WORD_COUNT_SCORE_BENCHMARK = 25; // +1 bonus point for averaging higher than this

export const checkEndGame = async (req, res, next) => {
  let finalChatState = res.locals.finalChatState;
  let breakoutInfo = res.locals.breakoutInfo;
  let currentScoreMod = res.locals.currentScoreMod;
  if (!breakoutInfo) {
    breakoutInfo = { didEnd: false, scoreMod: 0 };
  }
  let userWordCount = 0;
  let totalUserMessages = 0;
  let parsedFinalChatState = await finalChatState.map((obj) => {
    if (obj.role === 'user') {
      totalUserMessages += 1;
      userWordCount += obj.content.split(' ').length + 1;
    }

    return { role: obj.role, content: obj.content };
  });

  let userConversation = '';
  await finalChatState.map((obj) => {
    userConversation += `${obj.role} -> ${obj.content}
    `;
  });

  if (finalChatState.length > MAX_MESSAGES || breakoutInfo.didEnd) {
    console.log('ending game');
    let score = await scoreConversation(userConversation);
    let feedback = await giveFeedback(userConversation);
    let intScore = Number(score);
    if (!intScore || intScore === NaN) {
      return next({
        log: 'error, ai did not return a number for score',
        status: 500,
        message: 'internal server error with openai.',
      });
    }
    console.log({ intScore });

    if (userWordCount < totalUserMessages * TARGET_USER_WORD_COUNT_PER_MESSAGE) {
      intScore -= 1;
    }
    if (userWordCount > totalUserMessages * BONUS_WORD_COUNT_SCORE_BENCHMARK) {
      intScore += 1;
    }

    console.log({ currentScoreMod });
    console.log({ breakoutINFOSCOREMOD: breakoutInfo.scoreMod });
    intScore += currentScoreMod;
    intScore += breakoutInfo.scoreMod;

    if (intScore < 1) {
      intScore = 1;
    } else if (intScore > 10) {
      intScore = 10;
    }
    res.locals.userScore = intScore; // set it
    res.locals.didEnd = true; // ur done.
    res.locals.endReason = 'Chat limit exceeded.';
    res.locals.chatFeedback = feedback;
    console.log({ score });
    next();
  } else {
    return next();
  }
};

// #5. If the user's response have less than ${TARGET_USER_WORD_COUNT_PER_MESSAGE}, deduct 1 rank from the user's current rank.
// 6. If the user's response have exactly or more than ${BONUS_WORD_COUNT_SCORE_BENCHMARK}, add 1 rank from the user's current rank.

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

    Each paragraph should be less than 50 words.
    
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
