import express from 'express';
import promotionController from '../controllers/promotion.controller.js';

const router = express.Router();

router.use('/', promotionController);

export default router;
