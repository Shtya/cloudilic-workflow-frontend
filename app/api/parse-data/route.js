import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import PDFParser from 'pdf2json';
import os from 'os';

export async function POST(req) {
  const formData = await req.formData();
  const uploadedFiles = formData.getAll('FILE');
  let fileName = '';
  let parsedText = '';

  if (uploadedFiles && uploadedFiles.length > 0) {
    const uploadedFile = uploadedFiles[0];
    console.log('Uploaded file:', uploadedFile);

    if (uploadedFile instanceof File) {
      fileName = uuidv4();

      // Use the system's temporary directory for storing the uploaded file
      const tempFilePath = `${os.tmpdir()}/${fileName}.pdf`;

      const fileBuffer = Buffer.from(await uploadedFile.arrayBuffer());

      // Write the file to disk
      await fs.writeFile(tempFilePath, fileBuffer);

      const pdfParser = new PDFParser(null, 1);

      pdfParser.on('pdfParser_dataError', (errData) =>
        console.log(errData.parserError)
      );

      // Use the correct instance method to get raw text content
      pdfParser.on('pdfParser_dataReady', () => {
        console.log(pdfParser.getRawTextContent());  // Corrected to use pdfParser
        parsedText = pdfParser.getRawTextContent();  // Corrected to use pdfParser
      });

      // Wait for the PDF to be parsed
      await new Promise((resolve, reject) => {
        pdfParser.loadPDF(tempFilePath);
        pdfParser.on('pdfParser_dataReady', resolve);
        pdfParser.on('pdfParser_dataError', reject);
      });
    } else {
      console.log('Uploaded file is not in the expected format.');
      return new NextResponse('Uploaded file is not in the expected format.', {
        status: 500,
      });
    }
  } else {
    console.log('No files found.');
    return new NextResponse('No File Found', { status: 404 });
  }

  // Send back the parsed text and the file name as a response
  const response = new NextResponse(parsedText);
  response.headers.set('FileName', fileName);
  return response;
}
