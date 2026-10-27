# Linkedout

A modern platform where employees share the **real reasons** they quit toxic jobs.

Built with **Next.js 15** (frontend) + **Django REST Framework** (backend).

## Features

### Core
- Dark & light mode
- User authentication (JWT)
- Create posts (anonymous or named)
- Company tagging (anonymous option)
- Reason categories
- Like, comment, repost, and **bookmark**
- Nested comment replies with likes
- Search & filter by company / reason
- Sorting (Newest, Top, Most Discussed)

### Social
- User profiles
- Follow / unfollow users
- Followers & following counts
- Notifications (likes, comments, reposts, follows)
- Edit profile (bio, company, name)
- Post detail with full interaction

### Extra
- Company aggregation endpoint
- Owner can delete own posts
- Responsive mobile-first design
- Clean professional UI with red accents

## Tech Stack

**Frontend**
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Lucide icons
- Client-side theme toggle

**Backend**
- Django 5.1
- Django REST Framework
- SimpleJWT
- SQLite (dev)

## Setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

## New API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/posts/{id}/bookmark/` | Toggle bookmark |
| POST | `/api/users/{id}/follow/` | Toggle follow |
| GET | `/api/users/{id}/posts/` | User's posts |
| PATCH | `/api/users/update_profile/` | Update profile |
| GET | `/api/notifications/` | List notifications |
| POST | `/api/notifications/mark_read/` | Mark all read |
| GET | `/api/posts/?sort=top` | Sort options |
| GET | `/api/posts/companies/` | Top companies |

## Design Notes

- Full light/dark mode support
- Professional card-based feed
- Nested replies with visual indentation
- Clear interaction states (liked, bookmarked, following)
- Mobile-first and responsive

This is a complete, feature-rich MVP ready for further customization or deployment.
