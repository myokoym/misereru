# Presentation script / video-ready source research

最終更新: 2026-09-18

`slides.md` と対になる口頭説明用sourceを持ち、AIへ両方を渡したときに発表動画へ変換しやすくするための調査です。

この文書では、単なるspeaker notesではなく、次を同時に満たすsource contractを検討します。

- 人間が読める自然な発表原稿である。
- slideと原稿をstable keyで一意に対応付けられる。
- AIが「何を読み、いつ次へ進むか」を推測しなくてよい。
- 必要な場合だけ発音・間・画面上のcueを追加できる。
- slidesと原稿を相互レビューし、構成矛盾・欠落・順序不整合を検出できる。
- 特定のTTS / video rendererへ正本sourceを固定しない。

## 既存実装

### Marp / Marpit

MarpitはMarkdown中のHTML commentをpresenter notesとして収集できます。Marp CLIはpresenter notesをテキストへexportする`--notes`も提供しています。

参考:

- Marpit directives / presenter notes: <https://github.com/marp-team/marpit/blob/main/docs/directives.md>
- Marp CLI `--notes`: <https://github.com/marp-team/marp-cli#export-presenter-notes---notes>

misereruとの相性:

- Markdownにnoteを置ける点は近い。
- 一方、Marp commentへ原稿を埋め込むとrenderer固有の意味が正本へ混ざる。
- slide本文と長い原稿を同じファイルへ置くと、AI編集・Git差分・相互レビューで境界が弱くなる。

したがってMarp presenter notesはoutput adapter候補にはできるが、misereruの原稿正本形式にはそのまま採用しない。

### Slidev

Slidevは各slide末尾のcomment blockをpresenter noteとして扱います。またclick markerを使い、slide上のclick進行とnotes内の位置を同期できます。

参考:

- Slidev 構文ガイド（日本語）: <https://ja.sli.dev/guide/syntax>
- Slidev Syntax Guide: <https://sli.dev/guide/syntax>

misereruへの示唆:

- 原稿全体だけでなく、slide内進行と結び付くcueが有用な場合がある。
- ただしすべての文章を細かいcueへ分解するとauthoring costが高い。
- 初期仕様ではslide単位のnarrationを必須、slide内cueをoptional extensionとする方がよい。

### reveal.js

reveal.jsはslideごとのspeaker notesに加えて、speaker timer、slide単位の`data-timing`、自動進行用`data-autoslide`、fragment単位の進行を持ちます。

参考:

- Speaker View: <https://revealjs.com/speaker-view/>
- Auto-Slide: <https://revealjs.com/auto-slide/>
- Fragments: <https://revealjs.com/fragments/>

misereruへの示唆:

- 「発表者向け目標時間」と「動画の実際の時間」は分けるべき。
- 動画尺を手書き秒数だけで固定すると、TTS音声長とずれやすい。
- 初期仕様ではnarration音声の実長を基準にslide durationを決め、明示durationは例外用途に限定する。

### PowerPoint recording

PowerPointのrecord機能はslide単位のnarrationとtimingを記録し、animation、transition、ink、laser pointer movement等も含めてvideoへexportできます。

参考（日本語）:

- プレゼンテーションを記録する: <https://support.microsoft.com/ja-jp/powerpoint/record-your-presentation>
- スライド ショーをナレーションとスライド切り替えのタイミングとともに記録する: <https://support.microsoft.com/ja-jp/powerpoint/training/record-a-slide-show-with-narration-and-slide-timings>
- プレゼンテーションをビデオに変換する: <https://support.microsoft.com/ja-jp/powerpoint/turn-your-presentation-into-a-video>

misereruへの示唆:

発表動画を再現するための情報は大きく次へ分けられます。

1. narration
2. slide / fragment timing
3. visual cue（highlight / pointer / reveal等）
4. transition

初期sourceで1を必須、2はnarrationから自動導出、3をoptional、4をproject / renderer既定に寄せるとauthoring負荷を抑えられる。

### SSML

W3C SSML 1.1は、発音、pause、pitch、rate、volume等をspeech synthesizerへ指示する標準です。一方、仕様上もprocessor間で完全に同一の音声結果を保証するものではありません。

参考:

- W3C SSML 1.1: <https://www.w3.org/TR/speech-synthesis11/>

misereruへの示唆:

- 発音・pauseをsourceで表現できること自体は有用。
- ただし正本をSSML XMLへすると人間の編集性が落ち、VOICEVOX等の非SSML系targetにも合わせにくい。
- 正本では軽量なpronunciation / pause情報を持ち、必要なadapterだけがSSML等へ変換する方がよい。

### Remotion

Remotionは`Sequence`の開始frameとdurationでvisual timelineを組み、audioもtimeline上へ配置できます。video rendererの実装候補として、slide narration sourceからframe-based timelineへ変換可能なことを確認できます。

参考:

- Sequence: <https://www.remotion.dev/docs/sequence>
- Audio: <https://www.remotion.dev/docs/audio>

正本sourceをRemotion componentへ固定する必要はない。Remotionは将来のrenderer adapter候補として扱う。

### WebVTT

