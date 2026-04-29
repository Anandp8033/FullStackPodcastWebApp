# FullStackPodcastWebApp

A full-stack podcast web application with FastAPI backend and vanilla JavaScript frontend.

## Project Overview

This is a podcast management and playback platform consisting of:
- **Backend**: FastAPI-based REST API with authentication, admin panel, and podcast management
- **Frontend Admin**: Internal user admin interface for uploading and managing podcasts
- **Frontend Player**: Public podcast player with subtitle support

## Project Structure

```
FullStackPodcastWebApp/
├── fastapi-auth-app/          # FastAPI Backend
│   ├── requirements.txt       # Python dependencies
│   ├── run.py  
|   ├── uploads/                    # Uploaded media storage
    │   ├── audio/
    │   ├── images/
    │   └── subtitles/               # Application entry point
│   └── app/
│       ├── main.py            # FastAPI app configuration
│       ├── api/               # API route handlers
│       │   ├── admin.py       # Admin endpoints
│       │   ├── auth.py        # Authentication endpoints
│       │   └── podcast.py    # Podcast endpoints
│       ├── core/
│       │   └── security.py    # Security utilities (JWT, hashing)
│       ├── crud/              # Database operations
│       │   ├── admin.py
│       │   ├── podcast.py
│       │   └── user.py
│       ├── db/
│       │   └── database.py   # Database connection
│       ├── models/            # SQLAlchemy models
│       │   ├── admin.py
│       │   ├── podcast.py
│       │   └── user.py
│       ├── schemas/           # Pydantic schemas
│       │   ├── admin.py
│       │   ├── podcast.py
│       │   └── user.py
│       └── services/          # Business logic
│           ├── admin_services.py
│           ├── auth_services.py
│           └── podcast_service.py
│
├── FrontEndInternalUserAdmin/  # Internal Admin Frontend
│   ├── index.html             # Admin dashboard
│   ├── upload.html           # Podcast upload page
│   ├── package.json
│   ├── vite.config.js
│   ├── css/
│   │   └── style.css
│   └── src/
│       ├── main.js
│       └── upload.js
│
├── FrontEndPodCastPlayer/      # Public Podcast Player
│   ├── podcast.html           # Player interface
|   |── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── css/
│   │   ├── style.css
│   │   └── autthPage.css
│   ├── public/
│   │   ├── episodes.json      # Episode data
│   │   ├── Audio/             # Podcast audio files
│   │   ├── images/           # Podcast artwork
│   │   └── subtitles/         # VTT subtitle files
│   └── src/
│       ├── main.js
│       ├── podcast.js
│       └── podcast_1.js
│
│
└── README.md
```

## Features

### Backend (FastAPI)
- **Authentication**: JWT-based authentication with secure password hashing
- **User Management**: Admin and user role-based access control
- **Podcast Management**: CRUD operations for podcasts
- **File Upload**: Support for audio, images, and subtitle uploads
- **Subtitle Support**: Multi-language VTT subtitle files

### Frontend Admin
- Dashboard for managing podcasts
- Upload interface for media files
- User administration panel

### Frontend Player
- Podcast episode playback
- Multi-language subtitle support (English, Spanish, French, German)
- Responsive design

## Technology Stack

| Layer | Technology |
|-------|------------|
| Backend | FastAPI, Python |
| Database | SQLAlchemy (configurable) |
| Authentication | JWT, Passlib |
| Frontend | Vanilla JavaScript, Vite |
| Styling | CSS |

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd fastapi-auth-app
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the application:
```bash
python run.py
```

The API will be available at `http://localhost:8000`

### Frontend Setup

#### Internal Admin
```bash
cd FrontEndInternalUserAdmin
npm install
npm run dev
```

#### Podcast Player
```bash
cd FrontEndPodCastPlayer
npm install
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token

### Podcasts
- `GET /api/podcast/` - List all podcasts
- `GET /api/podcast/{id}` - Get podcast details
- `POST /api/podcast/` - Create podcast (admin)
- `PUT /api/podcast/{id}` - Update podcast (admin)
- `DELETE /api/podcast/{id}` - Delete podcast (admin)

### Admin
- `GET /api/admin/users` - List all users
- `PUT /api/admin/user/{id}` - Update user
- `DELETE /api/admin/user/{id}` - Delete user

## Subtitle Support

The application supports VTT subtitles in multiple languages:
- English (`_en.vtt`)
- Spanish (`_es.vtt`)
- French (`_fr.vtt`)
- German (`_de.vtt`)

## License

MIT
