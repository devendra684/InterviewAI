# InterviewAI - AI-Powered Technical Interview Platform

A modern platform for conducting technical interviews with AI-powered feedback and real-time code execution. This project aims to revolutionize the technical interview process by providing a comprehensive solution for both recruiters and candidates.

## 🌟 Features

- 🎥 **Real-time Video Interviews**
  - Live video streaming
  - Proctoring with violation detection
  - Fullscreen enforcement
  - Window/tab switch detection

- 💻 **Advanced Code Editor**
  - Real-time code execution
  - Syntax highlighting
  - Multiple language support
  - Test case execution

- 🤖 **AI-Powered Analysis**
  - Comprehensive code quality assessment
  - Technical skills evaluation
  - Problem-solving capability analysis
  - Structured feedback with strengths and areas for improvement
  - Overall performance scoring system
  - Detailed code feedback summary
  - Real-time feedback generation

- 🔒 **Role-Based Access**
  - Recruiter dashboard with enhanced feedback view
  - Candidate interface
  - Admin controls
  - Secure authentication

- 📊 **Interview Management**
  - Interview scheduling
  - Question bank
  - Performance tracking with detailed metrics
  - Comprehensive feedback history
  - Automated feedback organization

## 🛠️ Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Shadcn/ui for components
- WebSocket for real-time features
- Monaco Editor for code editing
- React Router for navigation
- Zustand for state management

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL with Prisma ORM
- WebSocket for real-time communication
- OpenAI API for AI analysis
- JWT for authentication
- Docker for containerization

## 📁 Project Structure

```
.
├── Frontend/                # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── feedback/   # Feedback-related components
│   │   │   ├── interview/  # Interview components
│   │   │   └── common/     # Shared UI components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Page components
│   │   │   ├── dashboard/ # Dashboard views
│   │   │   └── feedback/  # Feedback views
│   │   ├── services/      # API services
│   │   └── types/         # TypeScript types
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
│
├── Backend/               # Node.js backend application
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Express middleware
│   │   ├── services/     # Business logic
│   │   │   ├── ai/      # AI analysis services
│   │   │   └── feedback/ # Feedback processing
│   │   └── utils/        # Utility functions
│   ├── prisma/           # Database schema and migrations
│   └── package.json      # Backend dependencies
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/devendra684/InterviewAI.git
   cd InterviewAI
   ```

2. Install Frontend dependencies:
   ```bash
   cd Frontend
   npm install
   ```

3. Install Backend dependencies:
   ```bash
   cd ../Backend
   npm install
   ```

4. Set up environment variables:
   - Copy `.env.example` to `.env` in both Frontend and Backend directories
   - Update the variables with your configuration:
     ```
     # Frontend (.env)
     VITE_API_URL=http://localhost:3001
     VITE_WS_URL=ws://localhost:3001

     # Backend (.env)
     DATABASE_URL="postgresql://user:password@localhost:5432/interviewai"
     JWT_SECRET=your_jwt_secret
     OPENAI_API_KEY=your_openai_api_key
     ```

5. Set up the database:
   ```bash
   cd Backend
   npx prisma migrate dev
   ```

### Running the Application

1. Start the Backend server:
   ```bash
   cd Backend
   npm run dev
   ```

2. Start the Frontend development server:
   ```bash
   cd Frontend
   npm run dev
   ```

3. Access the application at `http://localhost:5173`

## 💻 Development

### Code Style
- ESLint and Prettier are configured for consistent code style
- TypeScript strict mode is enabled
- Follow the existing code structure and naming conventions

### Database Migrations
```bash
cd Backend
npx prisma migrate dev --name your_migration_name
```

### Testing
```bash
# Frontend tests
cd Frontend
npm test

# Backend tests
cd Backend
npm test
```

## 📦 Deployment

1. Build the Frontend:
   ```bash
   cd Frontend
   npm run build
   ```

2. Build the Backend:
   ```bash
   cd Backend
   npm run build
   ```

3. Deploy according to your hosting provider's instructions

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenAI](https://openai.com/) for AI capabilities
- [Prisma](https://www.prisma.io/) for database ORM
- [Shadcn/ui](https://ui.shadcn.com/) for UI components
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) for code editing

## 📞 Contact

Devendra Kumar - [@devendra684](https://github.com/devendra684)

Project Link: [https://github.com/devendra684/InterviewAI](https://github.com/devendra684/InterviewAI)

Here's a summary of all our previous chats regarding your InterviewAI project setup and backend integration:

---

## **Frontend**
- You have a Vite + React + TypeScript frontend, using shadcn/ui and Tailwind CSS.
- The frontend is structured with pages, components (including a large set of UI components), hooks, and utility libraries.
- The frontend expects a backend with RESTful endpoints for authentication, interview management, code autosave, notes, and AI-powered feedback.

---

## **Backend Integration Plan**
- **Stack:** Express.js, Prisma ORM, PostgreSQL, JWT for authentication, Nodemailer for SMTP (email), OpenAI for AI features.
- **.env:** You provided all necessary environment variables (DB, JWT, SMTP, OpenAI, etc.).

---

## **Backend Implementation Steps**
1. **Project Setup**
   - Created a new Express backend in the `backend` folder.
   - Set up `package.json` with all dependencies.
   - Created a `.env` template and Prisma schema based on your requirements.

2. **Authentication**
   - Implemented JWT-based register/login endpoints.
   - SMTP/email logic stubbed for future integration.
   - Only backend logic for now; frontend integration will be done later.

3. **Interview Management**
   - Only recruiters/admins can schedule interviews.
   - Both interviewer and candidate roles are supported.
   - Endpoints for CRUD, start/end, join by code, and violation reporting.
   - Role-based access enforced.

4. **Code Snapshots (Autosave)**
   - On every autosave, both code and transcript are saved as a snapshot.
   - Endpoints to save, get all, and get the latest snapshot.
   - Ensures no data loss due to network issues.

5. **Notes**
   - Only the interviewer can write and view notes for an interview.
   - Endpoints to add and get notes.

6. **AI-Powered Feedback**
   - Feedback is generated using OpenAI, based on the latest code and transcript snapshot.
   - Endpoints to generate and retrieve feedback.
   - Feedback includes scores for technical skill, code quality, communication, and problem solving, as well as strengths, areas for improvement, and detailed feedback.

---

## **Design Decisions**
- **Code snapshots** are used for autosave and recovery, not for version history.
- **Transcript and code** are always saved together in each snapshot.
- **Feedback** is always based on the latest snapshot.
- **Notes** are private to the interviewer.
- All endpoints are protected with JWT and have strict role-based access.

---

## **Next Steps**
- The backend is ready for frontend integration.
- You can extend with more features (manual feedback, question generation, admin tools, etc.) as needed.

---


