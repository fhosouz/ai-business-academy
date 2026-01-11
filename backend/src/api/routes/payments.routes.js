const express = require('express');

const router = express.Router();

// Rotas básicas de pagamentos (placeholder)
router.post('/create-preference', (req, res) => {
  res.json({
    message: 'Payment preference - Coming soon',
    status: 'implemented',
    preference_id: 'temp_' + Date.now()
  });
});

router.get('/status/:id', (req, res) => {
  res.json({
    message: 'Payment status - Coming soon',
    status: 'implemented',
    payment_id: req.params.id
  });
});

module.exports = router;
