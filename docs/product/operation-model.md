# Initial operation model

最終更新: 2026-09-17

misereru の初期運用で利用者が通常触る経路を定義します。

## 基本モデル

1つのスライド資料を、原則1つの GitHub repository として管理します。

```text
misereru template repository
  ↓ Use this template
presentation repository
  ├─ slides.md
  ├─ misereru.config.json
  ├─ assets/
  ├─ themes/
  └─ GitHub Actions
```

通常の編集では `slides.md` を更新します。必要な場合だけ `misereru.config.json` や assets / theme を変更します。

```text
slides.md を編集
  ↓ push / merge
GitHub Actions
  ↓
Marp
  ├─ HTML             常時生成
  │   └─ GitHub Pages 設定時のみ公開
  └─ PDF              設定時のみ
```

Google Slides / PPTX は初期テンプレートの production target には含めません。renderer とデザインの一貫性を維持できる方式が検証できるまで research / prototype 扱いとします。

## 初期 source

初期テンプレートでは Markdown を正本 source とします。

- 既定ファイル: `slides.md`
- ページ区切り: `---`
- 外部リンク: 通常の Markdown link
- stable slide identity が必要なページは page config comment の `key` を利用可能
- 正本 `slides.md` には `marp: true` 等の renderer 固有 front matter を要求しない

これは初期運用経路の決定です。misereru 全体を永久に Markdown 専用へ固定するものではありません。

## Renderer 方針

### 初期 production renderer: Marp

初期版は renderer を1系統に限定します。

```text
slides.md
  ↓ misereru adapter
Marp用の一時入力
  ↓ Marp
  ├─ HTML
  └─ PDF
```

Marp 固有 front matter / theme 指定は build 時に一時入力へ注入し、利用者が編集する `slides.md` 自体には持ち込みません。

ここでいう「build 時に注入」は、正本MarkdownをMarpとdeckの両方に混在させる意味ではありません。初期production buildはMarpだけを呼び出します。

### k1LoW/deck

`deck` は Markdown から Google Slides を生成・更新するツールです。HTMLファイルを出力するrendererではありません。

そのため Marp と deck を同時にproduction targetへ入れると、次の2系統のデザイン実装を維持する必要があります。

```text
Marp theme / CSS
Google Slides base presentation / layout
```

内容sourceを共有できても、見た目を同一の成果物として保証できません。初期版ではこの二重メンテナンスを採用しません。

`deck` を使ったGoogle Slides生成は research / prototype で継続し、次のどちらかが成立した場合に改めてproduction targetへ昇格させます。

- 同一のデザイン定義を複数rendererへ安定して適用できる共通レイアウトモデルを持つ。
- Google Slidesを別デザイン系の成果物として明示的に許容する仕様を採用する。

どちらも現時点では未決定です。

### PPTX

初期版では未対応です。MarpのPPTXを正式採用するとも決めません。

## 出力

### HTML

初期版の必須 output です。

- 設定なしでも生成できる既定 target とする。
- `slides.md` / config / theme の変更で GitHub Actions が自動 build する。
- 公開用HTMLは `dist/site/` に分離する。
- 生成物は Actions artifact として常に取得可能にする。
- GitHub Pages 公開は明示的に有効化するまで行わない。

### GitHub Pages

HTMLの生成とは別の publish target です。

`misereru.config.json` の `publish.githubPages.enabled` を `true` にすると、default branch の build で次を行います。

```text
HTML build
  ↓
actions/upload-pages-artifact
  ↓
actions/configure-pages
  ↓
actions/deploy-pages
  ↓
GitHub Pages
```

feature branch からは Pages へ deploy しません。

GitHub の制約上、各 presentation repository で Pages 自体が未有効の場合、標準の `GITHUB_TOKEN` だけでは `configure-pages` が自動有効化できません。初回だけ repository の Settings > Pages で GitHub Actions publishing を有効にする運用を基本とします。自動有効化のためだけに高権限PATを標準要求しません。

### PDF

初期版で任意 output として扱います。

- `misereru.config.json` で有効化した場合だけ生成する。
- HTML と同じ Marp renderer / theme を使う。

## 設定とフォールバック

`misereru.config.json` が project ごとの output / publish 設定を持ちます。

初期方針:

- HTML: 必須・常時生成
- GitHub Pages: optional publish
- PDF: optional output
- Google Slides: production未対応
- PPTX: production未対応

初期production設定では `outputs` に `html` / `pdf` 以外を指定した場合、build error にします。未検証rendererへ黙って分岐しません。

## 日常運用

想定する通常操作は次だけです。

```text
1. template repository から新しい資料 repository を作る
2. slides.md を ChatGPT / GitHub で編集する
3. commit / push
4. Actions が HTML を生成する
5. 必要なら PDF / Pages を config で有効化する
```

ローカル PC、PowerPoint、Node.js CLI を日常操作の必須工程にしません。
