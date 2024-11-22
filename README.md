# AI Personality Chat

A dynamic chat application that allows users to interact with AI personalities featuring different conversation styles and scoring mechanisms.

## Features

- 🤖 Multiple AI Personalities:

  - Professional (Noah): Maintains workplace-appropriate conversations
  - Dating (Garrett): Simulates dating app interactions
  - Casual (Claire): Engages in friendly, informal chat

- 📊 Real-time Conversation Scoring:

  - Evaluates user's social skills
  - Provides detailed feedback
  - Includes word count bonuses and penalties

- 💬 Interactive Chat Interface:
  - Real-time typing indicators
  - Message history
  - Score visualization
  - Dark mode support

## Tech Stack

- Frontend:

  - React
  - Tailwind CSS
  - Lucide Icons
  - React Hot Toast

- Backend:
  - Node.js
  - Express
  - MongoDB with Mongoose
  - OpenAI API

## Installation

1. Clone the repository:

```bash
git clone [your-repository-url]
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with:

```env
OPENAI_API_KEY=your_openai_api_key
```

4. Start the development server:

```bash
npm run dev
```

## Personality Types

### 1. Professional (Noah)

- Maintains workplace-appropriate conversations
- Discourages unprofessional behavior
- Focuses on work-related topics
- Score penalties for inappropriate workplace behavior

### 2. Dating (Garrett)

- Simulates dating app interactions
- Responds based on message effort
- Uses casual language and modern slang
- Features positive and negative conversation endings

### 3. Casual (Claire)

- Friendly and informal conversation style
- Uses emojis for positive interactions
- Can provide casual endings
- Score bonuses for positive interactions

## Scoring System

The application scores conversations based on:

- Message quality and engagement
- Word count (minimum 5 words per message recommended)
- Appropriate topic selection
- Emotional intelligence
- Conversation flow

Scoring Modifiers:

- Below 5 words: -1 point
- Above 25 words: +1 point
- Personality-specific bonuses/penalties

Final scores range from 1-10, with detailed feedback provided.

## Component Structure

- `ChatContainer.jsx`: Main chat interface
- `ScoreContainer.jsx`: Score visualization
- `mongooseController.js`: Database operations
- `scoringController.js`: Conversation scoring logic
- `chatController.js`: AI personality management

## API Endpoints

### Chat Management

```javascript
POST /chat/message
Query Parameters:
- username
- password
Body:
- newMessage: string

GET /chat/init
Query Parameters:
- username
- password
- opponentId

POST /chat/end
Query Parameters:
- username
- password
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
