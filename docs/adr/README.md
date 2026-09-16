# Architecture Decision Records

このディレクトリには、調査メモではなく **採用した重要な判断とその理由** を1判断1ファイルで残します。

形式は MADR (Markdown Architectural Decision Records) の考え方を採用します。

- MADR: <https://adr.github.io/madr/>
- ADR overview: <https://adr.github.io/>

## 使い分け

- `docs/product/` — 現在有効な要件・仕様
- `docs/research/` — 比較・検証・未確定の調査
- `docs/adr/` — 採用済み／提案中の重要な意思決定と理由

調査中の候補比較を ADR に入れません。判断が成立した時点で、必要な背景だけを要約して ADR を作ります。

## ファイル名

```text
NNNN-short-title.md
```

例:

```text
0001-use-madr-for-decisions.md
0002-use-marp-as-rendering-base.md
```

## 最小構成

```markdown
# Title

- Status: Proposed | Accepted | Deprecated | Superseded
- Date: YYYY-MM-DD

## Context and Problem Statement

## Considered Options

## Decision Outcome

## Consequences
```

必要に応じて詳細な比較は `../research/` へリンクします。
