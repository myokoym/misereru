# misereru

Git で管理しやすいテキスト / project source から、スライドを生成・レンダリング・公開するツールの企画・調査リポジトリです。

> **名称 `misereru` は仮決定です。**
> 命名調査は [`docs/research/naming.md`](docs/research/naming.md) に隔離しています。

## 初期運用

初期版では、この repository 自体を GitHub Template Repository として使い、原則 **1資料 = 1 repository** で管理します。

```text
misereru template repository
  ↓ Use this template
presentation repository
  ↓
slides.md を編集
  ↓ push / merge
GitHub Actions
  ↓
HTML を自動生成
  ├─ PDF              設定時のみ
  ├─ Google Slides    設定時のみ
  └─ PPTX             初期版では未接続
```

通常の編集対象は `slides.md` です。出力設定は `misereru.config.json` に置きます。

- HTML は初期版の必須・既定 output。
- PDF は optional。
- Google Slides は optional。実 `deck apply` 経路の検証完了後に template workflow へ接続する。
- PPTX は候補として残すが初期版では未接続。
- GitHub Pages は明示的に有効化するまで公開しない。
- 未接続 target を `enabled:true` にした場合は黙ってスキップせず build error にする。

詳細: [`docs/product/operation-model.md`](docs/product/operation-model.md)

## 現在の前提

- 初期 template の正本 source は Markdown (`slides.md`) とする。
- 将来の source adapter 拡張まで Markdown 専用へ固定するものではない。
- 既存ツールで十分なら wrapper / adapter として利用し、独自 renderer を先に作らない。
- タイトル、テーマ、ページ設定、出力設定等は可能な限りテキストで管理する。
- スマートフォン単体でも、ChatGPT と GitHub を介して編集・管理できる構成を重視する。
- 規定位置の source / config 更新を GitHub Actions で build / publish する。
- 日本語の禁則処理、自然な改行、句読点・括弧・英数字混在時の折返し品質を重要要件とする。
- 生成物は再生成可能な artifact / publish target として正本から分離する。

## Template files

```text
slides.md               # 通常編集するスライド source
misereru.config.json     # output / publish 設定
themes/                  # 共通テーマ
.github/workflows/       # 自動 build
```

`slides.md` または設定・themeを変更して push すると、`.github/workflows/build.yml` が設定済み output を生成します。

## Documentation

文書構成・ライフサイクル・将来の `how-to / reference / tutorials / explanation` 追加ルールは [`docs/README.md`](docs/README.md) を正本とします。

### Product

- [`docs/product/requirements.md`](docs/product/requirements.md)
- [`docs/product/operation-model.md`](docs/product/operation-model.md)

### Research

未確定の調査・比較・検証:

- [`docs/research/slide-tools.md`](docs/research/slide-tools.md)
- [`docs/research/japanese-typesetting.md`](docs/research/japanese-typesetting.md)
- [`docs/research/source-output-architecture.md`](docs/research/source-output-architecture.md)
- [`docs/research/marp-prototype.md`](docs/research/marp-prototype.md)
- [`docs/research/naming.md`](docs/research/naming.md)

### ADR

- [`docs/adr/0001-use-madr-for-decisions.md`](docs/adr/0001-use-madr-for-decisions.md)
- [`docs/adr/0002-use-template-repository-with-html-default.md`](docs/adr/0002-use-template-repository-with-html-default.md)

調査メモと決定事項を混在させず、調査から判断が確定した時点で必要な背景だけを ADR に残します。
