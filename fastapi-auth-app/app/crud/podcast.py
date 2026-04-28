# app/crud/podcast.py

from sqlalchemy.orm import Session
from app.models.podcast import Podcast

def create_podcast(db: Session, data: dict):
    podcast = Podcast(**data)
    db.add(podcast)
    db.commit()
    db.refresh(podcast)
    return podcast