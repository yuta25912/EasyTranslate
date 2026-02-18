# EasyTranslate

Discord Bot にAPIキー不要の翻訳・言語検知機能を追加するための新しいブロックを提供します。`deep-translator` と `langdetect` を使用して、テキストの翻訳と言語判定が簡単に実装できます。

## ✨ 特徴
- 日本語・英語・韓国語・中国語・ドイツ語・フランス語・スペイン語・イタリア語への翻訳
- テキストが何語か自動で判定（言語コード `ja`・`en` などを返す）
- **APIキー不要**でそのまま使用可能
- 非同期処理（`run_in_executor`）でボットをブロックしない設計

## 🚀 インストール方法

1.  [Easy Discord Bot Builder](https://edbplugin.github.io/easy-bdp/) を開きます。
2.  「プラグイン」ボタンをクリックします。
3.  「GitHubで探す」タブで `EasyTranslate` を検索するか、以下のインストールURLをブラウザに貼り付けます：
    `https://edbplugin.github.io/easy-bdp/editor/index.html?install-plugin=yuta25912/EasyTranslate`

## 🛠️ 開発者向け

このプラグインをローカルでテストするには、リポジトリを ZIP 形式でダウンロードし、EDBP のプラグイン画面から「ZIPからインストール」を選択してください。

### ファイル構成
- `manifest.json`: プラグインの定義
- `plugin.js`: ブロックの実装とロジック

### 依存パッケージ
- `deep-translator`（翻訳）
- `langdetect`（言語検知）

いずれも `manifest.json` の `externalPackages` に記載済みのため、自動インストールされます。

## 📄 ライセンス
このプラグインは [MIT] ライセンスの下で公開されています。
