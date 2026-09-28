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
    Query params:
      image_dpi  (int, default 150) — DPI for embedded images (lower = smaller file)
      multi_page (bool, default true) — extract all pages
    Returns: application/vnd.openxmlformats-officedocument... (DOCX bytes)
"""

from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.responses import Response
from pdf2docx import Converter
import tempfile
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("pdf-converter")

app = FastAPI(title="PDF Converter", version="1.1.0")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/convert/pdf-to-docx")
async def convert_pdf_to_docx(
    file: UploadFile = File(...),
    image_dpi: int = Query(default=150, ge=72, le=300, description="DPI for embedded images — lower reduces file size"),
    image_quality: int = Query(default=80, ge=10, le=100, description="JPEG quality for embedded images (10-100)"),
):
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

        logger.info(f"Converting {file.filename} ({len(content)} bytes) → DOCX "
                    f"[image_dpi={image_dpi}, image_quality={image_quality}]")

        cv = Converter(pdf_path)

        # pdf2docx conversion settings:
        #  - connected_border_tolerance: tighter table border detection
        #  - min_section_height: avoids creating spurious paragraph breaks
        #  - image_exportable: include images
        #  - image_dpi: controls embedded image resolution (affects file size)
        #  - image_quality: JPEG compression for embedded images
        cv.convert(
            docx_path,
            start=0,
            end=None,
            connected_border_tolerance=0.5,   # tighter table cell merging
            min_section_height=20,            # suppress tiny phantom sections
            image_exportable=True,
            image_dpi=image_dpi,
            image_quality=image_quality,
        )
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
        # Surface the pdf2docx 'No parsed pages' error as a human-readable message
        detail = str(e)
        if "No parsed pages" in detail or "no pages" in detail.lower():
            detail = (
                "This PDF appears to be scanned or has no extractable text. "
                "Please use the OCR feature to convert it to a Word document."
            )
        raise HTTPException(status_code=500, detail=detail)

    finally:
        if pdf_path and os.path.exists(pdf_path):
            os.unlink(pdf_path)
        if docx_path and os.path.exists(docx_path):
            os.unlink(docx_path)
