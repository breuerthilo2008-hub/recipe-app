// backend/src/routes/groupRoutes.js
const express = require('express');
const crypto = require('crypto');
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const groupMemberMiddleware = require('../middleware/groupMemberMiddleware');

const router = express.Router();

// All group routes require authentication
router.use(authMiddleware);

/**
 * GET /me - Get all groups the current user belongs to
 */
router.get('/me', async (req, res) => {
  const userId = req.user.userId;

  try {
    const result = await db.query(
      `SELECT g.id, g.name, gm.role, 
       (SELECT count(*) FROM group_members WHERE group_id = g.id) as member_count
       FROM groups g
       JOIN group_members gm ON g.id = gm.group_id
       WHERE gm.user_id = $1
       ORDER BY gm.joined_at DESC`,
      [userId]
    );

    res.json({ groups: result.rows });
  } catch (err) {
    console.error('Error fetching user groups:', err);
    res.status(500).json({ error: 'Failed to fetch your groups' });
  }
});

/**
 * GET /:groupId - Get detailed group info and member list
 */
router.get('/:groupId', groupMemberMiddleware, async (req, res) => {
  const { groupId } = req.params;

  try {
    const groupRes = await db.query('SELECT id, name, owner_id, created_at FROM groups WHERE id = $1', [groupId]);
    const membersRes = await db.query(
      `SELECT u.id, u.name, u.email, gm.role, gm.joined_at 
       FROM users u 
       JOIN group_members gm ON u.id = gm.user_id 
       WHERE gm.group_id = $1
       ORDER BY gm.joined_at ASC`,
      [groupId]
    );

    res.json({
      group: groupRes.rows[0],
      members: membersRes.rows
    });
  } catch (err) {
    console.error('Error fetching group details:', err);
    res.status(500).json({ error: 'Failed to fetch group details' });
  }
});

/**
 * POST / - Create a new family group
 */
router.post('/', async (req, res) => {
  const { name } = req.body;
  const userId = req.user.userId;

  if (!name) return res.status(400).json({ error: 'Group name is required' });

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const groupRes = await client.query(
      'INSERT INTO groups (name, owner_id) VALUES ($1, $2) RETURNING *',
      [name, userId]
    );
    const group = groupRes.rows[0];

    await client.query(
      'INSERT INTO group_members (group_id, user_id, role) VALUES ($1, $2, $3)',
      [group.id, userId, 'owner']
    );

    await client.query('COMMIT');
    res.status(201).json(group);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Group creation error:', err);
    res.status(500).json({ error: 'Failed to create group' });
  } finally {
    client.release();
  }
});

/**
 * POST /:groupId/invites - Generate a 6-digit invite code (Owner only)
 */
router.post('/:groupId/invites', groupMemberMiddleware, async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user.userId;

  if (req.groupMemberRole !== 'owner') {
    return res.status(403).json({ error: 'Only owners can generate invite codes' });
  }

  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  try {
    const result = await db.query(
      `INSERT INTO invites (group_id, code, token, invited_by, expires_at, max_uses) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING code, expires_at`,
      [groupId, code, crypto.randomBytes(16).toString('hex'), userId, expiresAt, 10]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Invite generation error:', err);
    res.status(500).json({ error: 'Failed to generate invite code' });
  }
});

/**
 * POST /join - Join a group using a 6-digit code
 */
router.post('/join', async (req, res) => {
  const { code } = req.body;
  const userId = req.user.userId;

  if (!code) return res.status(400).json({ error: 'Invite code is required' });

  const client = await db.pool.connect();
  try {
    const inviteRes = await client.query(
      `SELECT * FROM invites 
       WHERE code = $1 AND used = false AND use_count < max_uses AND expires_at > now()`,
      [code.toUpperCase()]
    );

    const invite = inviteRes.rows[0];
    if (!invite) {
      return res.status(400).json({ error: 'Invalid or expired invite code' });
    }

    await client.query('BEGIN');

    await client.query(
      'INSERT INTO group_members (group_id, user_id, role) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      [invite.group_id, userId, 'member']
    );

    await client.query(
      'UPDATE invites SET use_count = use_count + 1, used = (use_count + 1 >= max_uses) WHERE id = $1',
      [invite.id]
    );

    const groupRes = await client.query('SELECT name FROM groups WHERE id = $1', [invite.group_id]);

    await client.query('COMMIT');
    res.json({ message: 'Joined successfully', groupId: invite.group_id, groupName: groupRes.rows[0].name });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Join group error:', err);
    res.status(500).json({ error: 'Failed to join group' });
  } finally {
    client.release();
  }
});

/**
 * DELETE /:groupId/members/:memberId - Remove a member (Owner only)
 */
router.delete('/:groupId/members/:memberId', groupMemberMiddleware, async (req, res) => {
  const { groupId, memberId } = req.params;

  if (req.groupMemberRole !== 'owner') {
    return res.status(403).json({ error: 'Only owners can remove members' });
  }

  // Prevent self-removal logic should be handled by the frontend, but we double-check here
  if (memberId === req.user.userId) {
    return res.status(400).json({ error: 'Owners cannot remove themselves. Delete the group instead.' });
  }

  try {
    await db.query('DELETE FROM group_members WHERE group_id = $1 AND user_id = $2', [groupId, memberId]);
    res.json({ message: 'Member removed successfully' });
  } catch (err) {
    console.error('Remove member error:', err);
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

module.exports = router;
