---
name: misereru-presentation-script
description: Create and maintain presentation-script.md alongside slides.md in misereru repositories. Use when adding or revising spoken narration, keeping slide and narration structure consistent, reviewing both directions for semantic mismatches, or preparing the pair for deterministic AI-assisted presentation video generation.
---

# misereru presentation script

`slides.md` と対になる `presentation-script.md` を生成・再構成・推敲し、両者を相互レビューするためのSkillです。

目的は単なるspeaker notesの追加ではありません。

- 人間がそのまま発表原稿として読めること
- slideと原稿をstable `key`で一意に対応付けられること
- AIへ両方を渡したとき、何を読み、いつ次へ進むかを推測しなくてよいこと
- slideと原稿を両方向から確認し、構成矛盾・欠落・順序不整合を検出できること

`presentation-script.md` はvideo rendererやTTS engine専用の設定ファイルではありません。renderer固有の記法を正本へ持ち込まず、必要な変換はadapter側で行います。

## 適用範囲

次の場合に使います。

- `presentation-script.md` を新規作成する
- `slides.md` の追加・削除・並べ替えに原稿を追随させる
- 既存の発表原稿を自然な話し言葉へ整える
- slideと原稿の主張・順序・前提を相互チェックする
- slide + narrationから発表動画を作れる状態か確認する

slide本文そのものの文章設計には `misereru-slide-writing` も併用します。

## 1. 正本ファイルとidentity

初期templateでは次の2ファイルを対として扱います。

```text
slides.md
presentation-script.md
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
- slideを削除したら対応script entryも削除する
- slideを追加したら対応script entryも追加する
- keyを変更する必要がある場合は両ファイルを同じ変更で更新する

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

### 必須要素

- `slide`: 対応するstable key
- `### Narration`: 実際に読み上げる本文

`##` 見出しは人間が追いやすくするために置きます。identityは見出しではなく `slide` metadataです。

### generated TOC

misereruが目次を自動生成する場合、最終presentationには `__misereru_toc__` が入ります。

```md
<!-- {"slide":"__misereru_toc__","generated":true} -->
## 目次

### Narration

最初に全体の流れを確認します。……
```

目次が生成される資料では、動画化した最終slide sequenceと一致させるため、このentryも持たせます。

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

AIやfuture rendererへ `slides.md` と `presentation-script.md` を渡す場合、明示指定がなければ次のsemanticsを使います。

1. 対応slideを表示してから `### Narration` を読み上げる。
2. 読み上げ対象は `### Narration` 本文だけ。slide本文を追加で読み上げない。
3. narration中は対応slideを表示し続ける。
4. cueがなければzoom、highlight、pointer、fragment reveal等を勝手に追加しない。
5. narration音声終了後、短いtail holdを置いて次slideへ進む。
6. slide durationは原則として生成音声の実長から導出する。秒数を原稿側で常時手入力しない。
7. transitionはrenderer / project既定に従い、通常は原稿sourceへ書かない。
8. 字幕が必要ならnarrationと生成音声timingからWebVTT等を派生生成する。

このcontractによって、追加の演出指定がなくても「静止slide + narration + deterministic advance」の動画を作れます。

## 5. optional extension

次は必要な場合だけ追加する将来拡張です。

- pronunciation: 固有名詞・略語等の読み
- pause: 自動処理では不足する明示的な間
- cues: highlight / pointer / reveal等
- explicit hold: 意図的な無音表示

schemaがrepositoryで確定していない段階では、独自のcue記法を勝手に発明して正本へ書き込まないでください。

SSML、WebVTT、Remotion component等はcanonical authoring formatではなく、必要なtarget向けの派生形式として扱います。

## 6. deterministic consistency check

編集後、機械的に判断できる次の項目を確認します。

- `slides.md` のstable keyに重複がない
- scriptの`slide`参照に重複がない
- 最終presentationの各slideにscript entryがある
- scriptにorphan entryがない
- slide順とscript順が一致している
- generated TOCを使う場合、`__misereru_toc__` entryが正しい位置にある
- 各entryに空でない `### Narration` がある

build側にvalidatorがある場合も、編集時に同じ不整合を残さないようにします。

## 7. semantic cross review

機械的なkey一致だけでは不十分です。必ず両方向から内容を確認します。

### slides → script

各slideについて確認します。

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

slideを編集するときは次の順で確認します。

```text
slides.mdを変更
  ↓
対応key / 順序をpresentation-script.mdへ反映
  ↓
原稿を内容に合わせて更新
  ↓
deterministic consistency check
  ↓
slides → script semantic review
  ↓
script → slides semantic review
  ↓
必要ならslide / scriptを再修正
```

原稿から先に改善案が見つかった場合も逆方向に同じレビューを行います。

## 9. 完了条件

少なくとも次を満たしてから、slide + scriptの編集を完了とします。

- key対応と順序に機械的不整合がない
- narrationが自然な口頭説明として成立する
- slideとnarrationの主張に矛盾がない
- 原稿だけの重要情報が残っていない
- slide本文の逐語読み上げだけになっていない
- default video contractだけで発表動画の基本進行を決められる

## 参照

misereru内の調査:

- `docs/research/presentation-script-and-video.md`（develop branch）

外部仕様・実装:

- Marpit presenter notes: <https://github.com/marp-team/marpit/blob/main/docs/directives.md>
- Marp CLI: <https://github.com/marp-team/marp-cli>
- Slidev Syntax Guide 日本語: <https://ja.sli.dev/guide/syntax>
- reveal.js Speaker View: <https://revealjs.com/speaker-view/>
- reveal.js Auto-Animate / Auto-Slide / Fragments: <https://revealjs.com/auto-slide/>
- Microsoft PowerPoint「プレゼンテーションを記録する」: <https://support.microsoft.com/ja-jp/powerpoint/record-your-presentation>
- Microsoft PowerPoint「プレゼンテーションをビデオに変換する」: <https://support.microsoft.com/ja-jp/powerpoint/turn-your-presentation-into-a-video>
- W3C SSML 1.1: <https://www.w3.org/TR/speech-synthesis11/>
- W3C WebVTT: <https://www.w3.org/TR/webvtt1/>
- Remotion Sequence: <https://www.remotion.dev/docs/sequence>
