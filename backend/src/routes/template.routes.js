import express from 'express';
import * as TemplateController from '../controllers/template.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, TemplateController.listTemplates);
router.get('/:id', requireAuth, TemplateController.getTemplate);
router.post('/generate', requireAuth, TemplateController.generateTemplate);
router.post('/', requireAuth, TemplateController.createTemplate);

export default router;
