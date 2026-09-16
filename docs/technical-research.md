# misereru 技術調査

最終更新: 2026-09-16

Markdown を正本としてスライドを生成・レンダリングするための技術調査をまとめます。

安定した要件は [`requirements.md`](requirements.md)、命名調査は [`naming.md`](naming.md) に分離しています。

---

## 1. 既存ツール調査

### 1.1 Marp

- 公式: <https://marp.app/>
- CLI: <https://github.com/marp-team/marp-cli>
- Marpit directives: <https://marpit.marp.app/directives>

#### 長所

- Markdown をそのままスライド原稿として扱える。
- `---` 区切りでスライドを分割できる。
- YAML front matter / directives によりメタ情報をテキスト管理できる。
- CSS テーマを利用できる。
- HTML / PDF / PPTX へ生成可能。
- CLI があり GitHub Actions と相性が良い。
- Docker でビルド環境を隔離可能。
- Markdown / YAML / CSS という LLM が扱いやすい既存テキスト記法で構成できる。

#### 今回との相性

かなり高いです。

想定構成:

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

#### PPTX

通常の Marp PPTX は、見た目を維持するためスライドが画像的な形で格納されます。

今回は **PowerPoint を直接編集しない** ため、大きな欠点ではありません。

`--pptx-editable` も存在しますが実験的であり、中心要件ではありません。

#### Markdown 内改行

Marp は通常、段落中の Markdown の物理改行を `<br>` として扱います。

ChatGPT が読みやすさのためにソース Markdown を適当に改行すると、その場所が強制改行になり、日本語の自動改行品質を壊す可能性があります。

そのため Marp を採用する場合、Markdown parser の `breaks: false` を固定する案が重要です。

参考:
<https://github.com/marp-team/marp/blob/main/website/docs/guide/how-to-write-slides.md>

---

### 1.2 Quarto / Pandoc

- Quarto PowerPoint: <https://quarto.org/docs/presentations/powerpoint.html>
- Pandoc: <https://pandoc.org/>

#### 長所

- Markdown から PowerPoint のネイティブ要素を持つ PPTX を生成できる。
- 既存 PPTX を `reference-doc` として利用可能。
- Markdown + YAML によるテキスト管理が可能。
- レポート、HTML、Word、PDF 等も同じエコシステムで扱える。

#### 今回の評価

PowerPoint を後編集しないため、Marp に対する大きな優位点が薄れます。

Quarto はスライド専用ではなく文書パブリッシングシステムとして広く、今回の単目的ツールにはやや大きすぎます。

将来、1つの Markdown から Web article / PDF report / slide / Word を同時生成したくなった場合は再評価候補です。

---

### 1.3 Slidev

- 公式: <https://sli.dev/>
- Export: <https://sli.dev/guide/exporting.html>
- GitHub: <https://github.com/slidevjs/slidev>

#### 長所

- Markdown ベース。
- Vue / CSS / JavaScript / Mermaid / 数式 / アニメーション等に強い。
- Web プレゼンとしての表現力が高い。

#### 今回の評価

プロジェクトが `slides.md` だけでなく `package.json` / `components/` / `layouts/` / `styles/` などへ発展しやすく、ChatGPT が触る状態空間が広がります。

「Markdown だけを正本として簡潔に管理」の条件では Marp より過剰です。

PPTX export も基本的に各スライドのキャプチャに近いため、ネイティブ PowerPoint 編集用途には向きませんが、今回は主要問題ではありません。

---

### 1.4 slidown

GitHub: <https://github.com/Songmu/slidown/>

#### 特徴

- Markdown → ネイティブ OOXML PowerPoint を生成。
- LibreOffice 等を経由せず Go で処理。
- 既存 PPTX / POTX をテンプレートとして利用可能。
- Markdown 更新時、PowerPoint 側の手修正を残す `freeze` 等の考え方がある。

#### 今回の評価

「Markdown と PowerPoint 手編集を往復する」用途には興味深いですが、今回は **Markdown だけを編集する** ため最大の強みが不要です。

比較対象として残します。

---

### 1.5 k1LoW/deck

GitHub: <https://github.com/k1LoW/deck>

思想:

```text
Markdown = content
Google Slides = design
```

Google Slides を最終成果物として手編集する場合には有力ですが、今回の「Markdown のみ編集」とは少し違います。

---

### 1.6 Presenton / AI スライド生成系

Presenton: <https://github.com/presenton/presenton>

これは単純な Markdown renderer ではなく、長文 Markdown 等を AI が読み、内容を圧縮・再構成してプレゼンへする方向です。

今回の想定は原則として、

```text
Markdown に書かれた内容・構造
→ 決定論的にスライドへ render
```

であり、AI が毎回内容を勝手に編集することとは別カテゴリです。

---

### 1.7 Vivliostyle

- 公式: <https://vivliostyle.org/>
- Theme: <https://docs.vivliostyle.org/en/themes/usage/>
- CLI config: <https://docs.vivliostyle.org/ja/cli/config/>

#### 長所

- 日本語を含む CSS 組版を強く意識した実装。
- `text-spacing` や `hanging-punctuation` 等、日本語組版に重要な機能を積極的に実装してきた。
- Markdown → PDF / WebPub 等に対応。
- slide theme も存在する。

#### 今回の評価

**日本語組版品質だけを見るなら非常に重要な比較対象**です。

一方、Marp のようなスライド用途のシンプルさや PPTX 生成は弱いです。

