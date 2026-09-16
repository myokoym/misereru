# Use MADR-style records for important decisions

- Status: Accepted
- Date: 2026-09-16

## Context and Problem Statement

このプロジェクトでは、Markdown スライド生成方式、日本語組版エンジン、出力形式、Markdown 方言など、調査を経て複数の重要な技術判断を行う予定です。

調査メモと決定事項を同じ長文に混在させると、後から「現在何が有効なのか」「なぜ決めたのか」を判別しにくくなります。

## Considered Options

- すべて `research.md` に時系列で記録する。
- README に決定事項を追記する。
- 重要な判断を ADR として1判断1ファイルで記録する。

## Decision Outcome

MADR (Markdown Architectural Decision Records) の考え方を使い、重要な判断は `docs/adr/NNNN-short-title.md` に1判断1ファイルで記録します。

未確定の比較・検証は `docs/research/`、現在有効な要件は `docs/product/` に分離します。

MADR公式は `docs/decisions` を例示していますが、MADR自体はディレクトリ構成を強制していません。このリポジトリでは用途が即座に判別できる `docs/adr/` を採用します。

参考:

- <https://adr.github.io/madr/>
- <https://adr.github.io/madr/decisions/0000-use-markdown-architectural-decision-records.html>

## Consequences

- 命名調査など一時的な比較ノイズを、長期的な技術判断から切り離せます。
- 決定が覆った場合も、過去の ADR を削除せず `Deprecated` / `Superseded` として経緯を残せます。
- 新しい重要判断ごとにファイルが増えますが、各判断の文脈と理由を独立して追跡できます。
