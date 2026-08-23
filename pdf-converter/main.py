"""
pdf-converter/main.py

Lightweight FastAPI service that converts PDF → DOCX using pdf2docx.

pdf2docx analyses the PDF's internal layout (text blocks, images, tables,
styles) and reconstructs a proper Word document — it produces output that
Microsoft Word can open natively, unlike LibreOffice's PDF Import which
creates a broken Draw/Impress document.

Endpoint:
  POST /convert/pdf-to-docx
    Body: multipart/form-data with field "file" (the PDF)
    Returns: application/vnd.openxmlformats-officedocument... (DOCX bytes)
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import Response
from pdf2docx import Converter
import tempfile
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("pdf-converter")

app = FastAPI(title="PDF Converter", version="1.0.0")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/convert/pdf-to-docx")
async def convert_pdf_to_docx(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    pdf_path = None
    docx_path = None

    try:
        # Write uploaded PDF to a temp file
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as pdf_tmp:
            content = await file.read()
            pdf_tmp.write(content)
            pdf_path = pdf_tmp.name

        docx_path = pdf_path.replace(".pdf", ".docx")

        logger.info(f"Converting {file.filename} ({len(content)} bytes) → DOCX")

        cv = Converter(pdf_path)
        cv.convert(docx_path, start=0, end=None)
        cv.close()

        with open(docx_path, "rb") as f:
            docx_bytes = f.read()

        logger.info(f"Conversion complete — output {len(docx_bytes)} bytes")

        return Response(
            content=docx_bytes,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": 'attachment; filename="output.docx"'},
        )

    except Exception as e:
        logger.error(f"Conversion failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if pdf_path and os.path.exists(pdf_path):
            os.unlink(pdf_path)
        if docx_path and os.path.exists(docx_path):
            os.unlink(docx_path)
