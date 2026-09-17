<!-- {"key":"title"} -->
# misereru

Markdownを正本に、GitHub上でスライドを生成・公開する。

**スマートフォン + ChatGPT + GitHubだけでも回せる、text-firstなpresentation workflow。**

---

<!-- {"key":"section-why","type":"section"} -->
# 1. なぜ作るのか

スライドの内容だけでなく、生成・公開までテキスト中心で管理したい。

---

<!-- {"key":"origin"} -->
# 出発点

欲しかったのは「Markdownを書けるスライドツール」だけではありません。

- スマートフォンからChatGPT / GitHubで編集できる
- ローカルPCやPowerPointを日常運用の必須工程にしない
- タイトル、構造、出力設定までGitで追える
- 日本語の改行や禁則を軽視しない
- buildや重い処理はGitHub Actionsへ任せる

**資料そのものを、コードと同じように再生成可能なsourceとして扱う**ことが出発点です。

---

<!-- {"key":"problem"} -->
# 既存ツールをそのまま使うだけでは足りなかった

MarpはMarkdownからHTML / PDFを生成でき、初期rendererとして有力です。一方で、正本sourceへrenderer固有設定を直接混ぜたくはありませんでした。

Google Slides系の生成も検証しましたが、Marpと併用すると **CSS/theme とSlides layoutの2系統** を維持する問題が出ます。

そこでmisereruでは、まず **source / renderer / publishを分離し、利用者が触る経路を単純に保つ** 方針を採っています。

---

<!-- {"key":"principle"} -->
# 設計原則

> 編集しやすいsourceと、読みやすい成果物は別の要件。

| 要件 | misereruの初期方針 |
| --- | --- |
| 正本 | Markdown |
| 編集 | GitHub / ChatGPT中心 |
| build | GitHub Actions |
| renderer | Marp 1系統 |
| HTML | 常時生成 |
| PDF | optional |
| Pages | optional |
| ローカルPC | 日常運用では不要 |

---

<!-- {"key":"section-how","type":"section"} -->
# 2. どう動くのか

sourceは単純に、buildとpublishは自動化する。

---

<!-- {"key":"pipeline"} -->
# 基本パイプライン

```text
slides.md
  ↓ misereru adapter
一時Marp入力
  ↓ Marp
  ├─ HTML
  └─ PDF（optional）
      ↓
GitHub Actions artifact / GitHub Pages
```

正本 `slides.md` には `marp: true` などのMarp固有front matterを要求しません。renderer固有情報はbuild時に注入します。

---

<!-- {"key":"daily-workflow"} -->
# 日常操作を短くする

1. 資料repositoryを作る
2. `slides.md` をChatGPT / GitHubで編集する
3. commit / pushする
4. GitHub ActionsがHTMLを生成する
5. 必要な場合だけPDF / Pagesを有効にする

Node.js CLIやローカルのrendererを、通常操作の前提にしません。

---

<!-- {"key":"self-contained"} -->
# 1資料 = 1 repository、しかも自己完結

資料repositoryにはbuildに必要なものをすべて持たせます。

```text
slides.md
misereru.config.json
package.json
marp.config.mjs
themes/
scripts/
.github/workflows/
```

生成後のrepositoryが、元の `misereru` repositoryを実行時に参照する構成にはしません。

---

<!-- {"key":"config"} -->
# 出力もテキストで管理する

```json
{
  "outputs": {
    "html": { "enabled": true },
    "pdf": { "enabled": false }
  },
  "publish": {
    "githubPages": { "enabled": false }
  }
}
```

HTMLは既定。PDFとPagesは必要な資料だけ明示的に有効化します。

---

<!-- {"key":"section-quality","type":"section"} -->
# 3. 何を重視しているのか

「Markdownから出た」だけで完成とはしない。

---

<!-- {"key":"japanese-typesetting"} -->
# 日本語組版を重要要件にする

評価対象は、単なるoverflow回避ではありません。

- 行頭・行末禁則
- 句読点・括弧の扱い
- 日本語と英数字が混在する場合の折返し
- 欧文単語の不自然な途中分割
- 見出しの不自然な分割
- 行長・行間・本文密度
- スマートフォンで見たときの可読性

現在のthemeではNoto CJK系fontを使い、Marp側の日本語表示を調整しています。

---

<!-- {"key":"navigation"} -->
# 目次もsourceから生成する

各slideにはmetadata commentのstable `key` を持たせ、`type: "section"` のslideだけを目次へ載せます。

```markdown
<!-- {"key":"section-quality","type":"section"} -->
# 3. 何を重視しているのか
```

build時に表紙の直後へ目次を生成し、現在のMarp HTMLでは並び順からリンク先slide番号を再計算します。

---

<!-- {"key":"renderer-choice"} -->
# 初期版はrendererを増やしすぎない

| target | 現在の扱い |
| --- | --- |
| HTML | production |
| PDF | optional production |
| GitHub Pages | optional publish |
| Google Slides | research / prototype |
| PPTX | production未対応 |

Google Slides生成自体は検証済みですが、同一デザインを保つ仕組みが固まるまでproduction targetには入れません。

---

<!-- {"key":"section-repository","type":"section"} -->
# 4. repository自体の設計

配布物と開発資料を分けながら、1 repositoryで管理する。

---

<!-- {"key":"branches"} -->
# `main` と `develop`

- [`main`](https://github.com/myokoym/misereru/tree/main)
  - 利用者側へ渡す自己完結セット
- [`develop`](https://github.com/myokoym/misereru/tree/develop)
  - requirements / research / ADR / prototypeを含む開発・統合branch

別のtemplate repositoryを同期する構成にはせず、**default branchを配布境界として使う**方針です。

---

<!-- {"key":"what-works"} -->
# 現在できていること

- Markdown sourceからMarp HTMLを自動生成
- GitHub Actions artifactとして成果物を保存
- section metadataから目次を自動生成
- HTML内の外部リンクを保持
- 日本語fontをActions上へ導入してbuild
- PDFをconfigで任意生成
- GitHub Pagesをconfigで任意publish
- スマートフォン + GitHub / ChatGPT中心の運用

この資料自体もmisereruで生成しています。

---

<!-- {"key":"open-work"} -->
# まだ整備中の部分

実装だけでなく、ツールとしての管理も進行中です。

- [#3 バージョニングとリリース運用](https://github.com/myokoym/misereru/issues/3)
- [#4 ライセンス方針](https://github.com/myokoym/misereru/issues/4)
- [#5 利用者向けREADME / docs](https://github.com/myokoym/misereru/issues/5)
- [#6 OSS repository運用](https://github.com/myokoym/misereru/issues/6)

この紹介deckを、そのまま資料repositoryの開始テンプレートにも使うかは別途判断します。

---

<!-- {"key":"summary"} -->
# misereru が目指すもの

**文章を書く場所と、スライドを生成する場所を分ける。**

- sourceはGitで読みやすく、AIからも編集しやすく
- buildはremoteで再現可能に
- HTMLはすぐ見られ、必要ならPDFやPagesへ
- 日本語資料としての読みやすさを落とさない
- rendererや外部サービスを増やしすぎない

Repository: [github.com/myokoym/misereru](https://github.com/myokoym/misereru)
