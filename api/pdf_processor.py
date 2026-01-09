"""
PDF Processing Module
Extracts text from PDFs and chunks it
"""

import pdfplumber
from typing import List, Dict


class PDFChunk:
    """Represents a chunk of PDF text"""
    def __init__(self, content: str, page: int, chunk_index: int):
        self.content = content
        self.page = page
        self.chunk_index = chunk_index

    def to_dict(self):
        return {
            "content": self.content,
            "page": self.page,
            "chunk_index": self.chunk_index
        }


def extract_text_from_pdf(file_path: str) -> Dict[str, any]:
    """
    Extract text from PDF file
    
    Returns:
        dict with 'text' and 'pages' keys
    """
    try:
        with pdfplumber.open(file_path) as pdf:
            full_text = ""
            page_count = 0

            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    full_text += f"\n\n--- Page {page.page_number} ---\n\n{text}"
                    page_count += 1

            return {"text": full_text, "pages": page_count}
    except Exception as e:
        raise Exception(f"Failed to extract text from PDF: {str(e)}")


def chunk_text(
    text: str,
    chunk_size: int = 500,
    chunk_overlap: int = 50
) -> List[PDFChunk]:
    """
    Split text into chunks with metadata
    
    Args:
        text: Full text to chunk
        chunk_size: Maximum characters per chunk
        chunk_overlap: Overlap between chunks
    
    Returns:
        List of PDFChunk objects
    """
    chunks = []
    lines = text.split('\n')
    current_chunk = ""
    current_page = 1
    chunk_index = 0

    for line in lines:
        # Extract page number from line if present
        if "--- Page" in line and "---" in line:
            try:
                page_num = int(line.split("Page")[1].split("---")[0].strip())
                current_page = page_num
                continue
            except:
                pass

        # Add line to current chunk
        if len(current_chunk) + len(line) < chunk_size:
            current_chunk += (current_chunk and "\n" or "") + line
        else:
            # Save current chunk if it has content
            if current_chunk.strip():
                chunks.append(
                    PDFChunk(
                        content=current_chunk.strip(),
                        page=current_page,
                        chunk_index=chunk_index
                    )
                )
                chunk_index += 1

            # Start new chunk with overlap
            overlap = current_chunk[-chunk_overlap:] if len(current_chunk) > chunk_overlap else ""
            current_chunk = overlap + "\n" + line if overlap else line

    # Add final chunk
    if current_chunk.strip():
        chunks.append(
            PDFChunk(
                content=current_chunk.strip(),
                page=current_page,
                chunk_index=chunk_index
            )
        )

    return chunks


def process_pdf(file_path: str) -> List[Dict]:
    """
    Process PDF file and return chunks
    
    Args:
        file_path: Path to PDF file
    
    Returns:
        List of chunk dictionaries
    """
    # Extract text
    result = extract_text_from_pdf(file_path)
    text = result["text"]
    
    # Chunk text
    chunks = chunk_text(text, chunk_size=500, chunk_overlap=50)
    
    # Convert to dictionaries
    return [chunk.to_dict() for chunk in chunks]

