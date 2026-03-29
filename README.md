# Prompter

Windows / Mac で動作するライブ用プロンプターソフトウェアです。

## 機能

- **デュアルディスプレイ対応**: 1画面が進行制御用、もう1画面がプロンプター表示用
- **ファイル管理**: `.prompter` 形式でショーのスクリプトを作成・保存・読み込み
- **ページ切り替え**: 手動でページを切り替え（ボタン操作 / キーボードショートカット）
- **ファイル作成機能**: ページの追加・編集・削除

## 操作方法

### 起動後の流れ

1. アプリを起動すると **コントロール画面** が表示されます
2. **New** で新規作成、**Open** で既存ファイルを読み込みます
3. ページを追加・編集します（+ Add Page ボタン）
4. **Save** でファイルを保存します（`.prompter` 拡張子）
5. **▶ Start Prompter** を押してプロンプター画面を開始します
6. ← → ボタン（またはキーボード）でページを切り替えます

### キーボードショートカット

| キー | 動作 |
|------|------|
| `←` / `↑` | 前のページへ |
| `→` / `↓` / `Space` | 次のページへ |

> ※ テキスト入力中はショートカットが無効化されます

## プロンプターファイル形式 (.prompter)

```json
{
  "title": "My Show",
  "pages": [
    {
      "id": 1,
      "title": "Opening",
      "content": "Welcome to the show!\nThis is the content."
    }
  ]
}
```

## 開発・ビルド

### 必要環境

- Node.js 20+
- npm

### セットアップ

```bash
npm install
```

### 開発用起動

```bash
npm start
```

### ビルド（パッケージ作成）

```bash
# Windows (.exe)
npm run dist:win

# macOS (.dmg)
npm run dist:mac
```

ビルド成果物は `release/` ディレクトリに出力されます。

## GitHub Actions による自動ビルド

`main` ブランチへ push するか、`v*` タグをプッシュするか、Actions タブから手動実行すると Windows・macOS 向けのバイナリが自動でビルドされます。

```bash
git tag v1.0.0
git push origin v1.0.0
```

Artifacts として `windows-build`（.exe）と `macos-build`（.dmg）がダウンロードできます。

macOS 版を配布して「壊れているため開けません」と表示されないようにするため、署名・公証（notarization）用の Secrets（`APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, `APPLE_TEAM_ID`, `CSC_LINK`, `CSC_KEY_PASSWORD`）を設定してください。
