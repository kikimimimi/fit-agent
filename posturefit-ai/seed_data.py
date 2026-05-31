from database import init_db
from recommendation_engine import EXERCISES


if __name__ == "__main__":
    init_db()
    print(f"Database ready. Built-in exercise library contains {len(EXERCISES)} exercises.")
