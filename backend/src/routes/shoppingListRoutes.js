// backend/src/routes/shoppingListRoutes.js
const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const groupMemberMiddleware = require('../middleware/groupMemberMiddleware');

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);
router.use(groupMemberMiddleware);

// Helper to get aggregated list
async function getAggregatedList(planId) {
  const result = await db.query(
    `SELECT i.name, i.unit, SUM(i.quantity) AS total
     FROM meal_plan_recipes mpr
     JOIN ingredients i ON i.recipe_id = mpr.recipe_id
     WHERE mpr.plan_id = $1
     GROUP BY i.name, i.unit
     ORDER BY i.name`,
    [planId]
  );
  return result.rows;
}

// GET / - Get aggregated JSON
router.get('/', async (req, res) => {
  try {
    const list = await getAggregatedList(req.params.planId);
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to aggregate shopping list' });
  }
});

// GET /export - Export as CSV or TXT
router.get('/export', async (req, res) => {
  const { format } = req.query; // 'csv' or 'txt'
  
  try {
    const list = await getAggregatedList(req.params.planId);

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="shopping-list-${req.params.planId}.csv"`);
      
      let csv = 'Ingredient,Quantity,Unit\n';
      list.forEach(row => {
        csv += `"${row.name}",${row.total || 0},"${row.unit || ''}"\n`;
      });
      return res.send(csv);
    } 
    
    // Default to TXT
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="shopping-list-${req.params.planId}.txt"`);
    
    let txt = `Shopping List for Plan ${req.params.planId}\n`;
    txt += '='.repeat(40) + '\n';
    list.forEach(row => {
      txt += `- ${row.name}: ${row.total || ''} ${row.unit || ''}\n`;
    });
    return res.send(txt);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to export shopping list' });
  }
});

module.exports = router;
