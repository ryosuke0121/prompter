import { contextBridge, ipcRenderer } from 'electron';
import { PrompterDisplayData, PrompterFile, PrompterPage } from './types';

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: (): Promise<PrompterFile | null> => ipcRenderer.invoke('file:open'),
  saveFile: (data: PrompterFile): Promise<boolean> => ipcRenderer.invoke('file:save', data),
  newFile: (): Promise<PrompterFile> => ipcRenderer.invoke('file:new'),
  onPrompterUpdate: (callback: (data: PrompterDisplayData) => void): void => {
    ipcRenderer.on('prompter:page-update', (_event, data: PrompterDisplayData) => callback(data));
  },
  sendPageChange: (data: PrompterDisplayData): Promise<void> => ipcRenderer.invoke('prompter:update', data),
  openPrompterWindow: (): Promise<void> => ipcRenderer.invoke('prompter:open'),
  closePrompterWindow: (): Promise<void> => ipcRenderer.invoke('prompter:close'),
});
