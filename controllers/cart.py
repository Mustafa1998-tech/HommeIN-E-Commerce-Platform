from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from models.base import get_db
from models.user import User
from models.cart import Cart, CartItem
from models.product import Product
from controllers.auth import get_current_user

router = APIRouter(prefix="/api/cart", tags=["Shopping Cart"])


# Pydantic schemas
class AddToCartRequest(BaseModel):
    product_id: int
    quantity: int = 1
    size: Optional[str] = None
    color: Optional[str] = None


class UpdateCartItemRequest(BaseModel):
    quantity: int


class CartItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    product_image: Optional[str]
    quantity: int
    size: Optional[str]
    color: Optional[str]
    price: float
    subtotal: float


class CartResponse(BaseModel):
    items: List[CartItemResponse]
    total: float
    items_count: int


@router.get("/", response_model=CartResponse)
async def get_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's shopping cart"""
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    
    if not cart:
        # Create cart if it doesn't exist
        cart = Cart(user_id=current_user.id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    
    items_response = []
    total = 0.0
    
    for item in cart.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            subtotal = item.price * item.quantity
            total += subtotal
            
            items_response.append({
                "id": item.id,
                "product_id": item.product_id,
                "product_name": product.name,
                "product_image": product.image_url,
                "quantity": item.quantity,
                "size": item.size,
                "color": item.color,
                "price": item.price,
                "subtotal": subtotal
            })
    
    return {
        "items": items_response,
        "total": total,
        "items_count": len(items_response)
    }


@router.post("/items", status_code=status.HTTP_201_CREATED)
async def add_to_cart(
    item_data: AddToCartRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add item to shopping cart"""
    # Get or create cart
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart:
        cart = Cart(user_id=current_user.id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    
    # Get product
    product = db.query(Product).filter(Product.id == item_data.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if not product.is_available:
        raise HTTPException(status_code=400, detail="Product is not available")
    
    if product.stock_quantity < item_data.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    
    # Check if item already exists in cart
    existing_item = db.query(CartItem).filter(
        CartItem.cart_id == cart.id,
        CartItem.product_id == item_data.product_id,
        CartItem.size == item_data.size,
        CartItem.color == item_data.color
    ).first()
    
    if existing_item:
        # Update quantity
        existing_item.quantity += item_data.quantity
        db.commit()
        return {"message": "Cart updated", "item_id": existing_item.id}
    else:
        # Create new cart item
        cart_item = CartItem(
            cart_id=cart.id,
            product_id=item_data.product_id,
            quantity=item_data.quantity,
            size=item_data.size,
            color=item_data.color,
            price=product.sale_price if product.sale_price else product.price
        )
        db.add(cart_item)
        db.commit()
        db.refresh(cart_item)
        
        return {"message": "Item added to cart", "item_id": cart_item.id}


@router.put("/items/{item_id}")
async def update_cart_item(
    item_id: int,
    update_data: UpdateCartItemRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update cart item quantity"""
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    cart_item = db.query(CartItem).filter(
        CartItem.id == item_id,
        CartItem.cart_id == cart.id
    ).first()
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    if update_data.quantity <= 0:
        db.delete(cart_item)
    else:
        # Check stock
        product = db.query(Product).filter(Product.id == cart_item.product_id).first()
        if product and product.stock_quantity < update_data.quantity:
            raise HTTPException(status_code=400, detail="Insufficient stock")
        
        cart_item.quantity = update_data.quantity
    
    db.commit()
    return {"message": "Cart item updated"}


@router.delete("/items/{item_id}")
async def remove_from_cart(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove item from cart"""
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    cart_item = db.query(CartItem).filter(
        CartItem.id == item_id,
        CartItem.cart_id == cart.id
    ).first()
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    db.delete(cart_item)
    db.commit()
    
    return {"message": "Item removed from cart"}


@router.delete("/clear")
async def clear_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Clear all items from cart"""
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if cart:
        for item in cart.items:
            db.delete(item)
        db.commit()
    
    return {"message": "Cart cleared"}
