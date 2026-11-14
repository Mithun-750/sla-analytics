FROM python:3.15-slim

WORKDIR /app
RUN pip install --no-cache-dir uv
COPY initial-data ./initial-data
COPY scripts ./scripts
COPY etl/sql ./etl/sql
RUN uv pip install --system "psycopg[binary]>=3.3.8" "python-dotenv>=1.2.4"

CMD ["sh", "-c", "python initial-data/generate.py --output data/generated && python initial-data/load.py --input data/generated"]
