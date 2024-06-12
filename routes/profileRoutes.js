'use strict';

const express = require('express');
const router = express.Router();
const { getProfile, createProfile, updateProfile } = require('../handlers/profileHandler');

module.exports = function () {
	router.get('/:_id', getProfile);
	router.post('/', createProfile);
	router.patch('/:_id', updateProfile);
	return router;
};
