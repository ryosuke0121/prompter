export type Language = 'en' | 'ja';

type Dictionary = Record<string, string>;

const resources: Record<Language, Dictionary> = {
  en: {
    appTitle: '⚡ Prompter',
    noFileLoaded: 'No file loaded',
    new: 'New',
    open: 'Open',
    save: 'Save',
    addPage: '+ Add Page',
    settings: 'Settings',
    pages: 'Pages',
    emptyState: 'Open or create a file to get started.',
    pageTitleLabel: 'Page Title',
    pageContentLabel: 'Content',
    pageTitlePlaceholder: 'Enter page title...',
    pageContentPlaceholder: 'Enter page content...',
    deletePage: 'Delete Page',
    prev: '← Prev',
    next: 'Next →',
    startPrompter: '▶ Start Prompter',
    stopPrompter: '■ Stop Prompter',
    settingsTitle: 'Settings',
    language: 'Language',
    close: 'Close',
    previousTitle: 'Previous (←)',
    nextTitle: 'Next (→)',
    untitledShow: 'Untitled Show',
    newShow: 'New Show',
    page: 'Page',
    noPageCounter: '— / —',
  },
  ja: {
    appTitle: '⚡ プロンプター',
    noFileLoaded: 'ファイル未読み込み',
    new: '新規',
    open: '開く',
    save: '保存',
    addPage: '+ ページ追加',
    settings: '設定',
    pages: 'ページ',
    emptyState: 'ファイルを開くか新規作成してください。',
    pageTitleLabel: 'ページタイトル',
    pageContentLabel: '内容',
    pageTitlePlaceholder: 'ページタイトルを入力...',
    pageContentPlaceholder: 'ページ内容を入力...',
    deletePage: 'ページ削除',
    prev: '← 前',
    next: '次 →',
    startPrompter: '▶ プロンプター開始',
    stopPrompter: '■ プロンプター停止',
    settingsTitle: '設定',
    language: '言語',
    close: '閉じる',
    previousTitle: '前へ (←)',
    nextTitle: '次へ (→)',
    untitledShow: '無題のショー',
    newShow: '新規ショー',
    page: 'ページ',
    noPageCounter: '— / —',
  },
};

const LANGUAGE_KEY = 'prompter-language';

export function getInitialLanguage(): Language {
  const saved = window.localStorage.getItem(LANGUAGE_KEY);
  return saved === 'ja' ? 'ja' : 'en';
}

export function setSavedLanguage(language: Language): void {
  window.localStorage.setItem(LANGUAGE_KEY, language);
}

export function translate(language: Language, key: keyof typeof resources.en): string {
  return resources[language][key];
}
