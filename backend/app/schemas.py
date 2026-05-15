from datetime import date
from typing import Optional

from pydantic import BaseModel


class ItemBase(BaseModel):
    name: str
    notes: Optional[str] = None
    category: str = "pantry"
    status: str = "needed"
    quantity: int = 1
    purchase_by: Optional[date] = None
    brand: Optional[str] = None


class ItemCreate(ItemBase):
    pass


class ItemUpdate(ItemBase):
    pass


class ItemOut(ItemBase):
    id: int

    class Config:
        from_attributes = True
