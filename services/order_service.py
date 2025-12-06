from sqlalchemy.orm import Session
from typing import List
from models.order import Order, OrderItem, OrderStatus
from models.cart import Cart
from models.product import Product
from datetime import datetime
import secrets


class OrderService:
    """Business logic for order operations"""
    
    @staticmethod
    def generate_order_number() -> str:
        """Generate a unique order number"""
        timestamp = datetime.now().strftime("%Y%m%d")
        random_part = secrets.token_hex(4).upper()
        return f"HMN-{timestamp}-{random_part}"
    
    @staticmethod
    def create_order_from_cart(
        db: Session,
        user_id: int,
        shipping_address: str,
        shipping_city: str,
        shipping_postal_code: str,
        shipping_country: str,
        phone: str,
        payment_method: str = "cash_on_delivery"
    ) -> Order:
        """Create an order from user's cart"""
        # Get user's cart
        cart = db.query(Cart).filter(Cart.user_id == user_id).first()
        if not cart or not cart.items:
            raise ValueError("Cart is empty")
        
        # Calculate total
        total_amount = sum(item.price * item.quantity for item in cart.items)
        
        # Create order
        order = Order(
            user_id=user_id,
            order_number=OrderService.generate_order_number(),
            total_amount=total_amount,
            shipping_address=shipping_address,
            shipping_city=shipping_city,
            shipping_postal_code=shipping_postal_code,
            shipping_country=shipping_country,
            phone=phone,
            payment_method=payment_method,
            status=OrderStatus.PENDING
        )
        db.add(order)
        db.flush()  # Get order ID
        
        # Create order items from cart items
        for cart_item in cart.items:
            order_item = OrderItem(
                order_id=order.id,
                product_id=cart_item.product_id,
                quantity=cart_item.quantity,
                size=cart_item.size,
                color=cart_item.color,
                price=cart_item.price
            )
            db.add(order_item)
            
            # Update product stock
            product = db.query(Product).filter(Product.id == cart_item.product_id).first()
            if product:
                product.stock_quantity -= cart_item.quantity
                if product.stock_quantity <= 0:
                    product.is_available = False
        
        # Clear cart
        for item in cart.items:
            db.delete(item)
        
        db.commit()
        db.refresh(order)
        
        return order
    
    @staticmethod
    def get_user_orders(db: Session, user_id: int) -> List[Order]:
        """Get all orders for a user"""
        return db.query(Order).filter(Order.user_id == user_id).order_by(Order.created_at.desc()).all()
    
    @staticmethod
    def get_order_by_id(db: Session, order_id: int, user_id: int = None) -> Order:
        """Get an order by ID, optionally filtered by user"""
        query = db.query(Order).filter(Order.id == order_id)
        if user_id:
            query = query.filter(Order.user_id == user_id)
        return query.first()
    
    @staticmethod
    def update_order_status(db: Session, order_id: int, status: OrderStatus) -> Order:
        """Update order status"""
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise ValueError("Order not found")
        
        order.status = status
        db.commit()
        db.refresh(order)
        
        return order
