<!-- {"key":"title"} -->
# misereru

テキストを正本に、GitHubでスライドを管理・生成・公開する。

スマートフォン + ChatGPT + GitHubを通常経路にするためのスライド環境です。

---

<!-- {"key":"why","type":"section"} -->
# 1. GUIを正本にしない

資料の内容と履歴を、特定の編集アプリから切り離す。

---

<!-- {"key":"problem"} -->
# 解決したいのは「MarkdownをHTMLにすること」ではない

目標は、**Gitで管理できる正本から、資料を再生成・更新・公開できること**です。

```text
text / project source
  ↓
情報構造を保持したまま編集
  ↓
slide / presentation
  ↓
rendererで生成
  ↓
publish / export
```

PowerPointやGoogle Slides上の手編集を、内容管理の必須工程にはしません。

---

<!-- {"key":"workflow"} -->
# 通常操作は `slides.md` の編集とpushに絞る

日常的な作業は次の経路で完結させます。

1. `slides.md` を編集する
2. GitHubへcommit / pushする
3. GitHub Actionsがbuildする
4. HTMLを確認する
5. 必要な資料だけPDFやPagesを有効化する

ローカルPC、Node.js CLI、PowerPointを通常操作の必須条件にはしません。

---

<!-- {"key":"design","type":"section"} -->
# 2. 通常経路を単純に保つ

機能を増やす前に、正本・build・公開の責務を分ける。

---

<!-- {"key":"source-of-truth"} -->
# Markdownは初期の正本、Marpはrenderer

初期版では `slides.md` を正本にしますが、Marp固有の記述は正本へ持ち込みません。

- `slides.md` はGitHub上で差分を追える
- renderer固有front matterはbuild時に一時入力へ注入する
- 生成物は正本から再生成できる
- 将来ほかのsource adapterを追加できる余地を残す

**Markdown専用に固定するためではなく、最初の通常経路を単純にするための選択です。**

---

<!-- {"key":"diagram"} -->
# 図の構造もテキストの正本に残す

利用者が意識する流れは、正本・build・出力の3段階です。Mermaidは正本に残し、変換処理はbuild側へ隠します。

```mermaid
flowchart LR
  A["正本<br/>slides.md + Mermaid"] --> B["misereru build<br/>図とスライドを生成"] --> C["出力<br/>HTML / PDF / Pages"]
```

---

<!-- {"key":"self-contained"} -->
# 1資料 = 1 repositoryで自己完結させる

資料repositoryだけで、buildとAI編集支援まで再現できる構成にします。

```text
presentation repository
├─ slides.md
├─ misereru.config.json
├─ .agents/skills/
│  └─ misereru-slide-writing/SKILL.md
├─ package.json
├─ marp.config.mjs
├─ themes/
├─ scripts/
└─ .github/workflows/
```

実行時に外部の `misereru` repositoryへ依存しません。

---

<!-- {"key":"renderer"} -->
# production rendererはMarp 1系統に限定する

初期production buildではHTMLとPDFを同じrenderer / themeから生成し、複数rendererの同時production運用は避けます。

| 出力 | 現在の扱い |
| --- | --- |
| HTML | 必須・常時生成 |
| PDF | optional |
| GitHub Pages | optional publish |
| Google Slides | research / prototype |
| PPTX | production未対応 |

---

<!-- {"key":"japanese","type":"section"} -->
# 3. AI編集と日本語表示を別の責務として扱う

文章内容と組版品質を、同じ仕組みに押し込まない。

---

<!-- {"key":"ai-editing"} -->
# AI編集の規範も資料repositoryに同梱する

`misereru-slide-writing` Skillは、AIで `slides.md` を作成・再構成・推敲するときの内容設計ルールです。

- Presented / Reference / Mixedで情報密度を分ける
- 1 slide 1 primary messageを基本にする
- 根拠・条件・留保を短文化のために削らない
- 調査・仕様資料へstoryや強い断定を機械的に足さない
- 事実・解釈・提案・未確認事項を区別し、stable `key` 等のsource規則を守る

Skillは **source編集側の支援**であり、buildの必須依存ではありません。

