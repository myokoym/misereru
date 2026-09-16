# Markdown slide tooling research

最終更新: 2026-09-16

Markdown を正本としてスライドを生成する既存ツールの比較です。

安定要件は [`../product/requirements.md`](../product/requirements.md) を参照してください。

## Marp

- 公式: <https://marp.app/>
- CLI: <https://github.com/marp-team/marp-cli>
- Marpit directives: <https://marpit.marp.app/directives>

### 長所

- Markdown をそのままスライド原稿として扱える。
- `---` 区切りでスライドを分割できる。
- YAML front matter / directives によりメタ情報をテキスト管理できる。
- CSS テーマを利用できる。
- HTML / PDF / PPTX へ生成可能。
- CLI があり GitHub Actions と相性が良い。
- Docker でビルド環境を隔離可能。
- Markdown / YAML / CSS という LLM が扱いやすい既存テキスト記法で構成できる。

### 今回との相性

かなり高いです。

```text
ChatGPT
  ↓
Markdown 編集
  ↓
GitHub commit
  ↓
GitHub Actions
  ↓
Marp CLI
  ├─ HTML
  ├─ PDF
  └─ PPTX
```

スマートフォンで Marp 自体を動かす必要はなく、生成処理を GitHub Actions 側へ置けます。

### PPTX

通常の Marp PPTX は、見た目を維持するためスライドが画像的な形で格納されます。

今回は PowerPoint を直接編集しないため、大きな欠点ではありません。

`--pptx-editable` も存在しますが実験的であり、中心要件ではありません。

### Markdown 内改行

Marp は通常、段落中の Markdown の物理改行を `<br>` として扱います。

ChatGPT が読みやすさのためにソース Markdown を適当に改行すると、その場所が強制改行になり、日本語の自動改行品質を壊す可能性があります。

そのため Marp を採用する場合、Markdown parser の `breaks: false` を固定する案が重要です。

参考:
<https://github.com/marp-team/marp/blob/main/website/docs/guide/how-to-write-slides.md>

## Quarto / Pandoc

- Quarto PowerPoint: <https://quarto.org/docs/presentations/powerpoint.html>
- Pandoc: <https://pandoc.org/>

### 長所

- Markdown から PowerPoint のネイティブ要素を持つ PPTX を生成できる。
- 既存 PPTX を `reference-doc` として利用可能。
- Markdown + YAML によるテキスト管理が可能。
- レポート、HTML、Word、PDF 等も同じエコシステムで扱える。

### 今回の評価

PowerPoint を後編集しないため、Marp に対する大きな優位点が薄れます。

Quarto はスライド専用ではなく文書パブリッシングシステムとして広く、今回の単目的ツールにはやや大きすぎます。

将来、1つの Markdown から Web article / PDF report / slide / Word を同時生成したくなった場合は再評価候補です。

## Slidev

- 公式: <https://sli.dev/>
- Export: <https://sli.dev/guide/exporting.html>
- GitHub: <https://github.com/slidevjs/slidev>

### 長所

- Markdown ベース。
- Vue / CSS / JavaScript / Mermaid / 数式 / アニメーション等に強い。
- Web プレゼンとしての表現力が高い。

### 今回の評価

プロジェクトが `slides.md` だけでなく `package.json` / `components/` / `layouts/` / `styles/` などへ発展しやすく、ChatGPT が触る状態空間が広がります。

「Markdown だけを正本として簡潔に管理」の条件では Marp より過剰です。

PPTX export も基本的に各スライドのキャプチャに近いため、ネイティブ PowerPoint 編集用途には向きませんが、今回は主要問題ではありません。

## reveal.js

- 公式: <https://revealjs.com/>
- Markdown: <https://revealjs.com/markdown/>
- PDF export: <https://revealjs.com/pdf-export/>

### 長所

- OSS の HTML プレゼンテーションフレームワーク。
- Markdown plugin があり、外部 Markdown ファイルを読み込んでスライド化できる。
- Web 表現、JavaScript API、プラグイン、アニメーション等の自由度が高い。
- Chromium の印刷機能を利用した PDF export がある。

### 今回の評価

Markdown は利用できますが、reveal.js 自体は HTML / JavaScript を中心とするプレゼンテーションフレームワークです。

標準的な構成では reveal.js の初期化、plugin、HTML/CSS/JS 等も管理対象になりやすく、「ChatGPT が主に Markdown だけを編集する」という今回の状態空間より広くなります。

また主要な標準出力は Web / PDF であり、PPTX を中心とするツールではありません。

Webプレゼンの高度な表現が主目的になった場合は再評価できますが、現状では Marp より優先度を下げます。

## Deckset

- 公式: <https://www.deckset.com/>
- Markdown presentations: <https://www.deckset.com/markdown-presentations/>

### 長所

- Markdown を正本にし、テーマとレイアウトをアプリ側で適用する思想が今回と近い。
- コード、数式、Mermaid、メディア、presenter notes 等に対応する。
- Markdown は通常のテキストファイルとして残り、Git管理しやすい。

