import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // THE FIX: Require the package dynamically inside the function
    const pdfParse = require('pdf-parse');
    const data = await pdfParse(buffer);

    return NextResponse.json({ text: data.text });
    
  } catch (error: any) {
    console.error("PDF Extraction Error:", error);
    return NextResponse.json({ error: "Failed to read PDF file." }, { status: 500 });
  }
}