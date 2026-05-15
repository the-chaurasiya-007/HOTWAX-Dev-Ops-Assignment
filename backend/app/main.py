from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session

from .database import Base, SessionLocal, engine
from .models import Item
from .schemas import ItemCreate, ItemOut, ItemUpdate

app = FastAPI(title="Grocery Checklist")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)


def get_session() -> Session:
    return SessionLocal()


@app.get("/items", response_model=list[ItemOut])
def list_items() -> list[ItemOut]:
    with get_session() as session:
        items = session.execute(select(Item).order_by(Item.id.desc())).scalars().all()
        return items


@app.post("/items", response_model=ItemOut)
def create_item(payload: ItemCreate) -> ItemOut:
    with get_session() as session:
        item = Item(
            name=payload.name,
            notes=payload.notes,
            category=payload.category,
            status=payload.status,
            quantity=payload.quantity,
            purchase_by=payload.purchase_by,
            brand=payload.brand,
        )
        session.add(item)
        session.commit()
        session.refresh(item)
        return item


@app.put("/items/{item_id}", response_model=ItemOut)
def update_item(item_id: int, payload: ItemUpdate) -> ItemOut:
    with get_session() as session:
        item = session.get(Item, item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        item.name = payload.name
        item.notes = payload.notes
        item.category = payload.category
        item.status = payload.status
        item.quantity = payload.quantity
        item.purchase_by = payload.purchase_by
        item.brand = payload.brand
        session.commit()
        session.refresh(item)
        return item


@app.delete("/items/{item_id}")
def delete_item(item_id: int) -> dict:
    with get_session() as session:
        item = session.get(Item, item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        session.delete(item)
        session.commit()
        return {"status": "deleted"}
