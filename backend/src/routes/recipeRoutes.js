// backend/src/routes/recipeRoutes.js
const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const groupMemberMiddleware = require('../middleware/groupMemberMiddleware');

const router = express.Router({ mergeParams: true }); // Important to access :groupId from parent route

router.use(authMiddleware);
router.use(groupMemberMiddleware);

// GET / - List all recipes for group (titles only)
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, title, servings, prep_time_min, cook_time_min FROM recipes WHERE group_id = $1 ORDER BY title ASC',
      [req.params.groupId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

// GET /:recipeId - Full recipe detail with ingredients
router.get('/:recipeId', async (req, res) => {
  try {
    const recipeRes = await db.query(
      'SELECT * FROM recipes WHERE id = $1 AND group_id = $2',
      [req.params.recipeId, req.params.groupId]
    );

    if (recipeRes.rows.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    const ingredientsRes = await db.query(
      'SELECT id, name, quantity, unit FROM ingredients WHERE recipe_id = $1',
      [req.params.recipeId]
    );

    res.json({
      ...recipeRes.rows[0],
      ingredients: ingredientsRes.rows
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recipe detail' });
  }
});

// POST / - Create recipe + ingredients (Transaction)
router.post('/', async (req, res) => {
  const { title, description, instructions, servings, prep_time_min, cook_time_min, ingredients } = req.body;
  const userId = req.user.userId;
  const groupId = req.params.groupId;

  if (!title || !instructions) {
    return res.status(400).json({ error: 'Title and instructions are required' });
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const recipeRes = await client.query(
      `INSERT INTO recipes (group_id, created_by, title, description, instructions, servings, prep_time_min, cook_time_min) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [groupId, userId, title, description, instructions, servings, prep_time_min, cook_time_min]
    );
    const recipeId = recipeRes.rows[0].id;

    if (ingredients && ingredients.length > 0) {
      for (const ing of ingredients) {
        await client.query(
          'INSERT INTO ingredients (recipe_id, name, quantity, unit) VALUES ($1, $2, $3, $4)',
          [recipeId, ing.name, ing.quantity, ing.unit]
        );
      }
    }

    await client.query('COMMIT');
    res.status(201).json({ ...recipeRes.rows[0], ingredients: ingredients || [] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to create recipe' });
  } finally {
    client.release();
  }
});

// PUT /:recipeId - Update recipe (Transaction: replace ingredients)
router.put('/:recipeId', async (req, res) => {
  const { title, description, instructions, servings, prep_time_min, cook_time_min, ingredients } = req.body;
  const recipeId = req.params.recipeId;
  const groupId = req.params.groupId;

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const recipeRes = await client.query(
      `UPDATE recipes 
       SET title = $1, description = $2, instructions = $3, servings = $4, prep_time_min = $5, cook_time_min = $6, updated_at = now()
       WHERE id = $7 AND group_id = $8 RETURNING *`,
      [title, description, instructions, servings, prep_time_min, cook_time_min, recipeId, groupId]
    );

    if (recipeRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Recipe not found' });
    }

    // Delete old ingredients
    await client.query('DELETE FROM ingredients WHERE recipe_id = $1', [recipeId]);

    // Insert new ingredients
    if (ingredients && ingredients.length > 0) {
      for (const ing of ingredients) {
        await client.query(
          'INSERT INTO ingredients (recipe_id, name, quantity, unit) VALUES ($1, $2, $3, $4)',
          [recipeId, ing.name, ing.quantity, ing.unit]
        );
      }
    }

    await client.query('COMMIT');
    res.json({ ...recipeRes.rows[0], ingredients: ingredients || [] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to update recipe' });
  } finally {
    client.release();
  }
});

// DELETE /:recipeId - Delete recipe
router.post('/:recipeId/delete', async (req, res) => { // Using POST for compatibility or just DELETE
  // Actually implementation plan says DELETE
});

router.delete('/:recipeId', async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM recipes WHERE id = $1 AND group_id = $2 RETURNING id',
      [req.params.recipeId, req.params.groupId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Recipe not found' });
    res.json({ message: 'Recipe deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete recipe' });
  }
});

module.exports = router;
