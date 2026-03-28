import { contextBridge, ipcRenderer } from 'electron';
import { PrompterFile, PrompterPage } from './types';

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: (): Promise<PrompterFile | null> => ipcRenderer.invoke('file:open'),
  saveFile: (data: PrompterFile): Promise<boolean> => ipcRenderer.invoke('file:save', data),
  newFile: (): Promise<PrompterFile> => ipcRenderer.invoke('file:new'),
  onPrompterUpdate: (callback: (page: PrompterPage) => void): void => {
    ipcRenderer.on('prompter:page-update', (_event, page: PrompterPage) => callback(page));
  },
  sendPageChange: (data: PrompterPage): Promise<void> => ipcRenderer.invoke('prompter:update', data),
  openPrompterWindow: (): Promise<void> => ipcRenderer.invoke('prompter:open'),
  closePrompterWindow: (): Promise<void> => ipcRenderer.invoke('prompter:close'),
});
