import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const PDFParser = require('pdf2json');
    
    // THE FIX: Tell TypeScript this Promise specifically resolves to a NextResponse
    return new Promise<NextResponse>((resolve) => {
      const pdfParser = new PDFParser(null, 1);
      
      pdfParser.on("pdfParser_dataError", (errData: any) => {
        console.error("PDF Parsing Error:", errData.parserError);
        resolve(NextResponse.json({ error: "Failed to parse PDF format." }, { status: 500 }));
      });
      
      pdfParser.on("pdfParser_dataReady", () => {
        const text = pdfParser.getRawTextContent();
        resolve(NextResponse.json({ text }));
      });
      
      pdfParser.parseBuffer(buffer);
    });
    
  } catch (error: any) {
    console.error("Extraction Setup Error:", error);
    return NextResponse.json({ error: "Failed to initialize PDF reader." }, { status: 500 });
  }
}