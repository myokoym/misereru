# Add topic-named Markdown sources for AI reuse

- Status: Accepted
- Date: 2026-09-19

## Context and Problem Statement

misereruでは、research、article、slides、presentation scriptを用途別に管理できる。一方、ChatGPT等へそのままアップロードして、特定主題の共通知識・判断基準として再利用する成果物がなかった。

articleは人間向けの読み物であり、Agent SkillはAIへ作業手順を与えるものなので、どちらもこの用途とは一致しない。

当初は `ai-reference.md` のような固定名も候補になったが、ファイルをrepository外へダウンロードすると主題が分からなくなる。また、小概念ごとに多数ファイルへ分割すると、ChatGPT側で参照漏れ、重複、定義ずれが増える。

## Decision Outcome

AI向け参照資料は、root直下ではなく `ai-sources/` にまとめ、固定名ではなく**主題名をそのままファイル名にしたMarkdown**として扱う。

例:

```text
ai-sources/level-design.md
ai-sources/urban-planning.md
ai-sources/openjev.md
```

原則は **1つのまとまった主題 = 1ファイル**。

主題として一体で説明できる限り、多少長くても1ファイルを維持する。flow、pacing、wayfinding等の小概念ごとに機械的に分割しない。

複数ファイル化は、別主題として単独利用する意味があり、前提・対象・判断基準が明確に異なる場合だけ行う。文字数だけを理由に分割しない。

## Relationship to Agent Skills

`.agents/skills/misereru-ai-source-writing/SKILL.md` は、topic-named Markdownの**作成・レビュー方法**を定める。

一方、`ai-sources/level-design.md` 等はChatGPT等へアップロードする**成果物そのもの**である。repository内ではfolderで用途を明示し、download後は `level-design.md` のように主題名だけが残る。

両者を同じ「Skill」として扱わない。

## Relationship to Other Sources

調査型repositoryでは:

- `research.md`: 出典、確認状態、留保、反例、履歴
- `article.md`: 人間向けの連続した説明
- `slides.md`: 視覚的提示
- topic-named AI source: AIが判断に再利用しやすい定義、手順、条件、反例、hard gate、anti-pattern

と役割を分ける。

topic-named AI sourceはresearchの事実関係に従い、articleの単純要約として作らない。

## Consequences

- ダウンロード後もファイル名だけで主題が識別できる。
- ChatGPTプロジェクトへそのままアップロードしやすい。
- 一主題を一ファイルへまとめるため、参照漏れ・重複・定義ずれを抑えやすい。
- 必要なら1projectで複数主題ファイルを持てる。
- templateには主題不明のplaceholder Markdownを置かない。
- root直下の `research.md` / `article.md` / `slides.md` とAI向けsourceの役割を、`ai-sources/` で視覚的に分離できる。