### 今回の評価

Deckset は Mac / iPhone / iPad のネイティブアプリを中心とする製品で、GitHub Actions 等のリモートビルドを中心にする構成ではありません。

export は PDF が中心で、native PowerPoint export はありません。

「Markdownだけを編集する」という思想の参考にはなりますが、プラットフォーム依存と出力経路の点で今回の基盤候補にはしません。

## slidown

GitHub: <https://github.com/Songmu/slidown/>

### 特徴

- Markdown → ネイティブ OOXML PowerPoint を生成。
- LibreOffice 等を経由せず Go で処理。
- 既存 PPTX / POTX をテンプレートとして利用可能。
- Markdown 更新時、PowerPoint 側の手修正を残す `freeze` 等の考え方がある。

### 今回の評価

「Markdown と PowerPoint 手編集を往復する」用途には興味深いですが、今回は Markdown だけを編集するため最大の強みが不要です。

比較対象として残します。

## k1LoW/deck

GitHub: <https://github.com/k1LoW/deck>

思想:

```text
Markdown = content
Google Slides = design
```

Google Slides を最終成果物として手編集する場合には有力ですが、今回の「Markdown のみ編集」とは少し違います。

## Presenton

- GitHub: <https://github.com/presenton/presenton>

### 特徴

- OSS / self-host 可能な AI presentation generator。
- prompt、文書、Markdown 等からプレゼンを生成できる。
- editable PPTX / PDF / PNG 等を出力できる。
- API とテンプレートを持つ。

### 今回の評価

単純な Markdown renderer ではなく、AI が内容をテンプレートへマッピングしてプレゼンを生成するカテゴリです。

`slides_markdown` を直接与えて AI outline generation を飛ばす経路もありますが、公式README上でも **決定論的な Markdown-to-slide renderer ではなく、LLM がレイアウト選択・フィールドへの割当・場合によっては文章の言い換えを行う** とされています。

今回の中心思想である、

```text
Markdown に書かれた内容・構造
→ 意図しない内容変更を挟まず
→ 再現可能に slide として render
```

とは別カテゴリです。

AIによる構成・編集自体を製品機能にする場合には参考になりますが、レンダリング基盤の第一候補にはしません。

## Presentations.ai

- 公式: <https://www.presentations.ai/>
- Markdown to PPT: <https://www.presentations.ai/tools>
- FAQ: <https://www.presentations.ai/faq>

### 特徴

- ブラウザ上の AI presentation SaaS。
- Markdown を入力してプレゼンへ変換する機能を持つ。
- 対応プランでは native / editable PPTX を出力できる。

### 今回の評価

Markdown を正本として決定論的にレンダリングする基盤というより、AI が完成プレゼンを生成する SaaS です。

今回の「内容・構造は Markdown 側で管理し、renderer は原則それを忠実に表示する」という責務分離とは異なります。

また PowerPoint export はプラン依存です。

したがって既存サービス比較としては残しますが、レンダリング基盤候補からは外します。

## Vivliostyle

- 公式: <https://vivliostyle.org/>
- Theme: <https://docs.vivliostyle.org/en/themes/usage/>
- CLI config: <https://docs.vivliostyle.org/ja/cli/config/>
- Getting started: <https://docs.vivliostyle.org/ja/cli/getting-started/>

### 長所

- 日本語を含む CSS 組版を強く意識した実装。
- `text-spacing` や `hanging-punctuation` 等、日本語組版に重要な機能を積極的に実装してきた。
- Markdown を入力として PDF / WebPub / EPUB を生成できる。
- slide theme も存在する。

### 今回の評価

日本語組版品質だけを見るなら非常に重要な比較対象です。

一方、Marp のようなスライド用途のシンプルさは弱く、Vivliostyle CLI の標準出力形式は PDF / WebPub / EPUB で、PPTX は含まれません。

現時点では、

- スライドツールとしての運用: Marp 優位
- 日本語組版エンジンとしての品質: Vivliostyle 優位候補

という整理です。

自作を検討する場合にも Vivliostyle の日本語組版思想は参考になります。

## 現時点の技術選定

既存ツールを使う場合の第一案は **Marp + 独自日本語テーマ + GitHub Actions** です。

```text
Markdown
  ↓
Marp
  ↓
Chromium / renderer
  ↓
HTML / PDF / PPTX
```

ただし最終決定ではありません。日本語組版比較を行ってから判断します。

Quarto / Pandoc は、将来スライド以外の文書形式まで同一ソースから生成する要求が強くなった場合の再評価候補です。

## 自作を視野に入れる理由

Marp はかなり条件に近い一方、日本語組版品質を最優先した場合に「CSS とブラウザ依存で十分か」が未検証です。

自作する場合も、ゼロから組版エンジンを書くとは限りません。

```text
Markdown parser
  ↓
slide AST / document model
  ↓
HTML/CSS
  ↓
Chromium or dedicated layout engine
  ↓
PDF / HTML
```

Vivliostyle 等をレンダリング層として利用する可能性もあります。
