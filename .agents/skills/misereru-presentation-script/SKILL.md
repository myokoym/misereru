---
name: misereru-presentation-script
description: Create and maintain optional presentation-script.md narration alongside slides.md in misereru repositories. Use when adding or revising spoken narration, cross-checking slide and narration structure, or preparing a complete pair for deterministic AI-assisted presentation video generation.
---

# misereru presentation script

`presentation-script.md` を使う場合に、`slides.md` と対応する発表原稿を生成・再構成・推敲し、両者を相互レビューするためのSkillです。

`presentation-script.md` は **任意** です。`slides.md` だけで資料を作る運用を標準で許容し、原稿ファイルが存在しないことを欠陥として扱いません。

原稿を使う場合の目的は、単なるspeaker notesの追加ではありません。

- 人間がそのまま発表原稿として読めること
- slideと原稿をstable `key`で一意に対応付けられること
- 必要なslideだけ部分的に原稿を持てること
- 完全な原稿がある場合は、AIへ両方を渡したときに何を読み、いつ次へ進むかを推測しなくてよいこと
- slideと原稿を両方向から確認し、構成矛盾・欠落・順序不整合を検出できること

`presentation-script.md` はvideo rendererやTTS engine専用の設定ファイルではありません。renderer固有の記法を正本へ持ち込まず、必要な変換はadapter側で行います。

## 適用範囲

次の場合に使います。

- `presentation-script.md` を新規作成する
- 一部のslideだけ口頭説明を追加する
- `slides.md` の追加・削除・変更に既存原稿を追随させる
- 既存の発表原稿を自然な話し言葉へ整える
- slideと原稿の主張・順序・前提を相互チェックする
- slide + narrationを発表動画へ投入できる完全な状態か確認する

**ユーザーが原稿を求めていない場合、`presentation-script.md` を勝手に必須化しません。** `slides.md` だけを編集する依頼では、原稿を新規作成する必要はありません。

slide本文そのものの文章設計には `misereru-slide-writing` も併用します。

## 1. sourceとidentity

常に必要なのは `slides.md` です。

```text
slides.md
```

原稿を使う資料だけ、次を追加します。

```text
slides.md
presentation-script.md   # optional
```

対応付けにページ番号を使いません。

`slides.md`:

```md
<!-- {"key":"body"} -->
# 通常の本文ページ
```

`presentation-script.md`:

```md
<!-- {"slide":"body"} -->
## 通常の本文ページ

### Narration

ここでは通常の本文ページを例にします。……
```

`slide` は `slides.md` のstable `key` を参照します。

- slideを並べ替えてもkeyを変えない
- 意味を保った修正でもkeyを変えない
- script entryを残す場合は、参照先keyが存在する状態を保つ
- keyを変更する必要がある場合は、対応するscript entryも同じ変更で更新する
- **slideを追加しただけではscript entry追加を必須にしない**
- **slideを削除した場合、対応script entryが残っていれば削除する**

## 2. v1 format

ファイル先頭にformat metadataを置けます。

```md
<!-- {"misereru":"presentation-script","version":1,"defaultAdvance":"after-narration"} -->
```

各entryは `---` で区切り、次を基本形とします。

```md
<!-- {"slide":"stable-key"} -->
## slide title

### Narration

自然な口頭説明を書く。
```

### entryの必須要素

- `slide`: 対応するstable key
- `### Narration`: 実際に読み上げる本文

`##` 見出しは人間が追いやすくするために置きます。identityは見出しではなく `slide` metadataです。

原稿を置かないslideには空entryを作らず、entry自体を省略します。これにより、書き忘れた空原稿と「このslideには原稿を持たない」という状態を混同しません。

### generated TOC

misereruが目次を自動生成する場合、最終presentationには `__misereru_toc__` が入ります。

```md
<!-- {"slide":"__misereru_toc__","generated":true} -->
## 目次

### Narration

最初に全体の流れを確認します。……
```

