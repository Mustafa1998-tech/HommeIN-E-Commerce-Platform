from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from models.base import get_db
from models.user import User
from models.order import Order, OrderItem, OrderStatus
from services.order_service import OrderService
from controllers.auth import get_current_user

router = APIRouter(prefix="/api/orders", tags=["Orders"])


# Pydantic schemas
class CreateOrderRequest(BaseModel):
    shipping_address: str
    shipping_city: str
    shipping_postal_code: str
    shipping_country: str
    phone: str
    payment_method: str = "cash_on_delivery"
    notes: Optional[str] = None


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    quantity: int
    size: Optional[str]
    color: Optional[str]
    price: float
    
    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: int
    order_number: str
    status: str
    total_amount: float
    shipping_address: str
    shipping_city: str
    shipping_postal_code: str
    shipping_country: str
    phone: str
    payment_method: str
    payment_status: str
    notes: Optional[str]
    created_at: str
    
    class Config:
        from_attributes = True


class OrderDetailResponse(OrderResponse):
    items: List[dict]


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_data: CreateOrderRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new order from cart"""
    try:
        order = OrderService.create_order_from_cart(
            db=db,
            user_id=current_user.id,
            shipping_address=order_data.shipping_address,
            shipping_city=order_data.shipping_city,
            shipping_postal_code=order_data.shipping_postal_code,
            shipping_country=order_data.shipping_country,
            phone=order_data.phone,
            payment_method=order_data.payment_method
        )
        
        if order_data.notes:
            order.notes = order_data.notes
            db.commit()
        
        return order
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=List[OrderResponse])
async def get_my_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all orders for current user"""
    orders = OrderService.get_user_orders(db, current_user.id)
    return orders


@router.get("/{order_id}", response_model=OrderDetailResponse)
async def get_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get order details"""
    order = OrderService.get_order_by_id(db, order_id, current_user.id)
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Build items response
    items = []
    for item in order.items:
        items.append({
            "id": item.id,
            "product_id": item.product_id,
            "product_name": item.product.name if item.product else "Unknown",
            "quantity": item.quantity,
            "size": item.size,
            "color": item.color,
            "price": item.price,
            "subtotal": item.price * item.quantity
        })
    
    return {
        **order.__dict__,
        "items": items,
        "created_at": order.created_at.isoformat()
    }
