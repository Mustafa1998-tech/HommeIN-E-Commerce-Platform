from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List, Optional
from models.product import Product, Category


class ProductService:
    """Business logic for product operations"""
    
    @staticmethod
    def get_products(
        db: Session,
        skip: int = 0,
        limit: int = 20,
        category_id: Optional[int] = None,
        search: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        sort_by: str = "created_at"
    ) -> List[Product]:
        """Get products with filtering and pagination"""
        query = db.query(Product).filter(Product.is_available == True)
        
        # Apply filters
        if category_id:
            query = query.filter(Product.category_id == category_id)
        
        if search:
            query = query.filter(
                or_(
                    Product.name.ilike(f"%{search}%"),
                    Product.description.ilike(f"%{search}%")
                )
            )
        
        if min_price is not None:
            query = query.filter(Product.price >= min_price)
        
        if max_price is not None:
            query = query.filter(Product.price <= max_price)
        
        # Apply sorting
        if sort_by == "price_asc":
            query = query.order_by(Product.price.asc())
        elif sort_by == "price_desc":
            query = query.order_by(Product.price.desc())
        elif sort_by == "name":
            query = query.order_by(Product.name.asc())
        elif sort_by == "rating":
            query = query.order_by(Product.rating.desc())
        else:
            query = query.order_by(Product.created_at.desc())
        
        return query.offset(skip).limit(limit).all()
    
    @staticmethod
    def get_product_by_id(db: Session, product_id: int) -> Optional[Product]:
        """Get a single product by ID"""
        return db.query(Product).filter(Product.id == product_id).first()
    
    @staticmethod
    def update_stock(db: Session, product_id: int, quantity_change: int) -> bool:
        """Update product stock quantity"""
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            return False
        
        new_quantity = product.stock_quantity + quantity_change
        if new_quantity < 0:
            return False
        
        product.stock_quantity = new_quantity
        product.is_available = new_quantity > 0
        db.commit()
        
        return True
    
    @staticmethod
    def get_categories(db: Session) -> List[Category]:
        """Get all categories"""
        return db.query(Category).all()
