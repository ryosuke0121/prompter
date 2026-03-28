import { PrompterFile, PrompterPage } from '../types';

declare global {
  interface Window {
    electronAPI: {
      openFile(): Promise<PrompterFile | null>;
      saveFile(data: PrompterFile): Promise<boolean>;
      newFile(): Promise<PrompterFile>;
      onPrompterUpdate(callback: (page: PrompterPage) => void): void;
      sendPageChange(data: PrompterPage): Promise<void>;
      openPrompterWindow(): Promise<void>;
      closePrompterWindow(): Promise<void>;
    };
  }
}

const container = document.getElementById('prompter-container') as HTMLDivElement;
const pageIndicatorEl = document.getElementById('page-indicator') as HTMLDivElement;
const pageTitleEl = document.getElementById('page-title') as HTMLDivElement;
const pageContentEl = document.getElementById('page-content') as HTMLDivElement;

function displayPage(page: PrompterPage): void {
  // Fade out
  container.classList.add('fade-out');

  setTimeout(() => {
    pageIndicatorEl.textContent = `Page ${page.id}`;
    pageTitleEl.textContent = page.title;

    pageContentEl.innerHTML = '';
    const contentEl = document.createElement('p');
    contentEl.className = 'content-text';
    contentEl.textContent = page.content;
    pageContentEl.appendChild(contentEl);

    // Fade back in
    container.classList.remove('fade-out');
  }, 150);
}

window.electronAPI.onPrompterUpdate((page: PrompterPage) => {
  displayPage(page);
});
