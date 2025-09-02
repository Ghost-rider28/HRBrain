# Overview

This is a comprehensive HR recruitment and management platform built with React and Express.js. The application provides end-to-end hiring capabilities from job description generation to candidate onboarding, featuring AI-powered automation throughout the recruitment process. The system supports three main workflows: hiring & recruitment (job posting creation, resume screening, candidate ranking), candidate evaluation (automated assessments, behavioral analysis), and employee onboarding (document automation, task tracking). The platform is designed to streamline HR operations by reducing manual work and providing data-driven insights for better hiring decisions.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client uses React with TypeScript in a component-based architecture. The UI is built with shadcn/ui components providing a consistent design system based on Radix UI primitives and styled with Tailwind CSS. State management is handled by TanStack Query for server state and React hooks for local state. The application uses Wouter for lightweight client-side routing and supports real-time features through WebSocket connections.

## Backend Architecture
The server follows a REST API pattern built with Express.js and TypeScript. The architecture separates concerns into distinct layers: routes for API endpoints, storage abstraction for database operations, and specialized services for AI integrations. The server includes middleware for request logging, error handling, and file upload processing via multer.

## Database Layer
Uses Drizzle ORM with PostgreSQL as the primary database, configured for Neon serverless deployment. The schema defines comprehensive entities for users, job postings, candidates, assessments, interviews, employees, onboarding tasks, documents, reminders, and chat messages. Database migrations are managed through Drizzle Kit with automatic schema generation and validation using Zod schemas.

## AI Integration
OpenAI GPT integration provides automated content generation and analysis capabilities. The system uses GPT for job description generation, resume screening and keyword matching, candidate behavioral analysis, assessment scoring, and real-time HR query handling through a chat interface. AI responses are structured using JSON mode for consistent data processing.

## Real-time Communication
WebSocket server enables real-time chat functionality for employee support. The system maintains client connections with user identification and supports bidirectional messaging between users and AI assistants. Real-time updates are pushed for chat messages and system notifications.

## File Processing
Multer handles file uploads with support for PDF resumes and images. The system includes file validation, size limits, and storage management for uploaded documents. Resume parsing extracts text content for AI analysis and keyword matching against job requirements.

# External Dependencies

## Database Services
- **Neon PostgreSQL**: Serverless PostgreSQL database hosting with automatic scaling and connection pooling via @neondatabase/serverless

## AI Services  
- **OpenAI API**: GPT-5 model integration for content generation, text analysis, and conversational AI features

## UI Framework
- **shadcn/ui**: Complete component library built on Radix UI primitives for accessible, customizable interface components
- **Radix UI**: Low-level UI primitives providing accessibility and behavior foundations
- **Tailwind CSS**: Utility-first CSS framework for styling and responsive design

## Development Tools
- **Drizzle ORM**: Type-safe database client with automatic migration generation
- **Zod**: Runtime type validation and schema definition
- **TanStack Query**: Server state management with caching and synchronization
- **Vite**: Frontend build tool and development server
- **TypeScript**: Static typing throughout the application stack

## Session Management
- **connect-pg-simple**: PostgreSQL session store for Express sessions with database persistence