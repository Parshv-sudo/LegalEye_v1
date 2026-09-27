# LegalEye - Litigation Intelligence Engine

LegalEye is a modern legal case management and document intelligence platform. It provides automated pleading extraction, evidentiary timeline reconstruction, cross-document contradiction mapping, and a Retrieval-Augmented Generation (RAG) powered AI chat for legal matters.

## 🌟 Features

- **Matter Dashboard**: Organize litigation cases, client metadata, jurisdiction, opposing counsels, and key issues.
- **AI Document Pipeline**: Drag and drop PDF, DOCX, and TXT files. The backend ingests, parses, and chunks the documents for semantic search.
- **Ask Matter (RAG AI)**: Chat with your ingested case files. The system uses a vector search to find relevant document chunks and synthesizes an evidence-backed answer.
- **Contradiction Discovery**: Automatically analyze ingested documents for inconsistencies in statements and timelines.
- **Draft Generator**: Draft legal pleadings and notices based on the facts and evidence in the system.
- **Interactive PDF Viewer**: View citations side-by-side with the uploaded documents.

---

## 🛠 Tech Stack

### Frontend
- React.js 18 with Vite
- Tailwind CSS (for styling and modern UI)
- Axios for API requests

### Backend
- Django & Django REST Framework (DRF)
- JWT Authentication (via djangorestframework-simplejwt)
- Local SQLite (Development) / Turso libSQL (Production)
- PyMuPDF / PyPDF2 for document parsing
- Google Gemini API (for AI embeddings and generation)
- Local Vector Store for chunk retrieval

---

## 🚀 Running Locally

### Prerequisites
1. Python 3.10+
2. Node.js 18+ and npm
3. A Google Gemini API Key

### 1. Backend Setup

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure Environment Variables:
   Create a `.env` file in the `backend` directory with the following keys:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1,*
   ```
5. Apply database migrations:
   ```bash
   python manage.py migrate
   ```
6. (Optional) Create a superuser to access the admin panel:
   ```bash
   python manage.py createsuperuser
   ```
7. Run the Django development server:
   ```bash
   python manage.py runserver
   ```
   *The backend will be available at `http://127.0.0.1:8000`*

### 2. Frontend Setup

1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install Node modules:
   ```bash
   npm install
   ```
3. Configure Environment Variables (Optional):
   Create a `.env` file in the `frontend` directory if you need to override the API URL:
   ```env
   VITE_API_URL=http://127.0.0.1:8000/api/
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will be available at `http://localhost:5173`*

---

## 🌐 Deploying to Production

### Backend Deployment
You can deploy the Django backend to platforms like Render, Railway, or a VPS.
- Make sure to set `DEBUG=False` in your production `.env`.
- Set `ALLOWED_HOSTS` to your backend domain.
- Add `CORS_ALLOWED_ORIGIN_REGEXES` or `CORS_ALLOWED_ORIGINS` to accept requests from your frontend domain.
- For production databases, LegalEye is configured to use [Turso](https://turso.tech/). Set `TURSO_DB_URL` and `TURSO_AUTH_TOKEN` in your environment.

### Frontend Deployment
The React frontend can be easily deployed to Vercel, Netlify, or Cloudflare Pages.
1. Build the production application:
   ```bash
   cd frontend
   npm run build
   ```
2. Set the `VITE_API_URL` environment variable in your deployment platform to point to your deployed backend URL (e.g., `https://your-backend.com/api/`).

---

## 🔒 Authentication Note

By default, the system includes a dummy login UI for demonstration purposes, but it connects to the actual backend JWT token endpoint. To log in during development:
- **Username**: `admin`
- **Password**: (Whatever password you set when running `createsuperuser`)