WebVTTはtime-aligned text cueを表現でき、caption / subtitleやtime-aligned metadataに利用できます。

参考:

- W3C WebVTT: <https://www.w3.org/TR/webvtt1/>

字幕はnarrationから生成できるため、WebVTT自体をauthoring sourceにはしない。video生成時のderived output候補とする。

## 比較結果

| 方式 | 人間向け原稿 | slide対応 | timing | slide内cue | renderer依存 | misereru正本への適合 |
| --- | --- | --- | --- | --- | --- | --- |
| Marp comments | ○ | slide内なので暗黙 | △ | △ | Marp寄り | △ |
| Slidev notes | ○ | slide内なので暗黙 | △ | ○ click marker | Slidev寄り | △ |
| reveal.js notes | ○ | ○ | ○ | ○ | reveal.js寄り | △ |
| PowerPoint recording | ○ | ○ | ○ | ○ | PPTX / PowerPoint | output参考 |
| SSML | speech制御中心 | × | pause等 | speechのみ | TTS差あり | adapter参考 |
| 独立script + stable key | ○ | ○ | 自動導出可能 | optional | 低い | **○** |

## 採用方針

初期仕様は`slides.md`と`presentation-script.md`を別sourceとして持つ。

```text
slides.md
presentation-script.md
```

両者はslide番号ではなく、既存のstable `key`で対応付ける。

```md
<!-- {"key":"body"} -->
# 通常の本文ページ
```

```md
<!-- {"slide":"body"} -->
## 通常の本文ページ

### Narration

ここでは通常の本文ページを例にします。...
```

### 初期のvideo semantics

AI / future rendererが追加判断しなくてよいよう、未指定時の動作を固定する。

1. 対応slideを表示してからnarrationを開始する。
2. 読み上げるのは`### Narration`本文だけとし、slide本文を追加で読み上げない。
3. narration中はslideを維持する。
4. cueがなければzoom / highlight / pointer / fragment reveal等を勝手に追加しない。
5. narration音声の終了後、短いtail holdを置いて次slideへ進む。
6. slide durationは原則として生成済み音声の実長から導出する。手書きの秒数を正本にしない。
7. transitionはvideo renderer側の既定値を使い、原稿sourceへ通常は書かない。
8. 字幕はnarrationと生成音声timingからWebVTT等へ派生生成する。

これにより、初期版では細かいcueがなくても「静止slide + narration + deterministic advance」で発表動画を生成できる。

### Optional extensions

必要なslideだけ次を追加できるようにする。

- pronunciation: 固有名詞・略語等の読み
- pause: 自動句読点処理では不足する明示的な間
- cues: highlight / pointer / reveal等
- explicit hold: 意図的に無音表示を延ばす場合

これらは初期templateで必須にしない。

## 相互チェック

`slides.md`と`presentation-script.md`は片方向の従属物として扱わず、両方からレビューする。

### deterministic check

機械的に判定できるもの:

- slide keyが重複していない。
- scriptの`slide`参照が重複していない。
- source slideに対応するscript entryがある。
- scriptにorphan entryがない。
- slide順とscript順が一致している。
- generated slideを含める場合も既知のstable keyで対応する。

### semantic AI review

AIで確認するもの:

- slideの主張とnarrationの主張が矛盾していない。
- narrationで重要な前提を補っているだけなのか、slideから重要論点が欠落しているのかを区別する。
- slide順と実際に説明しやすい論理順が一致している。
- narrationだけに新しい事実・数値・条件が追加されていない。
- slideにある重要な留保・条件・比較がnarrationで逆の意味になっていない。
- 前後slideへのtransitionが実際の構成と一致する。
- 原稿がslide本文の単純な読み上げになっていない。
- Reference modeでは、slide単体の自己完結性を原稿へ逃がしていない。

相互レビューで問題が見つかった場合、原稿だけを合わせるのではなく、slide構成自体も修正候補へ戻す。

## generated TOC

misereruはbuild時に`__misereru_toc__` slideを生成する場合がある。

video-ready contractでは最終presentationのslide sequenceと一致させるため、generated TOCにもscript entryを持てるようにする。

```md
<!-- {"slide":"__misereru_toc__","generated":true} -->
## 目次

### Narration

最初に全体の流れを確認します。...
```

TOCが生成されない資料では、このentryも持たない。

## 実装方針

1. templateに`presentation-script.md`のサンプルを追加する。
2. `misereru-presentation-script` Skillを追加し、原稿生成と相互レビューのcontractを持たせる。
3. build時、`presentation-script.md`が存在する場合だけstable key / completeness / orderをdeterministic validationする。
4. semantic consistencyはAgent Skill側で扱い、buildの必須AI依存にはしない。
5. Marp presenter notes / SSML / WebVTT / future video rendererはadapter / derived outputとして扱い、正本formatへ混ぜない。

## 未決事項

- cue記法の具体的schema。初期templateでは必須にしない。
- pronunciation / pauseをMarkdown上でどう表現するか。
- video rendererをproduction targetへ入れる時期。
- TTS engine / voiceをproject configで管理するか、video generation configとして別管理するか。
- generated TOC以外のsynthetic slideを将来許可する場合のidentity contract。
