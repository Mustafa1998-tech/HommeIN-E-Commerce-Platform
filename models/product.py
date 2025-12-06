from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from models.base import Base


class Category(Base):
    """Product category model"""
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(Text)
    image_url = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    products = relationship("Product", back_populates="category")

    def __repr__(self):
        return f"<Category {self.name}>"


class Product(Base):
    """Product model for e-commerce items"""
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(Text)
    price = Column(Float, nullable=False)
    sale_price = Column(Float)
    category_id = Column(Integer, ForeignKey("categories.id"))
    
    # Product details
    image_url = Column(String)
    images = Column(Text)  # JSON string of multiple images
    sizes = Column(String)  # JSON string: ["S", "M", "L", "XL"]
    colors = Column(String)  # JSON string: ["Red", "Blue", "Black"]
    
    # Inventory
    stock_quantity = Column(Integer, default=0)
    is_available = Column(Boolean, default=True)
    
    # Metadata
    sku = Column(String, unique=True)
    brand = Column(String)
    rating = Column(Float, default=0.0)
    reviews_count = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    category = relationship("Category", back_populates="products")
    cart_items = relationship("CartItem", back_populates="product")
    order_items = relationship("OrderItem", back_populates="product")

    def __repr__(self):
        return f"<Product {self.name}>"
