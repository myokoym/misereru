# misereru

Markdown を正本として、スライドを生成・レンダリングするツールの企画・調査リポジトリです。

> **名称 `misereru` は仮決定です。**
> 命名調査は [`docs/research/naming.md`](docs/research/naming.md) に隔離しています。

## 現在の前提

- 編集対象は Markdown を中心とし、スライド側を直接編集しない。
- タイトル、テーマ、ページ設定、出力設定などのメタ情報もテキストで管理する。
- スマートフォン単体でも、ChatGPT と GitHub を介して編集・管理できる構成を重視する。
- 日本語の禁則処理、自然な改行、句読点・括弧・英数字混在時の折返し品質を重要要件とする。
- PDF / HTML 等の生成物は再生成可能な artifact として扱う。
- 既存ツールを採用する可能性と、自作する可能性の両方を残す。

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
- [`docs/research/naming.md`](docs/research/naming.md)

### ADR

採用した重要判断と理由:

- [`docs/adr/`](docs/adr/)

調査メモと決定事項を混在させず、調査から判断が確定した時点で必要な背景だけを ADR に残します。
