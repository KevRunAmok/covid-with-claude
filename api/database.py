import psycopg2
import psycopg2.extras
from contextlib import contextmanager

DB_CONFIG = {
    "host": "localhost",
    "port": 5433,
    "database": "covid19",
    "user": "postgres",
    "password": "claudeapp",
}


@contextmanager
def get_cursor():
    conn = psycopg2.connect(**DB_CONFIG)
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            yield cur
    finally:
        conn.close()
