// routes/feedback.js
const express = require('express');
const router = express.Router();
const db = require('../db'); 

// POST /feedback  - submit feedback
router.post('/feedback', (req, res) => {
  const { studentName, course, rating, message, difficulty } = req.body;

  // تحقق بسيط من الحقول
  if (!studentName || !course || !rating || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sql = `
    INSERT INTO feedback (
      student_name,
      course,
      rating,
      message,
      difficulty
    ) VALUES (?, ?, ?, ?, ?)
  `;

  db.run(sql, [studentName, course, rating, message, difficulty], function (err) {
    if (err) {
      console.error('DB error inserting feedback:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    // lastID = رقم السطر الجديد في الجدول
    res.status(201).json({ id: this.lastID });
  });
});

module.exports = router;
