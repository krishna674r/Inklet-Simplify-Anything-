export async function extractTextFromFile(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'txt') {
    return await file.text();
  }

  if (extension === 'docx') {
    if (!window.mammoth) {
      throw new Error("Mammoth library not loaded");
    }
    const arrayBuffer = await file.arrayBuffer();
    const result = await window.mammoth.extractRawText({ arrayBuffer });
    return result.value || "";
  }

  if (extension === 'pdf') {
    if (!window.pdfjsLib) {
      throw new Error("PDF.js library not loaded");
    }
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(" ");
      fullText += pageText + "\\n";
    }
    
    return fullText;
  }

  throw new Error("Unsupported file format. Please upload .txt, .pdf, or .docx");
}
