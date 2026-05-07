"""
Converts MySQL dump to PostgreSQL and imports it.
Usage: python import_data.py
"""
import subprocess
import sys
import re

DATA_FILE = r"c:\Users\runya\Claude Code\Covid with Claude App\Data\Dump20230211-BDataOnly.sql"
DB_NAME = "covid19"
DB_USER = "postgres"
DB_HOST = "localhost"
DB_PORT = "5433"

SKIP_RE = re.compile(
    r"^(/\*|--|SET |LOCK TABLES|UNLOCK TABLES|START TRANSACTION|COMMIT|USE |ALTER TABLE|CREATE DATABASE|$)"
)


def convert_line(line: str) -> str | None:
    stripped = line.strip()
    if not stripped or SKIP_RE.match(stripped):
        return None
    # Strip backtick identifiers
    stripped = stripped.replace("`", "")
    # Convert MySQL escaped quotes to PostgreSQL style
    stripped = stripped.replace("\\'", "''")
    return stripped


def main():
    psql = subprocess.Popen(
        ["psql", "-U", DB_USER, "-h", DB_HOST, "-p", DB_PORT, "-d", DB_NAME,
         "--set=ON_ERROR_STOP=0"],
        stdin=subprocess.PIPE,
        text=True,
        encoding="utf-8",
    )

    # Disable FK checks so tables can load in any order
    psql.stdin.write("SET session_replication_role = 'replica';\n")

    print("Importing data... this will take several minutes for 586MB.")
    count = 0
    errors = 0
    with open(DATA_FILE, encoding="utf-8", errors="replace") as f:
        for line in f:
            converted = convert_line(line)
            if converted:
                try:
                    psql.stdin.write(converted + "\n")
                    count += 1
                    if count % 1_000 == 0:
                        print(f"  {count:,} statements written...", flush=True)
                except BrokenPipeError:
                    print("psql pipe closed unexpectedly.")
                    break

    psql.stdin.write("SET session_replication_role = 'DEFAULT';\n")
    psql.stdin.close()
    returncode = psql.wait()
    print(f"Done. {count:,} statements sent. psql exit code: {returncode}")
    return returncode


if __name__ == "__main__":
    sys.exit(main())
