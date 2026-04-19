// backend/src/routes/mealPlanRoutes.js (Relevant Sections)
const isUUID = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
const express = require('express');
const router = express.Router();
// GET /current
router.get('/current', async (req, res) => {
  const { groupId } = req.params;
  const monday = getMonday(new Date());
  const mondayStr = monday.toISOString().split('T')[0];

  // If not a real UUID, don't query the DB to avoid syntax errors
  if (!isUUID(groupId)) {
    return res.status(404).json({ message: 'No plan for this week yet (Mock Mode)' });
  }

  try {
    const planRes = await db.query(
      'SELECT id, week_start FROM meal_plans WHERE group_id = $1 AND week_start = $2',
      [groupId, mondayStr]
    );
    // ... rest of the logic
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch current plan' });
  }
});

// POST /generate
router.post('/generate', async (req, res) => {
  const { groupId } = req.params;

  if (!isUUID(groupId)) {
    return res.status(400).json({
      error: 'Please create a real Family Group before generating plans. (Placeholder ID 1 detected)'
    });
  }
  // ... rest of the logic
});
module.exports = router;