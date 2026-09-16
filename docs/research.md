# misereru 調査メモ

最終更新: 2026-09-16

この文書は、Markdown からスライドを生成するツールについて、これまでの調査・比較・命名検討を会話スレッドから退避したものです。

**結論だけを残すのではなく、落選理由・未決事項・判断基準も残します。** 後から再検討する際に「なぜその案を捨てたか」が分からなくなることを避けるためです。

---

## 1. 現在地

### 仮称

**misereru**

リポジトリ: <https://github.com/myokoym/misereru>

仮決定であり、正式名称は未確定です。

`mireru` という既存の個人ビューワー名とのファミリー感を意識しています。

`mireru` では、単に `見る = miru` を使うのではなく、

```text
見られる → 見れる → mireru
```

という、口語的な可能形を使うことで、意味を保ちながら一般語そのものから少しずらし、検索上の一意性も上げています。

`misereru` も同様に、

```text
見せられる → 見せれる → misereru
```

という構造を持つため、仮称として採用しています。

ただし「見せられる」は **レンダリング** の意味を直接持たないため、名称として本当に最適かは未決です。

---

## 2. プロダクトの目的

Markdown を唯一の正本として、スライドを生成・レンダリングするツールを想定しています。

重要なのは単なる「Markdown ビューワー」ではありません。

```text
Markdown
  ↓ 解釈
情報構造・見出し・本文・画像・図を認識
  ↓
スライド単位へ構成
  ↓
日本語として自然に組版・改行
  ↓
スライドとして描画 / render
```

「見るだけ」なら Markdown や HTML のテキスト表示で足りるため、価値の中心は **テキストを視覚的なスライド面として成立させること** にあります。

意味上の二本柱は現時点で次の通りです。

1. **Slide / presentation** — テキストをスライドにする。
2. **Rendering** — テキストをレイアウトし、見える形へ描画する。

どちらか一方だけを表す名前では弱い可能性があります。

---

## 3. 必須条件

### 編集・管理

- 編集は Markdown のみで完結させたい。
- タイトル、テーマ、ページサイズ、ページ番号、出力設定などのメタ情報もテキスト管理する。
- PowerPoint や Google Slides 上での手編集を前提にしない。
- 生成物と正本を分離する。

```text
Markdown = source
HTML/PDF/PPTX = build artifact
```

- スマートフォン側へ Node.js 等のローカル開発環境を要求しない。
- ChatGPT + GitHub を基本編集 UI として成立させたい。
- Git 管理しやすいことを重視する。

### 日本語

日本語の品質は重要要件です。

単に文字が収まるだけでは不足で、少なくとも以下を扱いたいです。

- 行頭禁則
- 行末禁則
- 句読点・括弧の扱い
- 英数字と日本語が混在する場合の折返し
- 欧文単語の不自然な途中分割を避ける
- 見出しの不自然な分割を避ける
- 約物の間隔
- 行長・行分割の自然さ

W3C JLREQ:
<https://www.w3.org/International/jlreq/?lang=ja>

---

## 4. 既存ツール調査

### 4.1 Marp

公式: <https://marp.app/>

CLI: <https://github.com/marp-team/marp-cli>

Marpit directives: <https://marpit.marp.app/directives>

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

#### 注意点: PPTX

通常の Marp PPTX は、見た目を維持するためスライドが画像的な形で格納されます。

ただし今回は **PowerPoint を直接編集しない** ため、大きな欠点ではありません。

`--pptx-editable` も存在しますが実験的であり、今回の中心要件ではありません。

#### 重要な注意点: Markdown 内改行

Marp は通常、段落中の Markdown の物理改行を `<br>` として扱います。

ChatGPT が読みやすさのためにソース Markdown を適当に改行すると、その場所が強制改行になり、日本語の自動改行品質を壊す可能性があります。

そのため Marp を採用する場合、Markdown parser の `breaks: false` を固定する案が重要です。

Marp how-to:
<https://github.com/marp-team/marp/blob/main/website/docs/guide/how-to-write-slides.md>

---

### 4.2 Quarto / Pandoc

Quarto PowerPoint:
<https://quarto.org/docs/presentations/powerpoint.html>

Pandoc:
<https://pandoc.org/>

#### 長所

- Markdown から PowerPoint のネイティブ要素を持つ PPTX を生成できる。
- 既存 PPTX を `reference-doc` として利用可能。
- Markdown + YAML によるテキスト管理が可能。
- レポート、HTML、Word、PDF 等も同じエコシステムで扱える。

#### 今回の評価

PowerPoint を後編集しないため、Marp に対する大きな優位点が薄れます。

