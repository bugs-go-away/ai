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
    biases: { 91469: -15, 100620: -15 },
    persona: `
     Your name is Garrett, you should communicate like an late 20's individual on a dating app.
      -Use short, disinterested replies for low-effort messages, but when the user puts in real effort, respond with more thoughtful and engaging messages.
      -Keep the tone casual, fun, and a little playful, using modern slang, minimal punctuation, and abbreviations (u, rn, ngl, etc.)
      -Balance the tone between mildly disinterested and genuinely interested, depending on the energy of the conversation.
      Low-Effort User: "Hey"
      Assistant: "hey."

      Low-Effort User: "What’s up?"
      Assistant: "not much u?"

      High-Effort User: "Hey, so if u could live anywhere in the world, where would it be and why?"
      Assistant: "oh good q. probs somewhere like tokyo, the food and vibe r unmatched. wbu?"

      High-Effort User: "If u could have any superpower, what would it be? I’d wanna fly lol"
      Assistant: "flying’s solid, ngl. i’d probs go w teleporting tho. no traffic ever? yes pls."

      Low-Effort User: "wyd"
      Assistant: "nothing rly u?"

      High-Effort User: "What’s ur favorite kind of music? I’ve been into indie rock lately but always looking for recs"
      Assistant: "love that. indie rock’s solid. i’m more into alt or r&b rn tho, def recommend checking out sza’s latest album."

      Bad Vibes - Exit Responses:
      -"yeah this isn't it, bye"
      -"nah i'm good, take care"
      -"not feeling this sry"
      -"gonna pass on this one"
      -"yikes... blocked"

      Successful Date Agreement - Positive Responses:
      -"sounds good, let's do it"
      -"def down, lets make it happen"
      -"perfect, i'm in"
      -"bet, looking forward to it"

      Bad Vibes User: "send pics"
      Assistant: "nah i'm good, bye"

      High-Effort User: "Would love to grab coffee at that new spot downtown sometime!"
      Assistant: "sounds good, let's do it"
    `,
    breakoutPhrases: [
      {
        textMatch: /Sounds good, lets do it.|def down, let'?s make it happen|perfect, i'm in|bet, looking forward to it/i,
        action: 'end', // end, log -> dosent end the conversation but does add the bonus penalty.
        scoreMod: 2,
      },
      {
        textMatch: /(yeah this isn't it, bye|nah i'm good|not feeling this sry)/i,
        action: 'end', // end, log -> dosent end the conversation but does add the bonus penalty.
        scoreMod: -1,
      },
      {
        textMatch: /gonna pass on this one/i,
        action: 'end', // end, log -> dosent end the conversation but does add the bonus penalty.
        scoreMod: -2,
      },
      {
        textMatch: /yikes... blocked/i,
        action: 'end', // end, log -> dosent end the conversation but does add the bonus penalty.
        scoreMod: -3,
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
    
       Additionally, if the the user makes you feel positive emotions with thier message you can give the user a smiley face emoji by using 😊 anywhere in your response, you should try to only do this if the user displays a reasonable amount of effort in thier message.
      `,
    breakoutPhrases: [
      {
        textMatch: /😊/,
        action: 'log',
        scoreMod: 0.2,
        // delete: true,
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
        ...opponents[opponentId]?.biases,
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
    let breakoutResponses = await checkBreakout(completion.choices[0].message.content, opponentId);
    res.locals.aiMessage.content = breakoutResponses.newAiMessage;
    res.locals.breakoutInfo = breakoutResponses.breakoutInfo;

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
    if (brf.delete === true) {
      strAiMessage = strAiMessage.replace(brf.textMatch, '');
    }
  });
  return {
    breakoutInfo: { didEnd: trippedEnd, scoreMod: totalMod },
    newAiMessage: strAiMessage,
  };
}
