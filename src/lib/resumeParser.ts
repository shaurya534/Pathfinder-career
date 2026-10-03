/**
 * Extracts plain text from an uploaded resume file (PDF or DOCX).
 * Both libraries run server-side only — this must never be imported in a
 * client component.
 */
export async function extractResumeText(
  buffer: Buffer,
  fileName: string
): Promise<string> {
  const lower = fileName.toLowerCase();

  if (lower.endsWith(".pdf")) {
    const pdfParse = (await import("pdf-parse")).default;
    const result = await pdfParse(buffer);
    return result.text;
  }

  if (lower.endsWith(".docx")) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  // Fallback: treat as plain text.
  return buffer.toString("utf-8");
}
