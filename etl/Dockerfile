FROM python:3.15-slim

WORKDIR /app
RUN pip install --no-cache-dir uv
COPY pyproject.toml uv.lock ./
COPY src ./src
RUN uv sync --locked --no-dev

ENV PYTHONPATH=/app/src
CMD ["uv", "run", "--project", ".", "sla-outbox-worker"]
