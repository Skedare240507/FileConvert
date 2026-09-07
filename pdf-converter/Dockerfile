FROM python:3.11-slim

WORKDIR /app

# Install dependencies with retry and timeout for network stability
RUN pip install --default-timeout=100 --retries 5 --no-cache-dir \
    fastapi \
    "uvicorn[standard]" \
    pdf2docx \
    python-multipart

COPY main.py .

EXPOSE 8080

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
