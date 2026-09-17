# Presentation script / cross-review research

最終更新: 2026-09-18

`slides.md` と対になる口頭説明用sourceを持ち、slideと原稿を相互に検証できる構成を調査した記録です。

## 目的

主目的は動画生成ではありません。

- 人間が読める自然な発表原稿を別sourceとして持つ。
- slideと原稿をstable keyで一意に対応付ける。
- slides → script / script → slides の両方向から、構成矛盾・欠落・順序不整合を検出する。
- 原稿を使わないslides-only運用と、一部だけ原稿を持つpartial scriptを許容する。
- rendererや特定の発表環境へ正本sourceを固定しない。

音声合成・録画・発表動画・字幕等へ流用できることは副次的な利点として扱います。

## 既存実装から得られる示唆

### Marp / Marpit

MarpitはMarkdown中のHTML commentをpresenter notesとして収集でき、Marp CLIはpresenter notesのexportも提供します。

参考:

- Marpit directives / presenter notes: <https://github.com/marp-team/marpit/blob/main/docs/directives.md>
- Marp CLI: <https://github.com/marp-team/marp-cli>

示唆:

- slideに対応するspeaker notesというモデルは妥当。
- ただしmisereruでは、長い原稿をslide sourceへ埋め込むより別ファイルにした方が、Git差分・AI編集・相互レビューの境界が明確になる。

### Slidev

Slidevは各slideにpresenter noteを持ち、click markerでslide内進行とnotesを対応付けられます。

参考:

- Slidev 構文ガイド（日本語）: <https://ja.sli.dev/guide/syntax>
- Slidev Syntax Guide: <https://sli.dev/guide/syntax>

示唆:

- 細かな進行cueは必要な場面では有用。
- ただし通常の発表原稿へ最初からcue記法を要求するとauthoring costが上がるため、初期仕様では扱わない。

### reveal.js

reveal.jsはslideごとのspeaker notesとspeaker viewを提供します。

参考:

- Speaker View: <https://revealjs.com/speaker-view/>
- Fragments: <https://revealjs.com/fragments/>

示唆:

- 発表者向け原稿とslide presentationは別レイヤーとして成立する。
- timingやfragment制御はrenderer固有機能として分離できる。

### PowerPoint

PowerPointはspeaker notesとは別に、record機能でnarrationやslide timing等も扱えます。

参考（日本語）:

- プレゼンテーションを記録する: <https://support.microsoft.com/ja-jp/powerpoint/record-your-presentation>
- プレゼンテーションをビデオに変換する: <https://support.microsoft.com/ja-jp/powerpoint/turn-your-presentation-into-a-video>

示唆:

- 「発表原稿」と「実際の録画・timing・pointer等」は別の情報層として扱える。
- misereruの発表原稿sourceへ録画固有情報を混ぜる必要はない。

## 採用方針

初期仕様は次の2ファイルを扱います。

```text
slides.md
presentation-script.md   # optional
```

両者はページ番号ではなくstable `key`で対応付けます。

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

format metadataは最低限にします。

```md
<!-- {"misereru":"presentation-script","version":1} -->
```

## 正当な運用状態

### slides-only

```text
slides.md
```

原稿を作らない資料。通常運用として問題ありません。

### partial script

```text
slides.md
presentation-script.md
```

必要なslideだけ原稿を持つ状態。これも正常です。

### complete script

全slideに原稿がある状態。必要な場合だけcomplete checkで確認できますが、通常資料の完成条件にはしません。

## 機械的チェック

通常buildでは、`presentation-script.md` がなければ検査をスキップします。

存在する場合のみ、書かれているentryについて次を検査します。

- stable key参照が存在する。
- 同じslideへのentryが重複していない。
- `Narration`が存在し、空ではない。
- format versionが対応範囲内である。

通常buildでは、未記載slideをerror / warningにしません。

全slide分の原稿が必要な場合だけ、`npm run build:script-complete`でcoverageを追加検査します。

## semantic cross review

### slides → script

- slideの主要メッセージをnarrationが別の意味へ変えていないか。
- 重要な条件・留保・比較を落としていないか。
- 図表・コード等の説明が画面内容と一致しているか。
- 前後slideへの接続が実際の順序と一致しているか。
- slide本文の逐語読み上げになっていないか。

### script → slides

- 原稿だけに重要な主張や前提が追加されていないか。
- 原稿の論理順で説明するとslide順が不自然にならないか。
- 原稿側で補わないと成立しない主要論点がslideから欠落していないか。
- `この3点`、`次の図` 等の参照が画面内容と一致するか。
- Reference modeで本来slideに必要な内容を原稿へ逃がしていないか。

問題がslide構成にある場合、原稿だけを合わせずslide側も修正対象へ戻します。

## 将来の派生利用

stable keyでslideと原稿が対応していれば、将来次の用途へ変換できます。

- TTS / 音声合成
- 発表録画
- 発表動画
- 字幕
- SSML / WebVTT等の派生形式

ただし現時点では、timing、pronunciation、pause、highlight、pointer、reveal等をcanonical sourceへ必須化しません。必要になった時点でadapterまたは別仕様として検討します。

## 結論

misereruでは、`presentation-script.md` を **任意の口頭説明source + slideとの相互レビュー用source** として扱います。

動画等への流用可能性は残しますが、それを理由に通常の原稿作成やCIを複雑化しません。