現時点では、

- スライドツールとしての運用: Marp 優位
- 日本語組版エンジンとしての品質: Vivliostyle 優位候補

という整理です。

自作を検討する場合にも Vivliostyle の日本語組版思想は参考になります。

---

## 2. 日本語組版の技術要件

Marp / ブラウザ系レンダリングを使う場合、最低限以下を検討します。

```css
section {
  line-break: strict;
  word-break: normal;
  overflow-wrap: normal;
}

h1,
h2,
h3 {
  line-break: strict;
  word-break: normal;
  text-wrap: balance;
}

p,
li {
  line-break: strict;
  word-break: normal;
  text-wrap: pretty;
}
```

### `line-break: strict`

CJK の改行規則・禁則を厳格側へ寄せるため重要。

MDN: <https://developer.mozilla.org/ja/docs/Web/CSS/Reference/Properties/line-break>

### `word-break: normal`

乱暴な文字単位分割を避ける方向。

MDN: <https://developer.mozilla.org/ja/docs/Web/CSS/Reference/Properties/word-break>

### `text-wrap: balance`

見出しが複数行になった際の行長を均衡させる用途。

### `text-wrap: pretty`

本文のより自然な折返し候補。

MDN: <https://developer.mozilla.org/ja/docs/Web/CSS/Reference/Properties/text-wrap>

### `text-autospace`

日本語と Latin 文字の境界等を自動調整する新しい CSS。

```css
text-autospace: normal;
```

MDN: <https://developer.mozilla.org/ja/docs/Web/CSS/Reference/Properties/text-autospace>

### `text-spacing-trim`

約物の内部空白調整等に関係しますが、ブラウザ対応状況を見ながら扱う必要があります。

MDN: <https://developer.mozilla.org/ja/docs/Web/CSS/Reference/Properties/text-spacing-trim>

### `word-break: auto-phrase`

日本語の文節を考慮した改行に使える可能性がありますが、実験的機能として扱い、必須依存にしない方針です。

### `lang: ja`

Marp / HTML の言語指定を日本語に固定することも重要です。

```yaml
---
marp: true
lang: ja
---
```

---

## 3. 実レンダリング比較が必要

仕様表だけでは決めません。

Marp / Vivliostyle / 自作候補に対し、同じ Markdown で「嫌な日本語改行ケース」を 10〜20 個程度用意し、スクリーンショットまたは PDF で比較する価値があります。

テスト例:

- 行頭に `。」「）」が来そうなケース
- 行末に `「（` が残りそうなケース
- 長い英単語 + 日本語
- `ChatGPTで資料を作る` のような和欧混植
- 見出しの2行折返し
- 数字・単位・記号
- URL
- 強調・code span
- 日本語 + 括弧 + 英文

---

## 4. 現時点の技術選定

### 既存ツールを使う場合の第一案

**Marp + 独自日本語テーマ + GitHub Actions**

```text
Markdown
  ↓
Marp
  ↓
Chromium / renderer
  ↓
HTML / PDF / PPTX
```

ただし、以下は必須寄りです。

- `lang: ja`
- Markdown の hard break 相当を OFF (`breaks: false`)
- `line-break: strict`
- `word-break: normal`
- 見出し `text-wrap: balance`
- 本文 `text-wrap: pretty`
- `text-autospace` の実用性確認
- 日本語テストケースによる回帰確認

### 自作を視野に入れる理由

Marp はかなり条件に近い一方、日本語組版品質を最優先した場合に「CSS とブラウザ依存で十分か」がまだ未検証です。

自作する場合も、ゼロから組版エンジンを書くとは限りません。

候補イメージ:

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

あるいは Vivliostyle 等をレンダリング層として利用する可能性もあります。

自作の範囲は未決です。

---

## 5. 技術上の未決事項

- Marp をそのまま採用するか。
- Marp fork / wrapper 程度にするか。
- レンダラーを自作するか。
- Vivliostyle を内部レンダリングに利用するか。
- HTML / PDF / PPTX のどこまでを初期対応するか。
- Mermaid を標準対応するか。
- 外部 CSS を許すか、Markdown 1 ファイル完結を強制するか。
- 共通テーマをどこまで分離するか。
- Chromium の最新 CSS だけで十分な日本語品質になるか。
- `text-autospace` の実運用品質。
- `text-spacing-trim` をいつ採用可能とみなすか。
- `auto-phrase` を利用するか。
- 句読点ぶら下げ等をどこまで独自処理するか。
- overflow 時に文字縮小・再レイアウト・警告のどれを行うか。
- スライド向けの見出し改行最適化をどこまで自動化するか。
- Markdown を完全に Marp 互換にするか、独自 front matter / directive を持つか。
- Marp の上位互換を目指すか、別設計にするか。
- AI はレンダリング時には使わず、Markdown 編集側の ChatGPT に限定するか。

---

## 6. 次の検証候補

1. 日本語の厳しい改行テスト用 Markdown を作る。
2. Marp の標準出力を生成する。
3. 日本語 CSS 調整版を生成する。
4. Vivliostyle slide theme で同一内容を生成する。
5. 禁則、見出し折返し、英数字混植、約物、overflow を目視比較する。
6. Marp ベースで不足する要素を一覧化する。
7. 不足が CSS で解決できるか、独自 renderer が必要かを判断する。

ここまで実施すれば、「既存ツール + テーマ」で十分か、「misereru として自作する価値があるか」をかなり具体的に判断できます。
