from sqlalchemy import Date, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


class Item(Base):
    __tablename__ = "items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    category: Mapped[str] = mapped_column(String(30), nullable=False, default="pantry")
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="needed")
    quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    purchase_by: Mapped[Date | None] = mapped_column(Date, nullable=True)
    brand: Mapped[str | None] = mapped_column(String(100), nullable=True)
