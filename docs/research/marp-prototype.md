# Marp prototype research

最終更新: 2026-09-16

Marp を第一候補として、日本語組版の実レンダリング比較ができる最小プロトタイプを作るための調査・設計メモです。

安定要件は [`../product/requirements.md`](../product/requirements.md) を参照してください。

## 今回確認した事実

### Marp CLI

- `@marp-team/marp-cli` は Markdown から HTML / PDF / PPTX / images を生成できる。
- 2026-09-16 時点で npm の latest は `4.5.1`。
- PDF / PPTX / images の変換には Chrome / Edge / Firefox のいずれかが必要。
- Marp CLI の設定ファイルから Marp Core / Marpit の constructor options を渡せる。
- Marp Core は既定で Markdown parser の `breaks: true` を利用するが、`options.markdown.breaks: false` で上書きできる。

参考:

- <https://www.npmjs.com/package/@marp-team/marp-cli>
- <https://github.com/marp-team/marp-cli>
- <https://github.com/marp-team/marp-core/blob/main/docs/configuration.md>

### 日本語向け CSS

初期比較で利用する候補:

```css
line-break: strict;
word-break: normal;
overflow-wrap: normal;
text-wrap: balance;
text-wrap: pretty;
text-autospace: normal;
```

`text-autospace` は MDN で Baseline 2025 とされており、最新ブラウザ群では実用検証可能な段階に入っています。ただし古いブラウザを前提にした必須仕様にはまだしません。

参考:

- <https://developer.mozilla.org/ja/docs/Web/CSS/Reference/Properties/line-break>
- <https://developer.mozilla.org/ja/docs/Web/CSS/Reference/Properties/text-wrap>
- <https://developer.mozilla.org/ja/docs/Web/CSS/Reference/Properties/text-autospace>

### Vivliostyle

- Vivliostyle CLI は Markdown / HTML を入力できる。
- 公式に `@vivliostyle/theme-slide` が存在する。
- 2026-09-16 時点で `@vivliostyle/cli` の latest は `11.3.3`。
- Getting Started は Node.js `22.12.0` 以上を要求している。
- CLI のライセンスは AGPL-3.0。

参考:

- <https://docs.vivliostyle.org/ja/cli/getting-started/>
- <https://docs.vivliostyle.org/en/themes/usage/>
- <https://www.npmjs.com/package/@vivliostyle/cli>

## 初期プロトタイプの目的

この段階では「Marp を採用する」ことを決めません。

目的は、次の問いを安価に潰すことです。

1. Marp Core の既定改行を `breaks: false` にするだけで、ChatGPT が編集する Markdown と相性が改善するか。
2. Chromium の CSS だけで、スライド用途として十分な日本語禁則・和欧混植・見出し折返し品質を得られるか。
3. 不足がある場合、それは CSS theme の調整で解決できるか。
4. Vivliostyle 等の別レイアウトエンジンを組み込む必要があるか。

## 比較設計

同一 Markdown を2系統で生成します。

```text
prototype/japanese-typesetting.md
  ├─ baseline
  │   ├─ Marp Core default: breaks = true
  │   └─ Noto Sans CJK JP のみ揃える
  │
  └─ tuned
      ├─ breaks = false
      ├─ line-break: strict
      ├─ word-break: normal
      ├─ text-wrap: balance / pretty
      └─ text-autospace: normal
```

フォント差で改行位置が変わると比較が崩れるため、baseline / tuned の両方で同じ Noto CJK 系フォントを使います。

## テストケース

[`../../prototype/japanese-typesetting.md`](../../prototype/japanese-typesetting.md) に、現時点で次を含めています。

1. 行頭禁則
2. 行末禁則
3. 和欧混植
4. 長い欧文単語
5. 数字・単位・記号
6. URL
7. inline code
8. 日本語 + 括弧 + 英文
9. 見出しの折返し
10. 箇条書き
11. Markdown ソース上の物理改行
12. overflow 境界

## リモートビルド

GitHub Actions で Node.js 22 と Noto CJK fonts を用意し、以下を生成します。

```text
dist/
├─ baseline.html
├─ baseline.pdf
├─ baseline.pptx
├─ baseline.*.png
├─ tuned.html
├─ tuned.pdf
├─ tuned.pptx
└─ tuned.*.png
```

生成物は Git の正本にはせず、Actions artifact として扱います。

これにより日常の利用経路を、

```text
スマートフォン / ChatGPT
  ↓ Markdown を編集
GitHub
  ↓
GitHub Actions
  ↓
HTML / PDF / PPTX / PNG artifact
```

にできます。

## 現時点の設計判断

### 採用してよいもの

- **比較基盤として Marp CLI を使う。**
- **Node.js 22 を実験環境の共通下限にする。** Vivliostyle 比較を後から追加しやすくするため。
- **Markdown parser は tuned 系で `breaks: false` を検証する。**
- **生成物は Actions artifact とし、Git にコミットしない。**

### まだ採用しないもの

- Marp を製品レンダラーとして正式採用すること。
- 独自 Markdown 方言。
- Vivliostyle の組み込み。
- `text-spacing-trim` や実験的な `word-break: auto-phrase` への必須依存。
- overflow の自動文字縮小。
- AI をレンダリング工程へ入れること。

## 次の判定ゲート

Actions で baseline / tuned を実際に生成した後、PNG / PDF を目視比較して次を記録します。

- 禁則違反の有無
- 見出し2行の自然さ
- 和欧混植の間隔
- 長い英単語・URLの処理
- code span の折返し
- Markdown の物理改行がレイアウトへ与える影響
- overflow の発生条件

Marp tuned で問題が CSS 調整の範囲に収まるなら Marp wrapper 方向を継続します。

CSS だけでは解決しない問題が複数残る場合に、同じテストケースを Vivliostyle `@vivliostyle/theme-slide` へ流して比較します。
