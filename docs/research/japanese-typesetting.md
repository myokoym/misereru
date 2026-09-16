# Japanese typesetting research

最終更新: 2026-09-16

Markdown からスライドを生成する際の、日本語改行・禁則・組版品質に関する調査です。

安定要件は [`../product/requirements.md`](../product/requirements.md) を参照してください。

## 基準

日本語品質は重要要件です。単に文字が枠内に収まるだけでは不足です。

対象:

- 行頭禁則
- 行末禁則
- 句読点・括弧の扱い
- 英数字と日本語が混在する場合の折返し
- 欧文単語の不自然な途中分割を避ける
- 見出しの不自然な分割を避ける
- 約物の間隔
- 行長・行分割の自然さ
- overflow 時の扱い

基準資料:

- W3C JLREQ: <https://www.w3.org/International/jlreq/?lang=ja>

## ブラウザ/CSS 系レンダリングで検討する設定

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

CJK の改行規則・禁則を厳格側へ寄せるため重要です。

MDN: <https://developer.mozilla.org/ja/docs/Web/CSS/Reference/Properties/line-break>

### `word-break: normal`

乱暴な文字単位分割を避ける方向です。

MDN: <https://developer.mozilla.org/ja/docs/Web/CSS/Reference/Properties/word-break>

### `text-wrap: balance`

見出しが複数行になった際の行長を均衡させる用途です。

### `text-wrap: pretty`

本文のより自然な折返し候補です。

MDN: <https://developer.mozilla.org/ja/docs/Web/CSS/Reference/Properties/text-wrap>

### `text-autospace`

日本語と Latin 文字の境界等を自動調整する新しい CSS です。

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

## Marp 固有の注意: Markdown 内改行

Marp は通常、段落中の Markdown の物理改行を `<br>` として扱います。

ChatGPT がソースの読みやすさのために Markdown を途中改行すると、その位置で強制改行され、日本語の自動組版を壊す可能性があります。

Marp を採用する場合は Markdown parser の `breaks: false` を固定する案を重要候補とします。

## Vivliostyle

Vivliostyle は日本語を含む CSS 組版に重点を置いており、Marp/Chromium 系との比較対象として重要です。

- 公式: <https://vivliostyle.org/>
- Theme: <https://docs.vivliostyle.org/en/themes/usage/>
- CLI config: <https://docs.vivliostyle.org/ja/cli/config/>

日本語組版品質だけを見れば、Vivliostyle を基準点として使う価値があります。

## 実レンダリング比較

仕様表だけでは決定しません。

Marp / Vivliostyle / 自作候補に対して、同じ Markdown の「嫌な日本語改行ケース」を 10〜20 個程度用意し、スクリーンショットまたは PDF で比較します。

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

## 未決事項

- Chromium の最新 CSS だけで十分な日本語品質になるか。
- `text-autospace` の実運用品質。
- `text-spacing-trim` をいつ採用可能とみなすか。
- `auto-phrase` を利用するか。
- 句読点ぶら下げ等をどこまで独自処理するか。
- overflow 時に文字縮小・再レイアウト・警告のどれを行うか。
- スライド向けの見出し改行最適化をどこまで自動化するか。

## 次の検証候補

1. 日本語の厳しい改行テスト用 Markdown を作る。
2. Marp の標準出力を生成する。
3. 日本語 CSS 調整版を生成する。
4. Vivliostyle slide theme で同一内容を生成する。
5. 禁則、見出し折返し、英数字混植、約物、overflow を目視比較する。
6. Marp ベースで不足する要素を一覧化する。
7. 不足が CSS で解決できるか、独自 renderer が必要かを判断する。
