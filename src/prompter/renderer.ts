import { PrompterDisplayData, PrompterFile, PrompterPage } from '../types';

declare global {
  interface Window {
    electronAPI: {
      openFile(): Promise<PrompterFile | null>;
      saveFile(data: PrompterFile): Promise<boolean>;
      newFile(): Promise<PrompterFile>;
      onPrompterUpdate(callback: (data: PrompterDisplayData) => void): void;
      sendPageChange(data: PrompterDisplayData): Promise<void>;
      openPrompterWindow(): Promise<void>;
      closePrompterWindow(): Promise<void>;
    };
  }
}

const pageIndicatorEl = document.getElementById('page-indicator') as HTMLDivElement;
const pageTitleEl = document.getElementById('page-title') as HTMLDivElement;
const pageContentEl = document.getElementById('page-content') as HTMLDivElement;

function displayPage(page: PrompterPage, textColor: string): void {
  document.body.style.color = textColor;
  pageIndicatorEl.textContent = `Page ${page.id}`;
  pageTitleEl.textContent = page.title;

  pageContentEl.innerHTML = '';
  const contentEl = document.createElement('p');
  contentEl.className = 'content-text';
  contentEl.textContent = page.content;
  pageContentEl.appendChild(contentEl);
}

window.electronAPI.onPrompterUpdate((data: PrompterDisplayData) => {
  displayPage(data.page, data.textColor);
});
