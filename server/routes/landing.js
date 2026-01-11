const express = require('express');
const router = express.Router();

// Landing page hero section
router.get('/hero', (req, res) => {
  res.json({
    success: true,
    data: {
      title: 'Bishaken Auto Shop',
      subtitle: 'Professional Automotive Services in Accra',
      description: 'Expert car repairs, maintenance, and diagnostics with modern tools and experienced technicians.',
      ctaText: 'Book Service Now',
      backgroundImage: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1200&h=600&fit=crop'
    }
  });
});

// Landing page services
router.get('/services', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        title: 'Engine Diagnostics',
        description: 'Advanced computer diagnostics to identify engine issues accurately',
        icon: 'engine',
        price: 'From ₵80'
      },
      {
        id: '2',
        title: 'Brake Service',
        description: 'Complete brake system inspection, repair, and replacement',
        icon: 'brake',
        price: 'From ₵150'
      },
      {
        id: '3',
        title: 'Oil Change',
        description: 'Quick and professional oil change with quality lubricants',
        icon: 'oil',
        price: 'From ₵50'
      },
      {
        id: '4',
        title: 'AC Repair',
        description: 'Air conditioning system repair and maintenance',
        icon: 'ac',
        price: 'From ₵120'
      }
    ]
  });
});

// Landing page testimonials
router.get('/testimonials', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        name: 'Kwame Asante',
        text: 'Excellent service! They fixed my Toyota engine problem quickly and affordably.',
        rating: 5,
        location: 'East Legon'
      },
      {
        id: '2',
        name: 'Akosua Mensah',
        text: 'Very professional team. My Honda Civic runs like new after their service.',
        rating: 5,
        location: 'Accra New Town'
      },
      {
        id: '3',
        name: 'Kofi Boakye',
        text: 'Honest pricing and quality work. Highly recommend for all car repairs.',
        rating: 5,
        location: 'Tema'
      }
    ]
  });
});

// Landing page contact info
router.get('/contact', (req, res) => {
  res.json({
    success: true,
    data: {
      phone: '+233 24 123 4567',
      email: 'info@bishakenautoshop.com',
      address: '123 Auto Street, Accra, Ghana',
      hours: {
        weekdays: '8:00 AM - 6:00 PM',
        saturday: '8:00 AM - 4:00 PM',
        sunday: 'Closed'
      },
      social: {
        facebook: 'https://facebook.com/bishakenauto',
        instagram: 'https://instagram.com/bishakenauto',
        whatsapp: '+233241234567'
      }
    }
  });
});

// Submit contact inquiry
router.post('/contact', async (req, res) => {
  try {
    const { name, phone, email, service, message } = req.body;
    
    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Name and phone are required'
      });
    }
    
    // In a real implementation, you would save this to the database
    // and possibly send notifications
    
    res.json({
      success: true,
      data: {
        message: 'Thank you for your inquiry! We will contact you soon.',
        inquiryId: `INQ-${Date.now()}`
      }
    });
    
  } catch (error) {
    console.error('Contact inquiry error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit inquiry'
    });
  }
});

// Landing page blog posts
router.get('/blog', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        title: '5 Signs Your Car Needs Immediate Attention',
        excerpt: 'Learn to identify warning signs before they become expensive repairs.',
        image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=250&fit=crop',
        date: new Date().toISOString(),
        readTime: '4 min read'
      },
      {
        id: '2',
        title: 'Regular Maintenance Tips for Ghana\'s Climate',
        excerpt: 'How to keep your car running smoothly in tropical conditions.',
        image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&h=250&fit=crop',
        date: new Date().toISOString(),
        readTime: '6 min read'
      }
    ]
  });
});

module.exports = router;