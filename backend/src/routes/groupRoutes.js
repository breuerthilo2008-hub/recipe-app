// backend/src/routes/groupRoutes.js
const express = require('express');
const crypto = require('crypto');
const db = require('../db');
const authMiddleware = require('../middleware/authmiddleware');
const groupMemberMiddleware = require('../middleware/groupMembermiddleware');

const router = express.Router();

router.use(authMiddleware);

// POST /api/groups - Create a group
router.post('/', async (req, res) => {
  const { name } = req.body;
  const userId = req.user.userId;

  if (!name) return res.status(400).json({ error: 'Group name required' });

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // Create group
    const groupRes = await client.query(
      'INSERT INTO groups (name, owner_id) VALUES ($1, $2) RETURNING *',
      [name, userId]
    );
    const group = groupRes.rows[0];

    // Add owner as member
    await client.query(
      'INSERT INTO group_members (group_id, user_id, role) VALUES ($1, $2, $3)',
      [group.id, userId, 'owner']
    );

    await client.query('COMMIT');
    res.status(201).json(group);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to create group' });
  } finally {
    client.release();
  }
});

// GET /api/groups/:groupId - Get group info & members
router.get('/:groupId', groupMemberMiddleware, async (req, res) => {
  try {
    const groupRes = await db.query('SELECT * FROM groups WHERE id = $1', [req.params.groupId]);
    const membersRes = await db.query(
      'SELECT u.id, u.name, u.email, gm.role FROM users u JOIN group_members gm ON u.id = gm.user_id WHERE gm.group_id = $1',
      [req.params.groupId]
    );

    res.json({
      group: groupRes.rows[0],
      members: membersRes.rows
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch group details' });
  }
});

// POST /api/groups/:groupId/invites - Generate invite (Owner only)
router.post('/:groupId/invites', groupMemberMiddleware, async (req, res) => {
  if (req.groupMemberRole !== 'owner') {
    return res.status(403).json({ error: 'Only group owners can create invites' });
  }

  const token = crypto.randomBytes(16).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

  try {
    const result = await db.query(
      'INSERT INTO invites (group_id, token, invited_by, expires_at) VALUES ($1, $2, $3, $4) RETURNING token, expires_at',
      [req.params.groupId, token, req.user.userId, expiresAt]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate invite' });
  }
});

// POST /api/groups/join - Join group using token
router.post('/join', async (req, res) => {
  const { token } = req.body;
  const userId = req.user.userId;

  try {
    const inviteRes = await db.query(
      'SELECT * FROM invites WHERE token = $1 AND used = false AND expires_at > now()',
      [token]
    );

    if (inviteRes.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired invite token' });
    }

    const invite = inviteRes.rows[0];

    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // Add member
      await client.query(
        'INSERT INTO group_members (group_id, user_id, role) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [invite.group_id, userId, 'member']
      );

      // Mark invite as used
      await client.query('UPDATE invites SET used = true WHERE id = $1', [invite.id]);

      await client.query('COMMIT');
      res.json({ message: 'Successfully joined group', groupId: invite.group_id });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to join group' });
  }
});

module.exports = router;
