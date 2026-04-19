// backend/src/routes/mealPlanRoutes.js
const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const groupMemberMiddleware = require('../middleware/groupMemberMiddleware');

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);
router.use(groupMemberMiddleware);

// Helper to get Monday of the current ISO week
function getMonday(d) {
  d = new Date(d);
  const day = d.getDay(),
    diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

// GET /current - Get current week's plan
router.get('/current', async (req, res) => {
  const monday = getMonday(new Date());
  const mondayStr = monday.toISOString().split('T')[0];

  try {
    const planRes = await db.query(
      'SELECT id, week_start FROM meal_plans WHERE group_id = $1 AND week_start = $2',
      [req.params.groupId, mondayStr]
    );

    if (planRes.rows.length === 0) {
      return res.status(404).json({ message: 'No plan for this week yet' });
    }

    const recipesRes = await db.query(
      `SELECT mpr.day_of_week, r.id, r.title, r.prep_time_min, r.cook_time_min 
       FROM meal_plan_recipes mpr 
       JOIN recipes r ON mpr.recipe_id = r.id 
       WHERE mpr.plan_id = $1 
       ORDER BY mpr.day_of_week ASC`,
      [planRes.rows[0].id]
    );

    res.json({
      ...planRes.rows[0],
      days: recipesRes.rows
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch current plan' });
  }
});

// POST /generate - Run the algorithm and generate a new plan
router.post('/generate', async (req, res) => {
  const { weekStart } = req.body; // Expecting ISO date string (Monday)
  const mondayStr = weekStart || getMonday(new Date()).toISOString().split('T')[0];
  const groupId = req.params.groupId;

  const client = await db.pool.connect();
  try {
    // 1. Fetch group recipes
    const recipesRes = await client.query('SELECT id FROM recipes WHERE group_id = $1', [groupId]);
    const allRecipeIds = recipesRes.rows.map(r => r.id);

    if (allRecipeIds.length === 0) {
      return res.status(400).json({ error: 'No recipes found for this group. Add recipes first.' });
    }

    // 2. Fetch previous week's recipes for exclusion
    const lastWeekMonday = new Date(mondayStr);
    lastWeekMonday.setDate(lastWeekMonday.getDate() - 7);
    const lastWeekStr = lastWeekMonday.toISOString().split('T')[0];

    const prevPlanRes = await client.query(
      'SELECT recipe_id FROM meal_plan_recipes mpr JOIN meal_plans mp ON mpr.plan_id = mp.id WHERE mp.group_id = $1 AND mp.week_start = $2',
      [groupId, lastWeekStr]
    );
    const excludedIds = prevPlanRes.rows.map(r => r.recipe_id);

    // 3. Algorithm: Filter candidates
    let candidates = allRecipeIds.filter(id => !excludedIds.includes(id));

    // 4. Pad if needed
    if (candidates.length < 7) {
      candidates = [...candidates, ...excludedIds]; // Add back previous week's recipes
    }
    
    // Final check if we still have < 7 (rare unless group has < 7 recipes total)
    if (candidates.length < 1) return res.status(400).json({ error: 'Insufficient recipes' });

    // 5. Fisher-Yates Shuffle
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }

    // 6. Picking 7
    const selection = candidates.slice(0, 7);

    // 7. Persist
    await client.query('BEGIN');

    // UPSERT plan
    const planRes = await client.query(
      `INSERT INTO meal_plans (group_id, week_start) 
       VALUES ($1, $2) 
       ON CONFLICT (group_id, week_start) DO UPDATE SET generated_at = now() 
       RETURNING id`,
      [groupId, mondayStr]
    );
    const planId = planRes.rows[0].id;

    // Clear old slots for this plan if re-generating
    await client.query('DELETE FROM meal_plan_recipes WHERE plan_id = $1', [planId]);

    // Insert new selection
    for (let i = 0; i < selection.length; i++) {
      await client.query(
        'INSERT INTO meal_plan_recipes (plan_id, day_of_week, recipe_id) VALUES ($1, $2, $3)',
        [planId, i + 1, selection[i]]
      );
    }

    await client.query('COMMIT');
    res.json({ message: 'Plan generated successfully', planId, week_start: mondayStr });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to generate meal plan' });
  } finally {
    client.release();
  }
});

// GET /:planId - Get specific plan details
router.get('/:planId', async (req, res) => {
  try {
    const planRes = await db.query(
      'SELECT id, week_start FROM meal_plans WHERE id = $1 AND group_id = $2',
      [req.params.planId, req.params.groupId]
    );

    if (planRes.rows.length === 0) return res.status(404).json({ error: 'Plan not found' });

    const recipesRes = await db.query(
      `SELECT mpr.day_of_week, r.id, r.title 
       FROM meal_plan_recipes mpr 
       JOIN recipes r ON mpr.recipe_id = r.id 
       WHERE mpr.plan_id = $1 
       ORDER BY mpr.day_of_week ASC`,
      [req.params.planId]
    );

    res.json({
      ...planRes.rows[0],
      days: recipesRes.rows
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch plan detail' });
  }
});

module.exports = router;
