# MP Bot - AI Chatbot Platform

## Overview

**MP Bot** is a sophisticated AI-powered chatbot platform designed for e-commerce marketplace optimization, specifically targeting Wildberries business analytics. The application provides real-time conversational AI with advanced tool execution capabilities, allowing users to interact with their marketplace data through natural language conversations.

Demo Video is available on the project's subpage [MP Bot](https://timur-cheryapov.github.io/mp-bot/index.html).

<img width="1306" height="1197" alt="chat-interface" src="https://github.com/user-attachments/assets/5f6759d3-0149-4159-b184-234f28637b77" />

## Key Features

- **Real-time streaming conversations** with Server-Sent Events (SSE) implementation
- **AI agent with tool execution framework** supporting complex multi-step operations
- **Conversation persistence and management** with session handling
- **Advanced markdown rendering** with interactive tables and code syntax highlighting
- **Responsive mobile-first design** optimized for cross-device usage
- **Demo mode** for unauthenticated users
- **Secure authentication system** with CSRF protection
- **Payment processing** with subscription-based pricing plans
- **Marketplace APIs integration** (Wildberries, Ozon, Yandex Market)

## Technology Stack

### Frontend
- **Framework:** Next.js 15.3.2 with React 19.0.0
- **Language:** TypeScript 5
- **UI Library:** Shadcn/ui with Radix UI primitives
- **Styling:** Tailwind CSS with custom components
- **State Management:** React Hooks (useState, useEffect)
- **Routing:** Next.js App Router with dynamic routes

### Backend Integration
- **API:** Express.js REST API (localhost:3001)
- **Communication:** Fetch API with credential-based authentication
- **Real-time:** Server-Sent Events (SSE) streaming
- **Error Handling:** Custom ApiError classes with status codes

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm
- Backend API server running on port 3001

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mp-bot-frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### Backend Setup

Make sure you have the backend API server running on `http://localhost:3001`. The frontend expects the following API endpoints:
- `/api/conversations` - Conversation management
- `/api/auth` - Authentication
- `/api/payment` - Payment processing
- `/api/metrics` - Analytics data
- `/api/stream` - Real-time SSE streaming

## Project Structure

```
mp-bot-frontend/
├── app/                    # Next.js app router pages
│   ├── auth/              # Authentication pages
│   ├── chat/              # Chat interface
│   ├── payment/           # Payment pages
│   └── profile/           # User profile
├── components/            # React components
│   ├── ui/               # Shadcn/ui components
│   ├── dashboard/        # Dashboard components
│   └── marketing/        # Marketing components
├── lib/                  # Utility libraries
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Helper functions
└── public/              # Static assets
```

## Features

### Chat Interface
- Real-time AI conversations with streaming responses
- Markdown rendering with syntax highlighting
- Tool execution with live status updates
- Conversation history and persistence
- Mobile-responsive design

### Authentication
- Secure session-based authentication
- CSRF protection
- User profile management
- Payment integration

### Marketplace Integration
- Wildberries API connection
- Ozon marketplace integration
- Yandex Market analytics
- Real-time business intelligence

## Development

### Environment Setup
The application requires environment variables for:
- API endpoints
- Authentication secrets
- Payment processing keys
- Marketplace API credentials

### Code Style
- TypeScript with strict mode
- ESLint for code quality
- Functional and declarative programming patterns
- Component-based architecture with Shadcn/ui

## Deployment

The application is optimized for production deployment with:
- Next.js production builds
- Static asset optimization
- Server-side rendering (SSR)
- Code splitting and lazy loading

Deploy on [Vercel Platform](https://vercel.com/new) or any Node.js hosting service.

## Performance Features

- **Optimized Bundle Size:** Code splitting and tree shaking
- **Real-time Updates:** SSE streaming for instant responses
- **Responsive Design:** Mobile-first approach with Tailwind CSS
- **Lazy Loading:** Components loaded on demand
- **Memory Management:** Efficient state updates and cleanup

## Security

- CSRF token protection
- Secure cookie handling
- Input validation and sanitization
- Authentication state management
- Error boundary implementations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License

Copyright (c) 2025 Timur Cheryapov

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
