const express = require('express');
const router = express.Router();
const { getInventory } = require('../controllers/inventoryController');

router.get('/', getInventory);

module.exports = router;