このentryも通常運用では任意です。**video-readyとして全slide分の原稿を要求する場合だけ必須**です。

## 3. narrationを書く

### slide本文を読み上げない

原稿はslide本文の逐語読み上げにしません。

slide:

```md
# 導入理由

- 日本語技術文の品質安定
- AI生成文の癖を抑制
- レビュー基準の共通化
```

原稿では、箇条書きをそのまま三回読み上げるのではなく、項目同士の関係や背景を自然に説明します。

### 新しい事実を勝手に追加しない

原稿だけに新しい数値、条件、固有名詞、結論、出典依存の主張を追加しません。

口頭説明に必要な言い換え、接続、例示は可能ですが、slideや資料全体の根拠から導けない情報を原稿で補わないでください。

### 話し言葉として自然にする

- 文を短めに区切る
- 画面を見れば分かる列挙を全部読み上げない
- `次に`、`ここでは` 等の接続は実際のslide順と一致させる
- 過剰な前置き、空疎な強調、同じ結論の反復を避ける
- コードやURLを文字列として読み上げず、何を示すものか説明する

### 資料モードとの関係

Presented mode:

- slideに載せない補足説明をnarrationで自然に補える
- ただし主要メッセージ自体はslideから把握できる状態を保つ

Reference mode:

- 原稿へ重要情報を逃がしてslide単体の自己完結性を落とさない
- narrationは閲覧資料を口頭説明する場合の補助として扱う

Mixed mode:

- slideは単体でも主要内容を把握できる
- narrationでは関係・背景・読み方を補う

## 4. 初期video contract

**完全な原稿を動画生成へ使う場合**、AIやfuture rendererへ `slides.md` と `presentation-script.md` を渡し、明示指定がなければ次のsemanticsを使います。

1. presentationのslide順は `slides.md` とbuild時に生成されるslide sequenceを正とする。
2. stable `key`で対応する `### Narration` を読み上げる。
3. 読み上げ対象は `### Narration` 本文だけ。slide本文を追加で読み上げない。
4. narration中は対応slideを表示し続ける。
5. cueがなければzoom、highlight、pointer、fragment reveal等を勝手に追加しない。
6. narration音声終了後、短いtail holdを置いて次slideへ進む。
7. slide durationは原則として生成音声の実長から導出する。秒数を原稿側で常時手入力しない。
8. transitionはrenderer / project既定に従い、通常は原稿sourceへ書かない。
9. 字幕が必要ならnarrationと生成音声timingからWebVTT等を派生生成する。

このcontractによって、追加の演出指定がなくても「静止slide + narration + deterministic advance」の動画を作れます。

部分原稿は人間の発表補助や途中作成状態として有効ですが、それだけでvideo-readyとは扱いません。

## 5. optional extension

次は必要な場合だけ追加する将来拡張です。

- pronunciation: 固有名詞・略語等の読み
- pause: 自動処理では不足する明示的な間
- cues: highlight / pointer / reveal等
- explicit hold: 意図的な無音表示

schemaがrepositoryで確定していない段階では、独自のcue記法を勝手に発明して正本へ書き込まないでください。

SSML、WebVTT、Remotion component等はcanonical authoring formatではなく、必要なtarget向けの派生形式として扱います。

## 6. deterministic consistency check

### 通常build

`presentation-script.md` が存在しない場合は **検査をスキップし、warningも出しません**。

存在する場合は、書かれているentryだけを構造検査します。

- `slides.md` のstable keyに重複がない
- scriptの`slide`参照に重複がない
- scriptが存在しないslide keyを参照していない
- 各entryに空でない `### Narration` がある
- format versionが明示されている場合、対応可能なversionである

通常buildでは次をエラーにしません。

- scriptが一部のslideにしか存在しない
- generated TOCのscript entryがない
- script entryの記載順がslide順と異なる

