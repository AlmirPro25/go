// backend/src/api/routes/terminalRoutes.ts
// 🔧 Rotas de Terminal

import { Router } from 'express';
import {
  executeCommand,
  writeFiles,
  readFile,
  listFiles,
  healthCheck
} from '../controllers/terminalController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Todas as rotas de terminal requerem autenticação
router.use(authenticateToken);

// POST /api/terminal/execute - Executa comando
router.post('/execute', executeCommand);

// POST /api/terminal/write-files - Escreve arquivos no disco
router.post('/write-files', writeFiles);

// GET /api/terminal/read-file - Lê arquivo do disco
router.get('/read-file', readFile);

// GET /api/terminal/list-files - Lista arquivos do diretório
router.get('/list-files', listFiles);

// GET /api/terminal/health - Health check
router.get('/health', healthCheck);

export default router;