Quarto はスライド専用ではなく文書パブリッシングシステムとして広く、今回の単目的ツールにはやや大きすぎます。

将来、

```text
1つの Markdown
  ├─ Web article
  ├─ PDF report
  ├─ slide
  └─ Word
```

まで必要になった場合には再評価候補です。

---

### 4.3 Slidev

公式: <https://sli.dev/>

Export: <https://sli.dev/guide/exporting.html>

GitHub: <https://github.com/slidevjs/slidev>

#### 長所

- Markdown ベース。
- Vue / CSS / JavaScript / Mermaid / 数式 / アニメーション等に強い。
- Web プレゼンとしての表現力が高い。

#### 今回の評価

プロジェクトが、

```text
slides.md
package.json
components/
layouts/
styles/
```

のような Web アプリ構造へ発展しやすく、ChatGPT が触る状態空間が広がります。

「Markdown だけを正本として簡潔に管理」の条件では Marp より過剰です。

PPTX export も基本的に各スライドのキャプチャに近いため、ネイティブ PowerPoint 編集用途には向きませんが、今回はそこは主要問題ではありません。

---

### 4.4 slidown

GitHub: <https://github.com/Songmu/slidown/>

#### 特徴

- Markdown → ネイティブ OOXML PowerPoint を生成。
- LibreOffice 等を経由せず Go で処理。
- 既存 PPTX / POTX をテンプレートとして利用可能。
- Markdown 更新時、PowerPoint 側の手修正を残す `freeze` 等の考え方がある。

#### 今回の評価

「Markdown と PowerPoint 手編集を往復する」用途には興味深いですが、今回は **Markdown だけを編集する** ため最大の強みが不要です。

比較対象として残す程度です。

---

### 4.5 k1LoW/deck

GitHub: <https://github.com/k1LoW/deck>

思想:

```text
Markdown = content
Google Slides = design
```

Google Slides を最終成果物として手編集する場合には有力ですが、今回の「Markdown のみ編集」とは少し違います。

---

### 4.6 Presenton / AI スライド生成系

Presenton:
<https://github.com/presenton/presenton>

これは単純な Markdown renderer ではなく、長文 Markdown 等を AI が読み、内容を圧縮・再構成してプレゼンへする方向です。

今回の想定は原則として、

```text
Markdown に書かれた内容・構造
→ 決定論的にスライドへ render
```

であり、AI が毎回内容を勝手に編集することとは別カテゴリです。

---

### 4.7 Vivliostyle

公式: <https://vivliostyle.org/>

テーマ利用:
<https://docs.vivliostyle.org/en/themes/usage/>

CLI config:
<https://docs.vivliostyle.org/ja/cli/config/>

#### 長所

- 日本語を含む CSS 組版を強く意識した実装。
- `text-spacing` や `hanging-punctuation` 等、日本語組版に重要な機能を積極的に実装してきた。
- Markdown → PDF / WebPub 等に対応。
- slide theme も存在する。

#### 今回の評価

**日本語組版品質だけを見るなら非常に重要な比較対象**です。

一方、Marp のようなスライド用途のシンプルさや PPTX 生成は弱いです。

したがって現在は、

- スライドツールとしての運用: Marp 優位
- 日本語組版エンジンとしての品質: Vivliostyle 優位候補

という整理です。

自作を検討する場合にも Vivliostyle の日本語組版思想は参考になります。

---

## 5. 日本語組版の技術要件

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

MDN:
<https://developer.mozilla.org/ja/docs/Web/CSS/Reference/Properties/line-break>

### `word-break: normal`

乱暴な文字単位分割を避ける方向。

MDN:
<https://developer.mozilla.org/ja/docs/Web/CSS/Reference/Properties/word-break>

### `text-wrap: balance`

見出しが複数行になった際の行長を均衡させる用途。

### `text-wrap: pretty`

本文のより自然な折返し候補。

MDN:
<https://developer.mozilla.org/ja/docs/Web/CSS/Reference/Properties/text-wrap>

### `text-autospace`

日本語と Latin 文字の境界等を自動調整する新しい CSS。

```css
text-autospace: normal;
```

MDN:
<https://developer.mozilla.org/ja/docs/Web/CSS/Reference/Properties/text-autospace>

### `text-spacing-trim`

約物の内部空白調整等に関係しますが、ブラウザ対応状況を見ながら扱う必要があります。

MDN:
<https://developer.mozilla.org/ja/docs/Web/CSS/Reference/Properties/text-spacing-trim>

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

### 実レンダリング比較が必要

仕様表だけでは決めません。

