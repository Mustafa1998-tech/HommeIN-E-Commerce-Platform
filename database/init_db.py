# -*- coding: utf-8 -*-
"""
Database initialization script
Creates tables and populates with sample data
"""
import sys
import json
from models.base import Base, engine, SessionLocal
from models.user import User
from models.product import Product, Category
from models.cart import Cart
from models.order import Order, OrderItem
from services.auth_service import AuthService


def init_database():
    """Initialize database with tables and sample data"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("[OK] Tables created successfully")

    db = SessionLocal()
    
    try:
        # Check if data already exists
        if db.query(User).first():
            print("Database already initialized with data")
            return

        print("\nCreating sample data...")

        # Create admin user
        admin = User(
            email="admin@hommein.com",
            username="admin",
            hashed_password=AuthService.get_password_hash("admin123"),
            full_name="Admin User",
            is_admin=True
        )
        db.add(admin)
        print("[OK] Admin user created (username: admin, password: admin123)")

        # Create test user
        user = User(
            email="user@example.com",
            username="user",
            hashed_password=AuthService.get_password_hash("user123"),
            full_name="Test User",
            phone="+20 123 456 7890"
        )
        db.add(user)
        print("[OK] Test user created (username: user, password: user123)")

        db.commit()

        # Create carts for users
        admin_cart = Cart(user_id=admin.id)
        user_cart = Cart(user_id=user.id)
        db.add(admin_cart)
        db.add(user_cart)
        db.commit()

        # Create categories
        categories_data = [
            {"name": "Shirts", "description": "Men's shirts", "image_url": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500"},
            {"name": "Pants", "description": "Men's pants", "image_url": "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500"},
            {"name": "Jackets", "description": "Jackets and coats", "image_url": "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500"},
            {"name": "Shoes", "description": "Men's shoes", "image_url": "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500"},
        ]

        categories = []
        for cat_data in categories_data:
            category = Category(**cat_data)
            db.add(category)
            categories.append(category)
        
        db.commit()
        print(f"[OK] Created {len(categories)} categories")

        # Create sample products
        products_data = [
            {
                "name": "White Cotton Shirt",
                "description": "High quality cotton shirt suitable for formal occasions",
                "price": 299.99,
                "sale_price": 249.99,
                "category_id": categories[0].id,
                "image_url": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500",
                "sizes": "S,M,L,XL,XXL",
                "colors": "White,Blue,Black",
                "stock_quantity": 50,
                "sku": "SHT-001",
                "brand": "HommeIN",
                "rating": 4.5,
                "reviews_count": 12
            },
            {
                "name": "Blue Jeans",
                "description": "Classic jeans with comfortable fit",
                "price": 499.99,
                "category_id": categories[1].id,
                "image_url": "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500",
                "sizes": "28,30,32,34,36,38",
                "colors": "Blue,Black",
                "stock_quantity": 30,
                "sku": "PNT-001",
                "brand": "HommeIN",
                "rating": 4.8,
                "reviews_count": 25
            },
            {
                "name": "Brown Leather Jacket",
                "description": "Premium natural leather jacket",
                "price": 1299.99,
                "sale_price": 999.99,
                "category_id": categories[2].id,
                "image_url": "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500",
                "sizes": "M,L,XL",
                "colors": "Brown,Black",
                "stock_quantity": 15,
                "sku": "JKT-001",
                "brand": "Premium",
                "rating": 4.9,
                "reviews_count": 8
            },
            {
                "name": "Black Sneakers",
                "description": "Comfortable sneakers for daily use",
                "price": 599.99,
                "category_id": categories[3].id,
                "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
                "sizes": "40,41,42,43,44,45",
                "colors": "Black,White,Gray",
                "stock_quantity": 40,
                "sku": "SHO-001",
                "brand": "SportMax",
                "rating": 4.6,
                "reviews_count": 18
            },
            {
                "name": "Casual Striped Shirt",
                "description": "Casual shirt with modern design",
                "price": 349.99,
                "category_id": categories[0].id,
                "image_url": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500",
                "sizes": "S,M,L,XL",
                "colors": "Blue,Gray",
                "stock_quantity": 35,
                "sku": "SHT-002",
                "brand": "HommeIN",
                "rating": 4.3,
                "reviews_count": 9
            },
            {
                "name": "Classic Gray Pants",
                "description": "Elegant formal pants",
                "price": 449.99,
                "category_id": categories[1].id,
                "image_url": "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500",
                "sizes": "28,30,32,34,36",
                "colors": "Gray,Black,Beige",
                "stock_quantity": 25,
                "sku": "PNT-002",
                "brand": "Elegance",
                "rating": 4.7,
                "reviews_count": 14
            },
        ]

        for prod_data in products_data:
            product = Product(**prod_data)
            db.add(product)
        
        db.commit()
        print(f"[OK] Created {len(products_data)} sample products")

        print("\n" + "="*50)
        print("Database initialized successfully!")
        print("="*50)
        print("\nAdmin credentials:")
        print("  Username: admin")
        print("  Password: admin123")
        print("  URL: http://localhost:8000/admin")
        print("\nTest user credentials:")
        print("  Username: user")
        print("  Password: user123")
        print("\nYou can now run the server with:")
        print("  uvicorn main:app --reload")
        print("="*50)

    except Exception as e:
        print(f"Error initializing database: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    init_database()
