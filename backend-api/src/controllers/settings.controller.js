const { getService } = require('../services/db.factory');
const path = require('path');
const fs = require('fs');

const UPLOADS_DIR = path.join(__dirname, '../../public/uploads');

exports.getLandingSettings = async (req, res, next) => {
  try {
    const data = await getService('settings').getLandingSettings();
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.uploadHeroImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });

    const ext = path.extname(req.file.originalname).toLowerCase() || '.jpg';
    const filename = `hero-image${ext}`;
    const dest = path.join(UPLOADS_DIR, filename);

    // Remove old hero images with different extensions
    ['jpg', 'jpeg', 'png', 'webp'].forEach(e => {
      const old = path.join(UPLOADS_DIR, `hero-image.${e}`);
      if (old !== dest && fs.existsSync(old)) fs.unlinkSync(old);
    });

    fs.renameSync(req.file.path, dest);

    const apiBase = process.env.API_URL || `http://localhost:${process.env.PORT || 5000}`;
    const imageUrl = `${apiBase}/uploads/${filename}?t=${Date.now()}`;

    // Save URL to settings
    await getService('settings').updateLandingSettings({ heroImageUrl: imageUrl });

    res.json({ success: true, data: { imageUrl } });
  } catch (err) { next(err); }
};

exports.updateLandingSettings = async (req, res, next) => {
  try {
    const data = await getService('settings').updateLandingSettings(req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};
