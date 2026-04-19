// backend/src/routes/recipeRoutes.js (Relevant Sections)
const isUUID = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

router.get('/', async (req, res) => {
  const { groupId } = req.params;
  if (!isUUID(groupId)) {
    return res.json([]); // Return empty list for placeholder groups
  }
  // ... query DB
});
