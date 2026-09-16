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
13. `line-break: strict` の差が出やすい長音・小書き仮名等の境界

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

## 初回実レンダリング結果

GitHub Actions 上で baseline / tuned の HTML / PDF / PPTX / PNG を実際に生成し、ジョブ全体が成功することを確認しました。

### `breaks: false`

効果が明確でした。

baseline では Markdown ソース上の通常の物理改行がそのままスライド上の強制改行になります。tuned では段落として自然に再レイアウトされました。

ChatGPT が Markdown を編集する運用では、ソースの可読性のために入れた改行と、スライド上で意図した改行を分離したいため、`breaks: false` は有力です。

### `text-wrap: balance`

長い見出しを2行へ折り返すケースで、baseline より tuned の方が2行の長さが均衡しました。

見出し専用の設定として有効性があります。

### `text-autospace: normal`

和文と Latin 文字列の境界に baseline にはない空きが入り、`ChatGPTで` / `GitHub Actionsで` 等の和欧混植の見え方が変わりました。

JLREQ の和欧混植に関する考え方とは方向性が合いますが、`text-autospace` が JLREQ の全条件を再現することまでは確認していません。採用候補として保持し、仕様確定はしません。

### 通常の句読点・括弧の禁則

最初の行頭・行末禁則ケースでは baseline / tuned の差がほとんど出ませんでした。

Chromium の通常の日本語改行でも一般的な句読点・括弧は既に処理されるため、`line-break: strict` の価値を確認するには、より差が出やすい文字を狙う必要があります。

### `line-break: strict` の境界ケース

長音記号 `ー` と小書き仮名 `ゃ` が行頭に来そうな幅へ固定したケースでは差が出ました。

- baseline は `ー` が行頭に来る改行を許した。
- tuned は直前の仮名ごと次行へ送り、`ー` 単独の行頭を避けた。
- baseline は小書き仮名 `ゃ` が行頭に来る改行を許した。
- tuned は `しゃ` を同じ行へ送り、`ゃ` 単独の行頭を避けた。
- 今回の幅では `‐` と `々` は baseline / tuned の差が出なかった。

少なくともスライド用途では `line-break: strict` に実測上の意味があります。

### overflow

現行の overflow ケースは下端を越えず、overflow 方針を評価できるほど厳しくありませんでした。

この論点は未検証のままです。文字縮小・警告・ページ分割等の実装判断はまだ行いません。

## プロトタイプからの設計案

現時点では、Marp 自体をプロダクトの仕様へ露出させるより、**薄いレンダリングアダプタとして隔離する**構成が扱いやすいです。

```text
Markdown source
  ↓
小さな共通 front matter / slide separator
  ↓
renderer adapter
  ├─ Marp config
  ├─ Japanese theme
  └─ build options
  ↓
HTML / PDF / PPTX
```

初期段階では独自 AST や独自レイアウトエンジンを先に作りません。Marp で不足する具体例が確認できた時点でのみ中間モデルを検討します。

また、原稿側へ Marp 固有 directive・任意 HTML・任意 CSS を大量に許すと renderer 交換が難しくなるため、プロトタイプでは利用しても、製品の Markdown 契約として採用するかは別判断にします。

## 現時点の設計判断

### 採用してよいもの

- **比較基盤として Marp CLI を使う。**
- **Node.js 22 を実験環境の共通下限にする。** Vivliostyle 比較を後から追加しやすくするため。
- **Markdown parser は tuned 系で `breaks: false` を使う方向で検証を継続する。**
- **日本語 theme では `line-break: strict` と見出し `text-wrap: balance` を有力候補とする。**
- **生成物は Actions artifact とし、Git にコミットしない。**
- **Marp 固有処理は source Markdown から可能な限り分離する。**

### まだ採用しないもの

- Marp を製品レンダラーとして正式採用すること。
- 独自 Markdown 方言。
- 独自 AST / 独自 renderer。
- Vivliostyle の組み込み。
- `text-autospace` を必須仕様にすること。
- `text-spacing-trim` や実験的な `word-break: auto-phrase` への必須依存。
- overflow の自動文字縮小。
- AI をレンダリング工程へ入れること。

## 次の判定ゲート

Marp tuned で次に確認すべきものは、現在まだ検証不足の領域です。

- 実際に overflow する高密度スライド
- 長い URL / code span の破綻条件
- 画像 + 本文、2カラム等、実用スライドのレイアウト
- `text-autospace` の句読点・括弧周辺を含む副作用
- PDF / PPTX / HTML 間での見た目の差

これらが CSS theme と薄い wrapper の範囲に収まるなら Marp wrapper 方向を継続します。

CSS だけでは解決しない日本語組版上の問題が複数残る場合に、同じテストケースを Vivliostyle `@vivliostyle/theme-slide` へ流して比較します。
