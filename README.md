# Personal Website Builder

A simple web app that converts a PDF resume into a clean, editable personal website. Users can upload their resume, edit parsed content, and preview a portfolio style site.

## Features

- PDF resume upload
- Automatic parsing (name, contact, experience, skills, etc.)
- Editable fields in a structured UI
- Live website preview
- Responsive layout with clean styling

## Tech Stack

- Frontend: React (Vite)
- Backend: Node.js + Express
- Parsing: Custom resume parser (regex + section detection)

## How It Works

1. Upload a PDF resume  
2. Backend extracts and parses text into structured data  
3. Frontend displays editable fields  
4. Data is rendered into a portfolio-style website preview  

## Running Locally

### Backend
```bash
cd backend
npm install
node server.js
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
