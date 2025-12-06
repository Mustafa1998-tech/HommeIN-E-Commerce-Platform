from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from models.base import get_db
from models.product import Product, Category
from services.product_service import ProductService

router = APIRouter(prefix="/api/products", tags=["Products"])


# Pydantic schemas
class CategoryResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    image_url: Optional[str]
    
    class Config:
        from_attributes = True


class ProductResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    price: float
    sale_price: Optional[float]
    category_id: Optional[int]
    image_url: Optional[str]
    images: Optional[str]
    sizes: Optional[str]
    colors: Optional[str]
    stock_quantity: int
    is_available: bool
    sku: Optional[str]
    brand: Optional[str]
    rating: float
    reviews_count: int
    
    class Config:
        from_attributes = True


@router.get("/", response_model=List[ProductResponse])
async def get_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort_by: str = Query("created_at", regex="^(created_at|price_asc|price_desc|name|rating)$"),
    db: Session = Depends(get_db)
):
    """Get products with filtering and pagination"""
    products = ProductService.get_products(
        db=db,
        skip=skip,
        limit=limit,
        category_id=category_id,
        search=search,
        min_price=min_price,
        max_price=max_price,
        sort_by=sort_by
    )
    return products


@router.get("/categories", response_model=List[CategoryResponse])
async def get_categories(db: Session = Depends(get_db)):
    """Get all product categories"""
    categories = ProductService.get_categories(db)
    return categories


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get a single product by ID"""
    product = ProductService.get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product
