import express from 'express';
import progressionController from '../controllers/progression.controller.js';

const router = express.Router();

router.use('/', progressionController);

export default router;
