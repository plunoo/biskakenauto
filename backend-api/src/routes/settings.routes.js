const { Router } = require('express');
const multer = require('multer');
const path = require('path');
const ctrl = require('../controllers/settings.controller');
const { authenticate, requireRole } = require('../middleware/auth');

const upload = multer({
  dest: path.join(__dirname, '../../public/uploads/tmp'),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    cb(null, allowed.includes(file.mimetype));
  }
});

const r = Router();

// Public: landing page fetches this
r.get('/landing', ctrl.getLandingSettings);

// Admin only
r.put('/landing', authenticate, requireRole('ADMIN'), ctrl.updateLandingSettings);
r.post('/landing/hero-image', authenticate, requireRole('ADMIN'), upload.single('image'), ctrl.uploadHeroImage);

module.exports = r;