Marp / Vivliostyle / 自作候補に対し、同じ Markdown で「嫌な日本語改行ケース」を 10〜20 個程度用意し、スクリーンショットまたは PDF で比較する価値があります。

例:

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

## 6. 現時点の技術選定

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

## 7. 命名のルール

命名では別途管理している `naming-app-service.md` の方針を参考にしています。

今回のプロジェクト固有の条件は以下です。

### 7.1 最優先は意味

ドメイン、npm package、GitHub repository が空いていることから名前を逆算しません。

まず機能に意味的に合う候補を作り、その後に既存サービス・package・検索衝突を確認します。

### 7.2 `mireru` と同じく動作語をローマ字化する方向

単なる名詞ローマ字化より、

```text
○○する
○○できる
```

に相当する日本語動作語をローマ字化する方向を優先します。

`byoga` のように「描画」という名詞をそのままローマ字化する案は、このルールから外れるため落としました。

### 7.3 `mireru` の特殊性

`mireru` は標準的な `mirareru` ではなく、ら抜き言葉の `mireru` を使っています。

これにより、

- 短い
- 日本語話者には意味が通る
- 一般語そのものから少しずれる
- 検索一意性を上げられる

という利点があります。

同じ法則が使える動詞は多くありませんが、候補生成では確認します。

### 7.4 ひらがな辞書順テスト

非常に重要なルールです。

ローマ字名を日本語話者がひらがなへ戻したとき、**そのひらがなを辞書・検索で調べて上位に出る意味**が目的機能に近いかを見ます。

特定の漢字を当てなければ成立しない意味を都合よく採用しません。

例:

`okosu` を「原稿から資料を起こす」の意味で候補にしたことがありましたが、これは不適切でした。

「おこす」の上位義は「横になっているものを起こす」「目を覚まさせる」等で、文書化の意味はかなり後ろです。

したがって `okosu` は落選です。

### 7.5 長さ

**2〜4音程度を優先。**

5音以上は、意味が非常にぴったり合う場合以外は弱いと考えます。

`utsushidasu` は「スクリーンへ映す」「表現する」という意味を持つものの、5音で、その長さを許容するほど完全一致ではないため後退しました。

### 7.6 古語・方言は利用可能

初見で意味が伝わることは必須ではありません。

古語・方言・廃語でも、検索した際に目的に合う意味が上位に出るなら候補にできます。

ただし、単に珍しくて SEO が空いているから採るのは不可です。

### 7.7 他分野の強い専門連想を避ける

写真・カメラ・映画等の意味が強すぎる候補は慎重に扱います。

例:

- `genzo` → 現像。写真用語が強すぎる。
- `eisha` → 映写。映画・プロジェクター寄り。
- `gento` → 幻灯。歴史的スライドではあるが映写装置の意味が強い。
- `utsushie` → 写真・投影の歴史語が強い。

意味の一部が近いだけでは本命にしません。

### 7.8 名前の意味の柱

少なくとも次の二つを意識します。

- **スライドにする**
- **レンダリングする**

「見せる」だけでは、テキスト表示との差が出ません。

「並べる」だけでは、レンダリングの意味が弱いです。

---

## 8. 命名候補の検討履歴

### miseru

意味:

```text
見せる
```

意味の基準点としては非常に近かった候補です。

`mireru / miseru` で「見る側 / 見せる側」の対もきれいでした。

ただし既存衝突が強いです。

確認された例:

- iPhone アプリ `Miseru - 見せて伝える意思表示アプリ`
- 店舗 POS / 会員管理系 `Miseru`
- GitHub PR 向け開発者 SaaS `Miseru`
- AI 製品デモ生成 SaaS `Miseru`
- 国内法人等

特に `miseru.dev` が開発者向け CLI で `npx miseru ...` を使用しており、今回と利用者層・CLI 名前空間が近いため強い衝突です。

そのため正式名としては避ける方向です。

---

### misereru

現在の仮称。

```text
見せられる → 見せれる → misereru
```

`mireru` と同じ「ら抜き可能形による短縮・一意化」の考え方を適用できます。

長所:

- `mireru` とのファミリー感が強い。
- 日本語の動作語として解釈できる。
- `miseru` より一般語そのものから一段ずれる。

弱点:

- 「見せられる」は presentation の目的には近いが、rendering 自体の意味は弱い。
- 正式名としてはまだ検討中。

---

### naraberu

```text
並べる
```

長所:

- レイアウト・配置のニュアンス。
- ローマ字名として自然。
- 大規模な直接競合は比較的少ないと見られた。

弱点:

- 「単にオブジェクトを並べる」意味が強い。
- Markdown を解釈してレンダリングする意味から遠い。

予備候補へ後退。

