from controllers.auth import router as auth_router
from controllers.products import router as products_router
from controllers.cart import router as cart_router
from controllers.orders import router as orders_router
from controllers.admin import router as admin_router

__all__ = [
    "auth_router",
    "products_router",
    "cart_router",
    "orders_router",
    "admin_router",
]
