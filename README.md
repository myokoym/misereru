# misereru

Git で管理しやすいテキスト / project source から、スライドを生成・レンダリング・公開するツールの企画・調査リポジトリです。

> **名称 `misereru` は仮決定です。**
> 命名調査は [`docs/research/naming.md`](docs/research/naming.md) に隔離しています。

## 現在の前提

- Markdown は有力な source format だが必須ではない。
- 単一ファイル、複数ファイル、構造化データ、独自軽量フォーマット、project template のいずれも候補とする。
- 既存ツールで十分なら wrapper / adapter として利用し、独自 renderer を先に作らない。
- タイトル、テーマ、ページ設定、出力設定等は可能な限りテキストで管理する。
- スマートフォン単体でも、ChatGPT と GitHub を介して編集・管理できる構成を重視する。
- 規定位置の source / config 更新を GitHub Actions で build / publish する運用を想定する。
- 出力先は Google Slides / Google Drive、HTML / GitHub Pages、PDF、PPTX、Actions artifact 等を設定で選べる構成を検討する。
- 日本語の禁則処理、自然な改行、句読点・括弧・英数字混在時の折返し品質を重要要件とする。
- 生成物は再生成可能な artifact / publish target として正本から分離する。

## Documentation

文書構成・ライフサイクル・将来の `how-to / reference / tutorials / explanation` 追加ルールは [`docs/README.md`](docs/README.md) を正本とします。

```text
docs/
├─ README.md
├─ product/
│  └─ requirements.md
├─ research/
│  ├─ README.md
│  ├─ slide-tools.md
│  ├─ japanese-typesetting.md
│  ├─ source-output-architecture.md
│  ├─ marp-prototype.md
│  └─ naming.md
└─ adr/
   ├─ README.md
   └─ 0001-use-madr-for-decisions.md
```

### Product

現在有効な要件・前提:

- [`docs/product/requirements.md`](docs/product/requirements.md)

### Research

未確定の調査・比較・検証:

- [`docs/research/slide-tools.md`](docs/research/slide-tools.md)
- [`docs/research/japanese-typesetting.md`](docs/research/japanese-typesetting.md)
- [`docs/research/source-output-architecture.md`](docs/research/source-output-architecture.md)
- [`docs/research/marp-prototype.md`](docs/research/marp-prototype.md)
- [`docs/research/naming.md`](docs/research/naming.md)

### ADR

採用した重要判断と理由:

- [`docs/adr/`](docs/adr/)

調査メモと決定事項を混在させず、調査から判断が確定した時点で必要な背景だけを ADR に残します。
