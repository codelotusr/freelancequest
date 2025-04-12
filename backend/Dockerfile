FROM python:3.13

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

COPY pyproject.toml poetry.lock ./
RUN pip install --upgrade pip && \
	pip install poetry && \
	poetry config virtualenvs.create false && \
	poetry install --no-root

COPY . .

# Run Daphne server (ASGI)
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "freelancequest.asgi:application"]

