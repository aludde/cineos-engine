import { NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';

export async function POST(request: Request) {
  try {
    // 1. Grab the raw file from the request
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 2. Convert the file into a Node.js Buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // 3. Extract the text
    const data = await pdfParse(buffer);

    // 4. Send the raw text back to the frontend
    return NextResponse.json({ text: data.text });
    
  } catch (error: any) {
    console.error("PDF Extraction Error:", error);
    return NextResponse.json({ error: "Failed to read PDF file. Make sure it is a valid text-based PDF." }, { status: 500 });
  }
}