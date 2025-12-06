from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from models.base import Base, engine
from controllers import (
    auth_router,
    products_router,
    cart_router,
    orders_router,
    admin_router
)

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="HommeIN API",
    description="E-commerce API for HommeIN fashion store",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(auth_router)
app.include_router(products_router)
app.include_router(cart_router)
app.include_router(orders_router)
app.include_router(admin_router)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Serve HTML templates
@app.get("/")
async def read_root():
    """Serve homepage"""
    return FileResponse("templates/index.html")

@app.get("/products")
async def read_products():
    """Serve products page"""
    return FileResponse("templates/products.html")

@app.get("/product/{product_id}")
async def read_product_detail(product_id: int):
    """Serve product detail page"""
    return FileResponse("templates/product-detail.html")

@app.get("/cart")
async def read_cart():
    """Serve cart page"""
    return FileResponse("templates/cart.html")

@app.get("/checkout")
async def read_checkout():
    """Serve checkout page"""
    return FileResponse("templates/checkout.html")

@app.get("/account")
async def read_account():
    """Serve account page"""
    return FileResponse("templates/account.html")

@app.get("/admin")
async def read_admin():
    """Serve admin panel"""
    return FileResponse("templates/admin.html")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