[Skill source](https://github.com/myokoym/misereru/blob/main/.agents/skills/misereru-slide-writing/SKILL.md)

---

<!-- {"key":"typesetting"} -->
# 日本語の表示品質はtheme / renderer / buildで担保する

文章内容の品質と、画面上の組版品質を分離します。

| 責務 | 主に扱うもの |
| --- | --- |
| Agent Skill | 論証、用語、冗長性、情報密度、出典 |
| theme / renderer / build | 禁則、折返し、行間、overflow、文字サイズ |

表示側では、行頭・行末禁則、句読点・括弧、和欧混植、欧文単語の途中分割、見出し折返し、約物間隔などを検証対象にしています。

参考: [W3C 日本語組版処理の要件（JLREQ）](https://www.w3.org/International/jlreq/?lang=ja)

---

<!-- {"key":"navigation"} -->
# HTMLは「移動できる文書」として生成する

閲覧中に参照・移動できることを、HTML outputの要件に含めます。

- Markdownの外部linkを保持する
- `type: "section"` のslideから目次を自動生成する
- 目次から対象slideへ移動できる
- slide追加・削除・並べ替え後も再生成で追随する
- source上では各slideにstable `key` を持たせる

単なる画像列ではなく、リンクを持つ閲覧可能な資料として生成します。

---

<!-- {"key":"history","type":"section"} -->
# 4. 検証したものを全部productionには入れない

調査・prototypeと、通常利用者が使う経路を分ける。

---

<!-- {"key":"research"} -->
# 既存ツールを調べ、独自実装する範囲を絞った

Markdown系スライドツール、日本語組版、Google Slides生成、source / renderer / outputの分離を調査しました。

その結果、初期版では独自rendererや大きな独自ASTを先に作らず、**既存rendererを使いながら、正本管理・変換・公開で不足する部分をmisereru側で補う**方針にしています。

開発資料は [`develop` branch](https://github.com/myokoym/misereru/tree/develop) に残しています。

---

<!-- {"key":"prototype"} -->
# prototypeは採用判断のために使う

これまでに確認した対象には次があります。

- Marpの日本語改行・禁則・見出し折返し
- HTML / PDF build
- 自動目次と内部navigation
- 外部hyperlink
- Google Slides APIのnative link
- `k1LoW/deck` を使ったGoogle Slides生成
- GitHub Actions / GitHub Pages

検証できたことと、productionへ採用したことは同一視しません。

---

<!-- {"key":"current","type":"section"} -->
# 5. 現在の対応範囲を限定して公開する

対応済み・prototype・未決を分けて扱う。

---

<!-- {"key":"current-scope"} -->
# production経路はMarkdown → Marp → HTML / PDF

Mermaidを含む場合は、正本の図sourceをbuild時にPNGへ変換してからMarpへ渡します。

```text
slides.md
  ↓ misereru adapter
Mermaid → PNG / 一時Marp入力
  ↓ Marp
  ├─ HTML
  └─ PDF (optional)
```

---

<!-- {"key":"current-status"} -->
# production・prototype・未決を混同しない

| 区分 | 現在の対象 |
| --- | --- |
| production | Markdown source、Mermaid図、HTML、optional PDF、optional Pages |
| 編集支援 | repository-scoped Agent Skill |
| research / prototype | Google Slides、別renderer候補 |
| 未決 | PPTX、共通AST、自動レイアウト等 |

未検証のoutputへ黙って分岐しません。

---

<!-- {"key":"branches"} -->
# `main` と `develop` で配布物と開発資料を分ける

| branch | 役割 |
| --- | --- |
| [`main`](https://github.com/myokoym/misereru/tree/main) | 配布用の自己完結セット |
| [`develop`](https://github.com/myokoym/misereru/tree/develop) | 開発・統合・docs / research / prototype |

Template Repositoryから資料repoを作る通常経路では `main` の内容だけを使い、開発資料を持ち込みません。

---

<!-- {"key":"site"} -->
# この紹介資料自体がmisereruの実例になっている

sourceの分類とPages上のURL構造を揃えています。

```text
site/
├─ slides/
│  └─ about/
│     ├─ slides.md
│     └─ misereru.config.json
├─ docs/
└─ examples/
```

このsourceをmisereruでbuildし、Pagesでは `/slides/about/` として公開します。今後ほかの資料・docs・examplesを追加しても同じ構造を拡張できます。

---

<!-- {"key":"next"} -->
# 未決事項は未決のまま管理する

今後の検討対象には、次があります。

- Markdown以外のsource adapter
- 複数Markdown構成
- 共通presentation model / AST
- Google Slidesのproduction対応
- AIをrenderer / 自動レイアウト工程へ入れるか
- template更新を既存資料repoへどう反映するか

必要になる前に初期版へ押し込まず、判断材料が揃った段階で決めます。

---

<!-- {"key":"summary"} -->
# misereruは「資料の正本と生成経路」をGit側へ戻す

目指しているのは、**Gitで管理できるテキストを正本にし、スマートフォンからでも編集・生成・公開まで辿れること**です。

そのために、通常経路を小さく保ち、AI編集・日本語組版・renderer・publishの責務を分離し、検証済みでも未採用の機能はproductionから外しています。

[GitHub repository](https://github.com/myokoym/misereru)
