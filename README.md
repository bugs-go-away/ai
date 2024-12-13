# AI Chat Application

A sophisticated conversational AI platform leveraging OpenAI's GPT models to create dynamic, context-aware chat interactions for social skills development and assessment.

## Technical Overview

### Architecture
- **Frontend**: React 18 SPA with Vite build tooling
- **Backend**: Express.js REST API with MongoDB persistence
- **AI Integration**: OpenAI GPT-4 with custom prompt engineering and context management
- **Real-time Features**: Dynamic typing indicators, message queuing, and state management
- **Styling**: Tailwind CSS with custom theming and responsive design

### Key Features

#### AI Conversation Engine
- Context-aware dialogue management with persona-specific conversation styles
- Real-time response generation with custom prompt templates
- Sophisticated conversation scoring algorithm using multiple evaluation criteria
- Adaptive conversation flow based on user interaction patterns

#### User Experience
- Real-time chat interface with typing indicators and message animations
- Dark/light theme support with seamless transitions
- Responsive design optimized for all device sizes
- Accessibility-focused component architecture

#### Backend Systems
- RESTful API with Express.js
- MongoDB integration with Mongoose ODM
- Custom middleware for authentication and request handling
- Conversation state management and persistence

#### Performance Optimizations
- Efficient React component rendering with proper hooks usage
- Optimized database queries with proper indexing
- Frontend bundle optimization with Vite
- Lazy loading and code splitting

### Technical Stack

#### Frontend
```javascript
{
  "framework": "React 18",
  "buildTool": "Vite",
  "styling": ["Tailwind CSS", "Material-UI"],
  "stateManagement": "React Hooks",
  "ui/uxLibraries": ["Lucide Icons", "React Hot Toast"]
}
```

#### Backend
```javascript
{
  "runtime": "Node.js",
  "framework": "Express.js",
  "database": "MongoDB",
  "orm": "Mongoose",
  "aiIntegration": "OpenAI API"
}
```

### Development Setup

1. Clone and install dependencies:
```bash
git clone https://github.com/yourusername/ai-chat-app.git
cd ai-chat-app
npm install
```

2. Configure environment variables:
```env
OPENAI_API_KEY=your_api_key
MONGODB_URI=your_mongodb_uri
```

3. Start development servers:
```bash
# Frontend
npm run dev

# Backend
npm run server
```

### API Documentation

#### Chat Endpoints

```javascript
POST /chat/init
- Initialize chat session with selected persona
- Query params: opponentId, username, password

POST /chat/message
- Send message and receive AI response
- Query params: username, password
- Body: { newMessage: string }

POST /chat/clear
- End chat session and clear history
- Query params: username, password
```

### System Architecture

```
├── Frontend (React + Vite)
│   ├── Components
│   │   ├── Chat Interface
│   │   ├── Scoring System
│   │   └── User Management
│   └── State Management
│       └── React Hooks
│
├── Backend (Express.js)
│   ├── API Routes
│   ├── Controllers
│   ├── Middleware
│   └── Models
│
└── Database (MongoDB)
    └── Conversation Storage
```

### Engineering Highlights

- **Scalable Architecture**: Modular component design with clear separation of concerns
- **AI Integration**: Sophisticated prompt engineering and context management
- **Performance**: Optimized rendering and state management
- **Security**: Request validation, error handling, and secure data persistence
- **Code Quality**: TypeScript integration, ESLint configuration, and consistent coding standards

### Future Enhancements

- WebSocket integration for real-time features
- Enhanced analytics and performance monitoring
- Additional AI model integration options
- Advanced conversation scoring algorithms
- User authentication system expansion

### Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### License

MIT License - see LICENSE.md for details
