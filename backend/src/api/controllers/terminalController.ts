// backend/src/api/controllers/terminalController.ts
// 🔧 Controlador de Terminal: Executa comandos via Local Bridge

import { Request, Response } from 'express';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';

// Lista de comandos permitidos (SAFE HANDS Protocol)
const ALLOWED_COMMANDS = [
  'npm', 'node', 'npx', 'yarn', 'pnpm',
  'docker', 'docker-compose',
  'git', 'go', 'cargo', 'python', 'pip',
  'ls', 'dir', 'mkdir', 'cat', 'echo', 'pwd'
];

// Comandos bloqueados por segurança
const DANGEROUS_COMMANDS = ['rm', 'del', 'rmdir', 'sudo', 'chmod', 'chown'];

// Diretório base para sandbox
const WORKSPACE_DIR = path.join(process.cwd(), '..', 'workspace');

/**
 * Executa comando no terminal
 * POST /api/terminal/execute
 */
export const executeCommand = async (req: Request, res: Response) => {
  try {
    const { command, cwd = './project' } = req.body;

    if (!command) {
      return res.status(400).json({ error: 'Comando não fornecido' });
    }

    // Valida comando
    const [cmd, ...args] = command.split(' ');

    if (DANGEROUS_COMMANDS.includes(cmd)) {
      return res.status(403).json({ 
        error: `Comando bloqueado por segurança: ${cmd}`,
        blocked: true
      });
    }

    if (!ALLOWED_COMMANDS.includes(cmd)) {
      return res.status(403).json({ 
        error: `Comando não permitido: ${cmd}`,
        blocked: true
      });
    }

    // Valida diretório (sandbox)
    const targetDir = path.resolve(WORKSPACE_DIR, cwd);
    if (!targetDir.startsWith(WORKSPACE_DIR)) {
      return res.status(403).json({ 
        error: 'Acesso negado: Tentativa de sair do diretório sandbox',
        blocked: true
      });
    }

    // Garante que o diretório existe
    await fs.mkdir(targetDir, { recursive: true });

    // Executa comando
    const child = spawn(cmd, args, {
      cwd: targetDir,
      shell: true,
      env: { ...process.env }
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      res.json({
        success: code === 0,
        exitCode: code,
        stdout,
        stderr,
        command
      });
    });

    // Timeout de 5 minutos
    setTimeout(() => {
      if (!child.killed) {
        child.kill();
        res.json({
          success: false,
          exitCode: -1,
          stdout,
          stderr: stderr + '\n⏱️ Timeout: Comando excedeu 5 minutos',
          command
        });
      }
    }, 300000);

  } catch (error: any) {
    console.error('Erro ao executar comando:', error);
    res.status(500).json({ 
      error: 'Erro ao executar comando',
      message: error.message 
    });
  }
};

/**
 * Escreve arquivos no disco
 * POST /api/terminal/write-files
 */
export const writeFiles = async (req: Request, res: Response) => {
  try {
    const { files } = req.body;

    if (!files || !Array.isArray(files)) {
      return res.status(400).json({ error: 'Lista de arquivos não fornecida' });
    }

    const results = [];

    for (const file of files) {
      const { path: filePath, content } = file;

      if (!filePath || content === undefined) {
        results.push({ path: filePath, success: false, error: 'Caminho ou conteúdo inválido' });
        continue;
      }

      try {
        // Valida caminho (sandbox)
        const fullPath = path.resolve(WORKSPACE_DIR, filePath);
        if (!fullPath.startsWith(WORKSPACE_DIR)) {
          results.push({ path: filePath, success: false, error: 'Acesso negado' });
          continue;
        }

        // Cria diretórios se necessário
        await fs.mkdir(path.dirname(fullPath), { recursive: true });

        // Escreve arquivo
        await fs.writeFile(fullPath, content, 'utf-8');

        results.push({ path: filePath, success: true });
      } catch (error: any) {
        results.push({ path: filePath, success: false, error: error.message });
      }
    }

    const allSuccess = results.every(r => r.success);

    res.json({
      success: allSuccess,
      results
    });

  } catch (error: any) {
    console.error('Erro ao escrever arquivos:', error);
    res.status(500).json({ 
      error: 'Erro ao escrever arquivos',
      message: error.message 
    });
  }
};

/**
 * Lê arquivo do disco
 * GET /api/terminal/read-file
 */
export const readFile = async (req: Request, res: Response) => {
  try {
    const { path: filePath } = req.query;

    if (!filePath || typeof filePath !== 'string') {
      return res.status(400).json({ error: 'Caminho do arquivo não fornecido' });
    }

    // Valida caminho (sandbox)
    const fullPath = path.resolve(WORKSPACE_DIR, filePath);
    if (!fullPath.startsWith(WORKSPACE_DIR)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const content = await fs.readFile(fullPath, 'utf-8');

    res.json({
      success: true,
      content,
      path: filePath
    });

  } catch (error: any) {
    console.error('Erro ao ler arquivo:', error);
    res.status(404).json({ 
      error: 'Arquivo não encontrado',
      message: error.message 
    });
  }
};

/**
 * Lista arquivos do diretório
 * GET /api/terminal/list-files
 */
export const listFiles = async (req: Request, res: Response) => {
  try {
    const { path: dirPath = '.' } = req.query;

    // Valida caminho (sandbox)
    const fullPath = path.resolve(WORKSPACE_DIR, dirPath as string);
    if (!fullPath.startsWith(WORKSPACE_DIR)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const files = await fs.readdir(fullPath, { withFileTypes: true });

    const fileList = files.map(file => ({
      name: file.name,
      isDirectory: file.isDirectory(),
      path: path.join(dirPath as string, file.name)
    }));

    res.json({
      success: true,
      files: fileList,
      path: dirPath
    });

  } catch (error: any) {
    console.error('Erro ao listar arquivos:', error);
    res.status(500).json({ 
      error: 'Erro ao listar arquivos',
      message: error.message 
    });
  }
};

/**
 * Health check do terminal
 * GET /api/terminal/health
 */
export const healthCheck = (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    workspace: WORKSPACE_DIR,
    allowedCommands: ALLOWED_COMMANDS,
    timestamp: new Date().toISOString()
  });
};