stable `key`で対応できるため、原稿ファイルの物理的な順序をpresentation sequenceの正本にしません。

### video-ready check

動画生成へ投入する完全な組として扱う場合だけ、通常検査に加えて **最終presentationの全slideにscript entryがあること**を要求します。

misereru templateでは次を使います。

```bash
npm run build:video-ready
```

このチェックでは、build時に生成される `__misereru_toc__` も最終slideに含まれる場合はcoverage対象です。

## 7. semantic cross review

`presentation-script.md` が存在する場合、機械的なkey一致だけでなく両方向から内容を確認します。部分原稿なら、entryが存在するslideだけを対象にしてかまいません。

### slides → script

各対象slideについて確認します。

- 主要メッセージをnarrationが別の意味へ変えていないか
- 重要な条件・留保・比較を落としていないか
- slideに示した図表・コードの説明が実際の内容と合っているか
- 前後slideへの接続が実際の順序と一致するか
- slide本文の単純な読み上げになっていないか

### script → slides

各narrationについて確認します。

- 原稿だけに重要な主張や前提を追加していないか
- 原稿の論理順で説明すると、slide順が不自然にならないか
- 原稿に必要なのにslide側から完全に読み取れない主要論点がないか
- `この3点`、`次の図` 等の参照が画面上の内容と一致するか
- Reference modeで、本来slideに必要な内容を原稿へ逃がしていないか

矛盾を見つけた場合、原稿だけをslideへ合わせて終了しません。問題がslide構成にあるなら、`misereru-slide-writing` の規則に従ってslide側も修正候補へ戻します。

## 8. 更新手順

### slidesだけを扱う場合

```text
slides.mdを編集
  ↓
slide-writingの自己レビュー
  ↓
通常build
```

原稿が存在しないことを理由に `presentation-script.md` を新規作成しません。

### 原稿も扱う場合

```text
slides.md / presentation-script.mdを編集
  ↓
既存script entryの参照先を確認
  ↓
通常buildの構造検査
  ↓
slides → script semantic review
  ↓
script → slides semantic review
  ↓
必要ならslide / scriptを再修正
```

動画化可能な完全状態を求める場合だけ、最後に `npm run build:video-ready` 相当のcomplete checkを行います。

## 9. 完了条件

### slides-only

- `slides.md` が `misereru-slide-writing` の完了条件を満たす
- `presentation-script.md` は不要

### partial script

- 書かれているentryのkey参照が有効
- 各entryに読み上げ可能なNarrationがある
- 対応slideとの意味矛盾がない
- 原稿だけの重要情報が残っていない

### video-ready

partial scriptの条件に加えて:

- 最終presentationの全slideにscript entryがある
- default video contractだけで発表動画の基本進行を決められる

## 参照

misereru内の調査:

- `docs/research/presentation-script-and-video.md`（develop branch）

外部仕様・実装:

- Marpit presenter notes: <https://github.com/marp-team/marpit/blob/main/docs/directives.md>
- Marp CLI: <https://github.com/marp-team/marp-cli>
- Slidev Syntax Guide 日本語: <https://ja.sli.dev/guide/syntax>
- reveal.js Speaker View: <https://revealjs.com/speaker-view/>
- reveal.js Auto-Slide / Fragments: <https://revealjs.com/auto-slide/>
- Microsoft PowerPoint「プレゼンテーションを記録する」: <https://support.microsoft.com/ja-jp/powerpoint/record-your-presentation>
- Microsoft PowerPoint「プレゼンテーションをビデオに変換する」: <https://support.microsoft.com/ja-jp/powerpoint/turn-your-presentation-into-a-video>
- W3C SSML 1.1: <https://www.w3.org/TR/speech-synthesis11/>
- W3C WebVTT: <https://www.w3.org/TR/webvtt1/>
- Remotion Sequence: <https://www.remotion.dev/docs/sequence>
