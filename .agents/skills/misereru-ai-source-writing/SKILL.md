---
name: misereru-ai-source-writing
description: Create and maintain topic-named Markdown source documents for direct upload to ChatGPT or other AI projects. Use when turning research, articles, or slide materials into a reusable AI reference without forcing the content into article or slide form.
---

# misereru AI source writing

このSkillは、調査・記事・スライド等から、ChatGPT等のAIへそのままアップロードして再利用できるMarkdown参照資料を作成・更新するための規則を定める。

## 1. 目的

AI向けsourceは、人間向け記事の要約でも、Agent Skillそのものでもない。

- `.agents/skills/.../SKILL.md`: AI agentへ「どう作業するか」を教える
- article / slides: 人間へ説明・提示する
- AI向けsource: AIへ「この主題について何を知り、何を区別し、どう判断すべきか」を渡す

AI向けsourceはChatGPTプロジェクト等へ単独でアップロードして使える状態を目指す。

## 2. ファイル名

ファイル名は役割名ではなく**主題名**にする。

推奨:

```text
level-design.md
urban-planning.md
openjev.md
museum-management.md
```

避ける:

```text
ai-reference.md
knowledge.md
source.md
skill.md
guide.md
```

ダウンロード後にrepositoryやfolderの文脈を失っても、ファイル名だけで主題が分かることを優先する。

## 3. 分割原則

原則は **1つのまとまった主題 = 1ファイル**。

主題として一体で説明できるなら、多少長くなっても1ファイルを維持する。flow、pacing、wayfinding等の小概念ごとに機械的に細分化しない。

複数ファイルへ分けるのは、次を満たす場合だけ。

- 別の主題として単独利用する意味がある
- 前提・対象・判断基準が明確に異なる
- 分割した方が更新責任や適用範囲が明確になる

文字数だけを理由に分割しない。

例:

```text
level-design.md
procedural-level-design.md
multiplayer-map-design.md
```

は成立しうるが、

```text
level-design-flow.md
level-design-pacing.md
level-design-wayfinding.md
```

のような細切れ化は、独立利用の必要がない限り避ける。

## 4. 単体性

各ファイルは、その主題について単独で主要判断ができる程度に自己完結させる。

含める候補:

- Purpose / Scope
- 中心モデル・作業定義
- 重要な概念の区別
- 判断手順
- 適用条件
- 例外・反例
- Hard gates / Anti-patterns
- References
- 更新ルール

ただし、すべてのファイルへ同じ章構成を機械的に強制しない。

## 5. research / article / slidesとの関係

調査型repositoryでは、AI向けsourceを根拠の正本にしない。

- `research.md`: 出典、確認状態、反例、留保、調査履歴
- `article.md`: 人間が順に読んで理解する説明
- `slides.md`: 視覚的に提示する資料
- topic-named AI source: AIが判断に再利用しやすい形へ再構成した参照資料

AI向けsourceはresearchの事実関係に従う。articleの文章を単純に短縮して作らない。

## 6. AI向けに再構成する

AI向けsourceでは、説明文だけでなく判断に必要な構造を明示する。

特に有効なもの:

- AとBを混同しないための定義
- 「典型的手段」と「普遍原則」の分離
- 適用条件
- 反例
- 誤った一般化
- 検討順序
- hard gate
- anti-pattern
- source由来の事実と、本資料での作業定義の区別

人間向けの記事らしい導入・比喩・重複説明は、AIの判断に不要なら削ってよい。

## 7. 根拠と留保

外部情報に基づく重要な判断規則は、可能な範囲でReferencesから追跡できるようにする。

- 出典の条件を落とさない
- 一作品の事例を普遍原則にしない
- working definitionを業界標準定義として書かない
- sourceが支持していない数値・固有名詞・因果を追加しない
- researchで未確認の内容を確定事項にしない

## 8. ChatGPTへアップロードする前提

ファイルはダウンロード後にそのままChatGPT等へアップロードできることを前提とする。

そのため:

- 主題が分かるファイル名にする
- H1でも主題を明示する
- repository内部だけで通じる略称を前提にしない
- 「上の記事」「このスライド」等の外部文脈依存表現を避ける
- 重要な判断に必要な定義・留保を別ファイル参照だけにしない
- raw HTML等へ依存せずMarkdownで完結させる

Referencesでrepository内のresearchを補助参照してよいが、それを読まないと主要判断が成立しない構造にはしない。

## 9. Cross review

作成・更新後は少なくとも次を確認する。

### research / article → AI source

- 主要概念が落ちていないか
- 条件・留保・反例が消えていないか
- working definitionが事実化されていないか
- articleの説明上の簡略化をそのまま絶対ルール化していないか

### AI source → research / article

- AI sourceだけに重要な新規主張がないか
- 判断規則に必要な根拠がresearchに存在するか
- AI向けに整理したことで、article側の概念矛盾が見つからないか

## 10. 完了条件

- ファイル名だけで主題が分かる
- 1主題として過度に細切れになっていない
- 単体で主要判断に利用できる
- 主要定義・条件・反例・anti-patternが必要に応じて含まれる
- research等の根拠sourceと矛盾しない
- AI向けに新しい未確認事実を作っていない
- Markdown単体で成立する
- ChatGPT等へそのままアップロードしてもrepository文脈なしで用途が分かる
