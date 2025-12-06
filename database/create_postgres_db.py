import psycopg2
from psycopg2 import sql

# Test Application Credentials
APP_USER = "hommein@1990"
APP_PASSWORD = "hommein@1998"
APP_DB_NAME = "hommein"
DB_HOST = "localhost"
DB_PORT = "5432"

def test_connection():
    """Test connection with application credentials"""
    print(f"Testing connection for user '{APP_USER}' to database '{APP_DB_NAME}'...")
    try:
        conn = psycopg2.connect(
            dbname=APP_DB_NAME,
            user=APP_USER,
            password=APP_PASSWORD,
            host=DB_HOST,
            port=DB_PORT
        )
        print("[OK] Connection successful!")
        conn.close()
        return True
    except psycopg2.Error as e:
        print(f"[ERROR] Connection failed: {e}")
        return False

if __name__ == "__main__":
    test_connection()
