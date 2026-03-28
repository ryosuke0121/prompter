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

let currentFile: PrompterFile | null = null;
let currentPageIndex = 0;
let prompterActive = false;
let nextPageId = 1;

// DOM Elements
const showTitleEl = document.getElementById('show-title') as HTMLSpanElement;
const pageListEl = document.getElementById('page-list') as HTMLUListElement;
const editorEmpty = document.getElementById('editor-empty') as HTMLDivElement;
const editorForm = document.getElementById('editor-form') as HTMLDivElement;
const pageTitleInput = document.getElementById('page-title') as HTMLInputElement;
const pageContentTextarea = document.getElementById('page-content') as HTMLTextAreaElement;
const pageCounterEl = document.getElementById('page-counter') as HTMLSpanElement;

const btnNew = document.getElementById('btn-new') as HTMLButtonElement;
const btnOpen = document.getElementById('btn-open') as HTMLButtonElement;
const btnSave = document.getElementById('btn-save') as HTMLButtonElement;
const btnAddPage = document.getElementById('btn-add-page') as HTMLButtonElement;
const btnDeletePage = document.getElementById('btn-delete-page') as HTMLButtonElement;
const btnPrev = document.getElementById('btn-prev') as HTMLButtonElement;
const btnNext = document.getElementById('btn-next') as HTMLButtonElement;
const btnStartPrompter = document.getElementById('btn-start-prompter') as HTMLButtonElement;
const btnStopPrompter = document.getElementById('btn-stop-prompter') as HTMLButtonElement;

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
    pageCounterEl.textContent = '— / —';
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
  showTitleEl.textContent = file.title || 'Untitled Show';
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
    currentFile = { title: 'New Show', pages: [] };
    showTitleEl.textContent = currentFile.title;
  }
  saveCurrentEdits();

  const newPage: PrompterPage = {
    id: nextPageId++,
    title: `Page ${currentFile.pages.length + 1}`,
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

// Initial render
showEditor();
updatePageCounter();
