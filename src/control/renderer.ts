import { PrompterFile, PrompterPage } from '../types';
import { Language, getInitialLanguage, setSavedLanguage, translate } from './i18n';

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

let currentFile: PrompterFile | null = null;
let currentPageIndex = 0;
let prompterActive = false;
let nextPageId = 1;
let currentLanguage: Language = getInitialLanguage();

function getRequiredElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Element not found: ${id}`);
  }
  return element as T;
}

const showTitleEl = getRequiredElement<HTMLSpanElement>('show-title');
const pageListEl = getRequiredElement<HTMLUListElement>('page-list');
const editorEmpty = getRequiredElement<HTMLDivElement>('editor-empty');
const editorForm = getRequiredElement<HTMLDivElement>('editor-form');
const pageTitleInput = getRequiredElement<HTMLInputElement>('page-title');
const pageContentTextarea = getRequiredElement<HTMLTextAreaElement>('page-content');
const pageCounterEl = getRequiredElement<HTMLSpanElement>('page-counter');

const btnNew = getRequiredElement<HTMLButtonElement>('btn-new');
const btnOpen = getRequiredElement<HTMLButtonElement>('btn-open');
const btnSave = getRequiredElement<HTMLButtonElement>('btn-save');
const btnAddPage = getRequiredElement<HTMLButtonElement>('btn-add-page');
const btnSettings = getRequiredElement<HTMLButtonElement>('btn-settings');
const btnDeletePage = getRequiredElement<HTMLButtonElement>('btn-delete-page');
const btnPrev = getRequiredElement<HTMLButtonElement>('btn-prev');
const btnNext = getRequiredElement<HTMLButtonElement>('btn-next');
const btnStartPrompter = getRequiredElement<HTMLButtonElement>('btn-start-prompter');
const btnStopPrompter = getRequiredElement<HTMLButtonElement>('btn-stop-prompter');
const settingsModal = getRequiredElement<HTMLDivElement>('settings-modal');
const settingsCloseBtn = getRequiredElement<HTMLButtonElement>('btn-settings-close');
const languageSelect = getRequiredElement<HTMLSelectElement>('language-select');
const appTitle = getRequiredElement<HTMLHeadingElement>('app-title');
const sidebarTitle = getRequiredElement<HTMLHeadingElement>('sidebar-title');
const editorEmptyText = getRequiredElement<HTMLParagraphElement>('editor-empty-text');
const pageTitleLabel = getRequiredElement<HTMLLabelElement>('label-page-title');
const pageContentLabel = getRequiredElement<HTMLLabelElement>('label-page-content');
const settingsTitle = getRequiredElement<HTMLHeadingElement>('settings-title');
const languageLabel = getRequiredElement<HTMLLabelElement>('label-language');

function renderPageList(): void {
  pageListEl.innerHTML = '';
  if (!currentFile) return;

  currentFile.pages.forEach((page, index) => {
    const li = document.createElement('li');
    li.className = 'page-list-item' + (index === currentPageIndex ? ' active' : '');
    li.innerHTML = `<span class="page-num">${index + 1}</span>${escapeHtml(page.title || 'Untitled')}`;
    li.addEventListener('click', () => selectPage(index));
    pageListEl.appendChild(li);
  });
}

function selectPage(index: number): void {
  if (!currentFile || index < 0 || index >= currentFile.pages.length) return;

  // Save current edits before switching
  saveCurrentEdits();

  currentPageIndex = index;
  renderPageList();
  showEditor();
  updatePageCounter();
  broadcastCurrentPage();
}

function showEditor(): void {
  if (!currentFile || currentFile.pages.length === 0) {
    editorEmpty.style.display = 'flex';
    editorForm.style.display = 'none';
    return;
  }

  const page = currentFile.pages[currentPageIndex];
  editorEmpty.style.display = 'none';
  editorForm.style.display = 'block';
  pageTitleInput.value = page.title;
  pageContentTextarea.value = page.content;
}

function saveCurrentEdits(): void {
  if (!currentFile || currentFile.pages.length === 0) return;
  const page = currentFile.pages[currentPageIndex];
  if (page) {
    page.title = pageTitleInput.value;
    page.content = pageContentTextarea.value;
  }
}

function updatePageCounter(): void {
  if (!currentFile || currentFile.pages.length === 0) {
    pageCounterEl.textContent = translate(currentLanguage, 'noPageCounter');
    return;
  }
  pageCounterEl.textContent = `${currentPageIndex + 1} / ${currentFile.pages.length}`;
}

function broadcastCurrentPage(): void {
  if (!currentFile || currentFile.pages.length === 0) return;
  const page = currentFile.pages[currentPageIndex];
  window.electronAPI.sendPageChange(page);
}

function loadFile(file: PrompterFile): void {
  currentFile = file;
  currentPageIndex = 0;
  nextPageId = file.pages.reduce((max, p) => Math.max(max, p.id), 0) + 1;
  showTitleEl.textContent = file.title || translate(currentLanguage, 'untitledShow');
  renderPageList();
  showEditor();
  updatePageCounter();
  if (file.pages.length > 0) broadcastCurrentPage();
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}

// Button handlers

btnNew.addEventListener('click', async () => {
  const file = await window.electronAPI.newFile();
  loadFile(file);
});

btnOpen.addEventListener('click', async () => {
  const file = await window.electronAPI.openFile();
  if (file) loadFile(file);
});

btnSave.addEventListener('click', async () => {
  if (!currentFile) return;
  saveCurrentEdits();
  await window.electronAPI.saveFile(currentFile);
});

btnAddPage.addEventListener('click', () => {
  if (!currentFile) {
    currentFile = { title: translate(currentLanguage, 'newShow'), pages: [] };
    showTitleEl.textContent = currentFile.title;
  }
  saveCurrentEdits();

  const newPage: PrompterPage = {
    id: nextPageId++,
    title: `${translate(currentLanguage, 'page')} ${currentFile.pages.length + 1}`,
    content: '',
  };
  currentFile.pages.push(newPage);
  currentPageIndex = currentFile.pages.length - 1;
  renderPageList();
  showEditor();
  updatePageCounter();
  pageTitleInput.focus();
});

btnDeletePage.addEventListener('click', () => {
  if (!currentFile || currentFile.pages.length === 0) return;
  currentFile.pages.splice(currentPageIndex, 1);
  if (currentPageIndex >= currentFile.pages.length) {
    currentPageIndex = Math.max(0, currentFile.pages.length - 1);
  }
  renderPageList();
  showEditor();
  updatePageCounter();
  broadcastCurrentPage();
});

btnPrev.addEventListener('click', () => {
  if (!currentFile || currentPageIndex <= 0) return;
  selectPage(currentPageIndex - 1);
});

btnNext.addEventListener('click', () => {
  if (!currentFile || currentPageIndex >= currentFile.pages.length - 1) return;
  selectPage(currentPageIndex + 1);
});

btnStartPrompter.addEventListener('click', async () => {
  if (prompterActive) return;
  await window.electronAPI.openPrompterWindow();
  prompterActive = true;
  btnStartPrompter.style.display = 'none';
  btnStopPrompter.style.display = 'inline-flex';
  broadcastCurrentPage();
});

btnStopPrompter.addEventListener('click', async () => {
  if (!prompterActive) return;
  await window.electronAPI.closePrompterWindow();
  prompterActive = false;
  btnStartPrompter.style.display = 'inline-flex';
  btnStopPrompter.style.display = 'none';
});

// Auto-save edits on input
pageTitleInput.addEventListener('input', () => {
  if (!currentFile || currentFile.pages.length === 0) return;
  currentFile.pages[currentPageIndex].title = pageTitleInput.value;
  renderPageList();
});

pageContentTextarea.addEventListener('input', () => {
  if (!currentFile || currentFile.pages.length === 0) return;
  currentFile.pages[currentPageIndex].content = pageContentTextarea.value;
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.target === pageTitleInput || e.target === pageContentTextarea) return;
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    e.preventDefault();
    if (currentFile && currentPageIndex > 0) selectPage(currentPageIndex - 1);
  } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
    e.preventDefault();
    if (currentFile && currentPageIndex < (currentFile.pages.length - 1)) selectPage(currentPageIndex + 1);
  }
});

function applyLanguage(language: Language): void {
  const previousLanguage = currentLanguage;
  currentLanguage = language;
  document.documentElement.lang = language;
  appTitle.textContent = translate(language, 'appTitle');
  if (!currentFile) {
    showTitleEl.textContent = translate(language, 'noFileLoaded');
  } else if (
    currentFile.title === translate(previousLanguage, 'newShow') ||
    currentFile.title === translate(previousLanguage, 'untitledShow')
  ) {
    const isNewShowTitle = currentFile.title === translate(previousLanguage, 'newShow');
    const titleKey = isNewShowTitle ? 'newShow' : 'untitledShow';
    currentFile.title = translate(language, titleKey);
    showTitleEl.textContent = currentFile.title;
  }
  btnNew.textContent = translate(language, 'new');
  btnOpen.textContent = translate(language, 'open');
  btnSave.textContent = translate(language, 'save');
  btnAddPage.textContent = translate(language, 'addPage');
  btnSettings.textContent = translate(language, 'settings');
  sidebarTitle.textContent = translate(language, 'pages');
  editorEmptyText.textContent = translate(language, 'emptyState');
  pageTitleLabel.textContent = translate(language, 'pageTitleLabel');
  pageContentLabel.textContent = translate(language, 'pageContentLabel');
  pageTitleInput.placeholder = translate(language, 'pageTitlePlaceholder');
  pageContentTextarea.placeholder = translate(language, 'pageContentPlaceholder');
  btnDeletePage.textContent = translate(language, 'deletePage');
  btnPrev.textContent = translate(language, 'prev');
  btnPrev.title = translate(language, 'previousTitle');
  btnNext.textContent = translate(language, 'next');
  btnNext.title = translate(language, 'nextTitle');
  btnStartPrompter.textContent = translate(language, 'startPrompter');
  btnStopPrompter.textContent = translate(language, 'stopPrompter');
  settingsTitle.textContent = translate(language, 'settingsTitle');
  languageLabel.textContent = translate(language, 'language');
  settingsCloseBtn.textContent = translate(language, 'close');
  languageSelect.value = language;
  updatePageCounter();
}

btnSettings.addEventListener('click', () => {
  settingsModal.style.display = 'flex';
});

settingsCloseBtn.addEventListener('click', () => {
  settingsModal.style.display = 'none';
});

settingsModal.addEventListener('click', (event) => {
  if (event.target === settingsModal) {
    settingsModal.style.display = 'none';
  }
});

languageSelect.addEventListener('change', () => {
  const selected = languageSelect.value;
  if (selected !== 'en' && selected !== 'ja') {
    return;
  }
  const language: Language = selected;
  setSavedLanguage(language);
  applyLanguage(language);
});

applyLanguage(currentLanguage);
showEditor();
updatePageCounter();