---

### kumeru

```text
組める
```

長所:

- 構成するニュアンス。
- `mireru` と語感が比較的近い。

弱点:

- 「何を組むのか」が名前から分からない。
- renderer より構造編集を連想しやすい。
- npm `kumeru` の先客が確認された。

予備候補。

---

### utsusu / utsuseru

`写す / 映す` を利用する方向。

弱点:

- `utsusu` をひらがなで見たとき、「写す＝書き写す・模写する」が先に出やすい。
- renderer の「レイアウトして成立させる」意味が弱い。
- 写真・投影の連想も強い。

`utsuseru` は `mireru` と形が近かったものの、同名に近いスライド / デジタルサイネージ系サービス「ウツセル」が確認され、用途衝突も強いため後退。

---

### shimesu

```text
示す
```

presentation / show の意味には近いが、やや硬い。

AWS 向け static artifact publishing platform `shimesu` 等、技術系同名利用も確認されました。

renderer の意味も弱いため後退。

---

### tsutaeru / tsutawaru

プレゼンの目的としては自然ですが、スライド生成・レンダリングの動作そのものから遠いです。

また `TSUTAERU` 等の既存サービスが強く、後退。

---

### egaku / egakeru / egakidasu

```text
描く
描ける
描き出す
```

辞書上、「絵・図として表現する」「文章等によって目に見えるように表す」意味があり、rendering との距離は近いです。

弱点:

- イラスト・画像生成の連想が強い。
- `EGAKERU` 等、デジタルイラスト系の既存利用が存在。

本命から後退。

---

### byoga

「描画」がコンピュータ分野で rendering に近いことから一時候補にしましたが、**命名ルール上の誤り**でした。

理由:

- 名詞ローマ字化であり、「○○する / ○○できる」動作語というファミリー方針から外れる。
- `びょうが` は「描画」だけでなく「病臥」も同音。
- `BYOGA` はヨガ等の既存名として使われている。

候補から除外。

---

### okosu

```text
起こす
```

「原稿からスライドを起こす」という業界的な用例を根拠に一時評価しましたが、**ひらがな辞書順テストに失敗**しました。

「おこす」の上位義は起立・覚醒等で、文書化・作成は後順位です。

候補から除外。

---

### arawasu

```text
表す / 現す
```

意味上は強い候補です。

辞書上位に、

- 見えなかったものを見えるようにする
- 考え等を言葉・絵で示す / 表現する

といった意味があります。

renderer の概念には近いです。

弱点:

- スライド自体のシグナルは弱い。
- `ARAWASU` という既存サービスが確認されている。

意味研究上は重要ですが正式名には課題あり。

---

### katadoru

```text
象る / 模る
```

「形を写し取る」「形象化して表す」という意味があり、render / materialize に近いです。

弱点:

- 4音で許容範囲だがやや重い。
- 印刷・表現系を含む既存 `KATADORU` がある。
- slide そのものの意味は弱い。

---

### arawaru

文語的な「現る」。

```text
現れる / become visible / materialize
```

の意味を持つため、renderer の結果を表す語として興味深い候補です。

長所:

- 写真・カメラ等の別専門分野に引っ張られにくい。
- 「見えないものが見える形になる」という意味が rendering に近い。

弱点:

- 自動詞であり、ユーザーが「スライドを作る」動作ではなく、結果側を表す。
- slide のシグナルは弱い。

---

### arawaro

上代東国方言として調べた候補。

「あらわる（現）」の方言形で「現われる」という意味が辞書上確認できました。

今回の「古語・方言でも、検索したら意味が上位に出ればよい」という条件には合います。

長所:

- 4音。
- 比較的検索一意性が高い。
- materialize / become visible の意味。

弱点:

- `arawaru` と同様、自動詞で結果側。
- slide 自体の意味は弱い。
- 一般認知は非常に低い。

---

### meseru

一部方言で「見せる」を意味する語として確認。

```text
mireru
meseru
```

の並びはきれいですが、結局「見せる」なので rendering の意味柱を満たしません。

ファミリー感だけで採用しない方針。

---

### rendaru

```text
レンダリングする
↓
レンダる
↓
rendaru
```

**自然な日本語候補に決め手がなかった場合の次善策**です。

長所:

- rendering の意味が非常に明確。
- 日本語話者なら「レンダる」という語源を追える。
- 4音。
- `renderu` / `renderru` より検索識別性を上げやすい。
- 今回調査した範囲では、有力な同名アプリ・SaaS・開発ツールの直接衝突は目立たなかった。

弱点:

- 自然な既存日本語ではなく、技術語の日本語動詞化。
- slide の意味は名称単体にはない。

