// routes/verification.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createWorker } = require('tesseract.js');
const { Poppler } = require('node-poppler');
const fs = require('fs');
const path = require('path');

// Set up a temporary storage location for uploaded files
const uploadDir = path.join(__dirname, '..', 'uploads'); // Go up one level from /routes
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
const upload = multer({ dest: uploadDir });

/**
 * WARNING: THIS IS A DEMO AND IS NOT SECURE.
 * It only checks for keywords and can be easily fooled.
 * Do NOT use this in a real application. Use a real IDV service.
 */
router.post(
  '/verify/license',
  upload.single('license'),
  async (req, res) => {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: 'No file uploaded.' });
    }

    let worker;
    const filePath = req.file.path;
    let text = '';
    let imageToScan = filePath; // Default to the uploaded file if it's an image

    try {
      worker = await createWorker('eng');
      
      // Step 1: Convert PDF to an image if it's a PDF
      if (req.file.mimetype === 'application/pdf') {
        console.log('Converting PDF to image...');
        const poppler = new Poppler();
        const options = {
          firstPageToConvert: 1,
          lastPageToConvert: 1,
          pngFile: true,
        };
        // Define a unique output name for the converted image
        const imageOutputBase = path.join(
          uploadDir,
          `${req.file.filename}-img`,
        );
        await poppler.pdfToCairo(filePath, imageOutputBase, options);

        // pdfToCairo on Windows may produce "-1.png" or "_1.png"
        const candidatePaths = [
          `${imageOutputBase}.png`,
          `${imageOutputBase}-1.png`,
          `${imageOutputBase}_1.png`,
        ];
        const found = candidatePaths.find(p => fs.existsSync(p));
        if (!found) {
          console.error('PDF to PNG conversion did not produce expected file. Tried:', candidatePaths);
          throw new Error('Failed to convert PDF to image for OCR. Please try uploading an image instead.');
        }
        imageToScan = found; // Tesseract will scan this PNG
        console.log('Conversion complete:', imageToScan);
      }

      // Step 2: Run OCR on the image (either the original or the converted one)
      console.log(`Running OCR on: ${imageToScan}`);
      const {
        data: { text: ocrText },
      } = await worker.recognize(imageToScan);
      text = ocrText.toLowerCase();
      console.log('OCR complete.');
      // console.log("Extracted text:", text); // Uncomment for debugging

      // Step 3: Check for keywords
      const hasDriver = text.includes('driver') || text.includes('driving');
      const hasLicense = text.includes('license') || text.includes('licence');
      const hasDL = text.includes(' dl '); // Check for " DL "

      if ((hasDriver && hasLicense) || hasDL || text.includes('transport')) {
        console.log('Verification SUCCESSFUL (Keywords found).');
        res.json({ success: true, message: 'Keywords found.' });
      } else {
        console.log('Verification FAILED (Keywords not found).');
        res.status(400).json({
          success: false,
          message: 'This does not appear to be a valid driver license.',
        });
      }
    } catch (error) {
      console.error('Error during verification:', error);
      res
        .status(500)
        .json({ success: false, message: 'Error processing document.' });
    } finally {
      // Step 4: Clean up all temporary files
      if (worker) {
        await worker.terminate();
      }
      try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath); // Delete original upload
        // If a PNG was created from a PDF, delete it too
        if (imageToScan !== filePath && imageToScan && fs.existsSync(imageToScan)) {
          fs.unlinkSync(imageToScan);
        }
      } catch (e) {
        console.error('Error cleaning up files:', e);
      }
    }
  },
);

module.exports = router;