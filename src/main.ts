import { app, BrowserWindow, ipcMain, dialog, screen } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { PrompterFile } from './types';

let controlWindow: BrowserWindow | null = null;
let prompterWindow: BrowserWindow | null = null;

function createControlWindow(): void {
  controlWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    title: 'Prompter - Control',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  controlWindow.loadFile(path.join(__dirname, 'control', 'index.html'));

  controlWindow.on('closed', () => {
    controlWindow = null;
    app.quit();
  });
}

function createPrompterWindow(): void {
  const displays = screen.getAllDisplays();
  const secondDisplay = displays.find(d => d.id !== screen.getPrimaryDisplay().id);
  const targetDisplay = secondDisplay || screen.getPrimaryDisplay();

  prompterWindow = new BrowserWindow({
    x: targetDisplay.bounds.x,
    y: targetDisplay.bounds.y,
    width: targetDisplay.bounds.width,
    height: targetDisplay.bounds.height,
    fullscreen: true,
    alwaysOnTop: true,
    title: 'Prompter',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  prompterWindow.loadFile(path.join(__dirname, 'prompter', 'index.html'));

  prompterWindow.on('closed', () => {
    prompterWindow = null;
  });
}

app.whenReady().then(() => {
  createControlWindow();
  createPrompterWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createControlWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers

ipcMain.handle('file:open', async () => {
  if (!controlWindow) return null;
  const result = await dialog.showOpenDialog(controlWindow, {
    filters: [{ name: 'Prompter Files', extensions: ['prompter'] }],
    properties: ['openFile'],
  });

  if (result.canceled || result.filePaths.length === 0) return null;

  const filePath = result.filePaths[0];
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as PrompterFile;
  } catch {
    await dialog.showMessageBox(controlWindow, {
      type: 'error',
      title: 'Error',
      message: 'Failed to open file. The file may be corrupted or invalid.',
    });
    return null;
  }
});

ipcMain.handle('file:save', async (_event, data: PrompterFile) => {
  if (!controlWindow) return false;
  const result = await dialog.showSaveDialog(controlWindow, {
    filters: [{ name: 'Prompter Files', extensions: ['prompter'] }],
    defaultPath: `${data.title || 'untitled'}.prompter`,
  });

  if (result.canceled || !result.filePath) return false;

  try {
    fs.writeFileSync(result.filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch {
    await dialog.showMessageBox(controlWindow, {
      type: 'error',
      title: 'Error',
      message: 'Failed to save file. Check disk space and permissions.',
    });
    return false;
  }
  return true;
});

ipcMain.handle('file:new', async () => {
  const emptyFile: PrompterFile = {
    title: 'New Show',
    pages: [],
  };
  return emptyFile;
});

ipcMain.handle('prompter:update', (_event, pageData: unknown) => {
  if (prompterWindow) {
    prompterWindow.webContents.send('prompter:page-update', pageData);
  }
});

ipcMain.handle('prompter:open', () => {
  if (prompterWindow) {
    prompterWindow.show();
  }
});

ipcMain.handle('prompter:close', () => {
  if (prompterWindow) {
    prompterWindow.hide();
  }
});