位置づけ:

**本命ではない。自然な日本語・古語・方言でしっくり来る候補を探し切ってから比較する。**

---

### renderu / renderru

`rendaru` の比較対象。

#### renderru

- `render + ru` の境界は見える。
- しかし `render.ru` と視覚的・検索的に近すぎる。
- 採用優先度は低い。

#### renderu

- 見た目は比較的自然。
- ただし `render` との境界が弱く、既存ハンドル等のノイズもある。

現状は `rendaru` の方を上位としています。

---

## 9. 命名で今後やること

現時点での正式名称は未決です。

探索順序は次の通りです。

### 第一レーン: 自然な日本語の短い動作語

条件:

- 2〜4音程度。
- 「スライドにする」「レンダリングする」の意味に近い。
- ひらがなで検索した際、その意味が上位に出る。
- 写真・カメラ等、他専門分野の強い第一連想がない。
- 一般名詞ではなく動作語をローマ字化できる。

### 第二レーン: 古語・方言

初見理解は必須ではありません。

検索時に辞書上位で意味を回収できれば可。

ただし珍しいだけの語は不可。

### 第三レーン: 可能形による一意化

`mireru` と同様、

```text
〜られる → 〜れる
```

のように、日本語として意味を保ちながら短く固有化できる候補があれば優先的に評価します。

この法則を使える適切な短語は多くありません。

### 最後の次善策

**rendaru**

---

## 10. 現時点の候補の扱い

### 仮名称

- **misereru** — リポジトリ名として仮決定。

### 意味探索上まだ参照する

- arawasu
- arawaru
- arawaro
- katadoru
- egaku / egakidasu
- noseru
- kumeru
- naraberu

### 次善策

- **rendaru**

### 強い理由で後退 / 除外

- miseru — 同名サービス・開発者 CLI の衝突が強い。
- utsuseru — 同名に近いスライド / サイネージ系サービス。
- utsusu — コピー・写真・投影連想が強く renderer 感が弱い。
- okosu — 欲しい意味が辞書上位ではない。
- byoga — 名詞で命名ルール外 + 同音・SEO 問題。
- genzo — 写真現像の連想が強い。
- eisha — 映画 / プロジェクタの連想が強い。
- gento — 幻灯という別専門領域 + 既存名。
- utsushie — 写真 / 投影の歴史語が強い。
- shitate — 文章系既存サービスがある。
- tsutaeru / tsutawaru — 目的は近いが renderer から遠く既存名も強い。
- egakeru — デジタルイラスト系既存利用。
- shimesu — 硬い + 技術系既存利用。

---

## 11. まだ決めていないこと

### 技術

- Marp をそのまま採用するか。
- Marp fork / wrapper 程度にするか。
- レンダラーを自作するか。
- Vivliostyle を内部レンダリングに利用するか。
- HTML / PDF / PPTX のどこまでを初期対応するか。
- Mermaid を標準対応するか。
- 外部 CSS を許すか、Markdown 1 ファイル完結を強制するか。
- 共通テーマをどこまで分離するか。

### 日本語組版

- Chromium の最新 CSS だけで十分な品質になるか。
- `text-autospace` の実運用品質。
- `text-spacing-trim` をいつ採用可能とみなすか。
- `auto-phrase` を利用するか。
- 句読点ぶら下げ等をどこまで独自処理するか。
- overflow 時に文字縮小・再レイアウト・警告のどれを行うか。
- スライド向けの見出し改行最適化をどこまで自動化するか。

### プロダクト

- Markdown を完全に Marp 互換にするか、独自 front matter / directive を持つか。
- Marp の上位互換を目指すか、別設計にするか。
- AI はレンダリング時には使わず、Markdown 編集側の ChatGPT に限定するか。

### 命名

- `misereru` を正式名へ昇格するか。
- 自然な日本語・古語・方言をさらに探索するか。
- `rendaru` と最終比較するか。

---

## 12. 次の検証候補

命名より先に技術検証を進める場合、まず以下を行うと判断材料が増えます。

1. 日本語の厳しい改行テスト用 Markdown を作る。
2. Marp の標準出力を生成する。
3. 日本語 CSS 調整版を生成する。
4. Vivliostyle slide theme で同一内容を生成する。
5. 禁則、見出し折返し、英数字混植、約物、overflow を目視比較する。
6. Marp ベースで不足する要素を一覧化する。
7. 不足が CSS で解決できるか、独自 renderer が必要かを判断する。

ここまで実施すれば、「既存ツール + テーマ」で十分か、「misereru として自作する価値があるか」をかなり具体的に判断できます。
