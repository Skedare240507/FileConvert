FROM python:3.11-slim

WORKDIR /app

# Install dependencies — pdf2docx pulls in pdfminer, python-docx etc.
RUN pip install --no-cache-dir \
    fastapi==0.111.0 \
    uvicorn==0.30.1 \
    pdf2docx==0.5.8 \
    python-multipart==0.0.9

COPY main.py .

EXPOSE 8080

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
