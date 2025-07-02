import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from app.core.config import get_settings

def create_database_if_not_exists():
    settings = get_settings()

    dbname = settings.database
    user = settings.db_user
    password = settings.db_password
    host = settings.db_host
    port = settings.db_port

    try:
        # Connect to the default "postgres" DB
        con = psycopg2.connect(
            dbname="postgres",
            user=user,
            password=password,
            host=host,
            port=port,
        )
        con.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)

        cur = con.cursor()
        cur.execute(f"SELECT 1 FROM pg_database WHERE datname = %s", (dbname,))
        exists = cur.fetchone()

        if not exists:
            print(f"🛠️ Creating database '{dbname}'...")
            cur.execute(f'CREATE DATABASE "{dbname}"')
        else:
            print(f"✅ Database '{dbname}' already exists.")

        cur.close()
        con.close()
    except Exception as e:
        print(f"❌ Error checking/creating database: {e}")
