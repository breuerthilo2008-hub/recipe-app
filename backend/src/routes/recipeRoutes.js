// backend/src/routes/recipeRoutes.js
const express = require('express');
const db = require('../db');
const groupMemberMiddleware = require('../middleware/groupMemberMiddleware');

const router = express.Router({ mergeParams: true });

// All recipe routes in this file are under /api/groups/:groupId/recipes
router.use(groupMemberMiddleware);

/**
 * GET / - List all recipes for this group
 */
router.get('/', async (req, res) => {
  const { groupId } = req.params;
  try {
    const result = await db.query(
      'SELECT id, title, description, image_url, servings, prep_time_min, cook_time_min FROM recipes WHERE group_id = $1 ORDER BY created_at DESC',
      [groupId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('List recipes error:', err);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

/**
 * GET /:recipeId - Get recipe detail with ingredients
 */
router.get('/:recipeId', async (req, res) => {
  const { recipeId } = req.params;
  try {
    const recipeRes = await db.query('SELECT * FROM recipes WHERE id = $1', [recipeId]);
    const ingredientsRes = await db.query(
      'SELECT id, name, quantity, unit FROM ingredients WHERE recipe_id = $1 ORDER BY id ASC',
      [recipeId]
    );

    if (recipeRes.rows.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    res.json({
      ...recipeRes.rows[0],
      ingredients: ingredientsRes.rows
    });
  } catch (err) {
    console.error('Fetch recipe error:', err);
    res.status(500).json({ error: 'Failed to fetch recipe' });
  }
});

/**
 * POST / - Create a new recipe with ingredients
 */
router.post('/', async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user.userId;
  const { title, description, instructions, servings, prep_time_min, cook_time_min, ingredients, image_url } = req.body;

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Insert recipe
    const recipeRes = await client.query(
      `INSERT INTO recipes (group_id, created_by, title, description, instructions, servings, prep_time_min, cook_time_min, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [groupId, userId, title, description, instructions, servings || 1, prep_time_min || 0, cook_time_min || 0, image_url || null]
    );
    const recipeId = recipeRes.rows[0].id;

    // 2. Insert ingredients if provided
    if (ingredients && Array.isArray(ingredients)) {
      for (const ing of ingredients) {
        await client.query(
          'INSERT INTO ingredients (recipe_id, name, quantity, unit) VALUES ($1, $2, $3, $4)',
          [recipeId, ing.name, ing.quantity || 0, ing.unit || '']
        );
      }
    }

    await client.query('COMMIT');
    res.status(201).json({ ...recipeRes.rows[0], ingredients: ingredients || [] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Create recipe error:', err);
    res.status(500).json({ error: 'Failed to create recipe' });
  } finally {
    client.release();
  }
});

/**
 * PUT /:recipeId - Update recipe and replace ingredients
 */
router.put('/:recipeId', async (req, res) => {
  const { recipeId } = req.params;
  const { title, description, instructions, servings, prep_time_min, cook_time_min, ingredients, image_url } = req.body;

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Update recipe metadata
    await client.query(
      `UPDATE recipes 
       SET title = $1, description = $2, instructions = $3, servings = $4, prep_time_min = $5, cook_time_min = $6, image_url = $7, updated_at = NOW()
       WHERE id = $8`,
      [title, description, instructions, servings, prep_time_min, cook_time_min, image_url, recipeId]
    );

    // 2. Refresh ingredients (Delete and Re-insert)
    if (ingredients && Array.isArray(ingredients)) {
      await client.query('DELETE FROM ingredients WHERE recipe_id = $1', [recipeId]);
      for (const ing of ingredients) {
        await client.query(
          'INSERT INTO ingredients (recipe_id, name, quantity, unit) VALUES ($1, $2, $3, $4)',
          [recipeId, ing.name, ing.quantity, ing.unit]
        );
      }
    }

    await client.query('COMMIT');
    res.json({ message: 'Recipe updated successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Update recipe error:', err);
    res.status(500).json({ error: 'Failed to update recipe' });
  } finally {
    client.release();
  }
});

/**
 * DELETE /:recipeId - Remove a recipe
 */
router.delete('/:recipeId', async (req, res) => {
  const { recipeId } = req.params;
  try {
    await db.query('DELETE FROM recipes WHERE id = $1', [recipeId]);
    res.json({ message: 'Recipe deleted successfully' });
  } catch (err) {
    console.error('Delete recipe error:', err);
    res.status(500).json({ error: 'Failed to delete recipe' });
  }
});

module.exports = router;