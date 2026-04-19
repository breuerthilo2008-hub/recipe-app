// backend/src/routes/ocrRoutes.js
const express = require('express');
const multer = require('multer');
const FormData = require('form-data');
const authMiddleware = require('../middleware/authproxy');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/scan-recipe', authMiddleware, upload.single('recipeImage'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

  try {
    const apiKey = process.env.OCR_SPACE_API_KEY || 'helloworld';
    const formData = new FormData();
    formData.append('apikey', apiKey);
    formData.append('base64Image', `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`);
    formData.append('scale', 'true');
    formData.append('detectOrientation', 'true');

    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });

    const data = await response.json();
    if (data.IsErroredOnProcessing) throw new Error(data.ErrorMessage?.[0] || 'OCR Error');

    const text = data.ParsedResults?.[0]?.ParsedText || '';
    const ingredients = parseIngredientsFromText(text); // Helper is in file

    res.json({ ingredients, rawText: text, suggestedTitle: text.split('\n')[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
