// backend/src/middleware/groupMemberMiddleware.js
const db = require('../db');

/**
 * Middleware to verify user is part of the group specified in :groupId
 * Attaches the user's role in that group to req.groupMemberRole
 */
const groupMemberMiddleware = async (req, res, next) => {
  const { groupId } = req.params;
  const userId = req.user.userId;

  if (!groupId) {
    return res.status(400).json({ error: 'Group ID is required' });
  }

  try {
    const result = await db.query(
      'SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2',
      [groupId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Forbidden: You are not a member of this group' });
    }

    req.groupMemberRole = result.rows[0].role;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error checking membership' });
  }
};

module.exports = groupMemberMiddleware;
