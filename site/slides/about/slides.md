<!-- {"key":"title"} -->
# misereru

Markdownを正本に、GitHubだけで作って公開できるスライド環境。

スマートフォン + ChatGPT + GitHubを通常経路にするための試みです。

---

<!-- {"key":"why","type":"section"} -->
# 1. なぜ作るのか

スライド作成を、特定のGUIアプリやローカルPCに閉じ込めない。

---

<!-- {"key":"problem"} -->
# 欲しかったのは「Markdown変換ツール」だけではない

目標は、テキスト中心の正本から資料を**再生成・管理・公開**できることです。

```text
text / project source
  ↓
情報構造を解釈
  ↓
slide / presentation
  ↓
日本語として自然に組版
  ↓
publish / render
```

PowerPointやGoogle Slides上の手編集を、正本管理の必須工程にしないことを重視しています。

---

<!-- {"key":"workflow"} -->
# スマートフォンから完結させたい

日常操作はできるだけ単純にします。

1. `slides.md` を編集する
2. GitHubへcommit / pushする
3. GitHub Actionsがbuildする
4. HTMLを確認する
5. 必要な資料だけPDFやPagesを有効化する

ローカルPC、Node.js CLI、PowerPointは通常操作の必須条件にしません。

---

<!-- {"key":"design","type":"section"} -->
# 2. 設計で重視したこと

「できること」を増やすより、通常経路を崩さない。

---

<!-- {"key":"source-of-truth"} -->
# 正本はGitで扱いやすいテキスト

初期版ではMarkdownの `slides.md` を正本にします。

- GitHub上で差分を追える
- ChatGPTから安全に編集しやすい
- renderer固有のfront matterを正本へ持ち込まない
- 生成物は正本から再生成できる
- 将来ほかのsource adapterを追加できる余地は残す

**Markdown専用ツールに永久固定するためではなく、最初の通常経路を単純にするための選択です。**

---

<!-- {"key":"self-contained"} -->
# 1資料 = 1 repository、自己完結

資料repositoryにはbuildと編集支援に必要なものを含めます。

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

実行時に外部の `misereru` repositoryへ依存しない構成です。

---

<!-- {"key":"ai-editing"} -->
# AI編集の規範もrepositoryに含める

`misereru-slide-writing` Skillは、AIで `slides.md` を作成・再構成・推敲するときの内容設計ルールです。

- Presented / Reference / Mixedで適切な情報密度を分ける
- 1 slide 1 primary messageを基本にしつつ、必要な根拠・条件・留保を残す
- 調査・仕様資料へstoryや強い断定を機械的に足さない
- 日本語の論証、用語、冗長性、AI的な空疎表現を点検する
- stable `key`、`type: "section"`、renderer非依存の正本sourceを守る

Skillは **source編集側の支援**であり、GitHub Actionsのbuild依存にはしません。

[Skill source](https://github.com/myokoym/misereru/blob/main/.agents/skills/misereru-slide-writing/SKILL.md)

---

<!-- {"key":"renderer"} -->
# 初期rendererはMarp 1系統

初期production buildでは、HTMLとPDFを同じMarp renderer / themeから生成します。

| 出力 | 初期方針 |
| --- | --- |
| HTML | 必須・常時生成 |
| PDF | optional |
| GitHub Pages | optional publish |
| Google Slides | research / prototype |
| PPTX | production未対応 |

複数rendererを早期に混ぜて、デザインを二重管理することは避けています。

---

<!-- {"key":"japanese","type":"section"} -->
# 3. 日本語スライドとして成立させる

文字が枠内に入るだけでは十分ではない。

---

<!-- {"key":"typesetting"} -->
# 日本語組版を重要要件にする

検証対象には、少なくとも次を含めています。

- 行頭・行末禁則
- 句読点・括弧
- 和欧混植
- 欧文単語の途中分割
- 見出しの不自然な折返し
- 約物の間隔
- 行長・行間
- overflow時の扱い
- スマートフォンで見たときの本文サイズ

参考: [W3C 日本語組版処理の要件（JLREQ）](https://www.w3.org/International/jlreq/?lang=ja)

---

<!-- {"key":"navigation"} -->
# スライドを「移動できる文書」として扱う

HTMLではリンク情報を保持し、資料内の移動も自動生成します。

- 外部URLへのMarkdown linkを保持
- `type: "section"` のslideから目次を生成
- 目次から対象slideへ移動
- slide追加・削除・並べ替え後も再生成で追随
- 各slideにstable `key` を持たせる

単なる画像列ではなく、閲覧中に参照・移動できる成果物を目指しています。

---

<!-- {"key":"history","type":"section"} -->
# 4. ここまでの経緯

最初から現在の形を決め打ちしたわけではありません。

---

<!-- {"key":"research"} -->
# 既存ツールを調べ、作る範囲を絞った

検討では、Markdown系スライドツール、日本語組版、Google Slides生成、source / renderer / outputの分離などを調査しました。

その結果、初期版では独自rendererや大きな独自ASTを先に作らず、**既存rendererを使いながら、必要な管理・変換・公開部分をmisereru側で補う**方針に寄せています。

開発資料は [`develop` branch](https://github.com/myokoym/misereru/tree/develop) に残しています。

---

<!-- {"key":"prototype"} -->
# prototypeで確認してからproductionへ寄せる

これまでに検証したものの例です。

- Marpの日本語改行・禁則・見出し折返し
- HTML / PDF build
- 自動目次と内部navigation
- 外部hyperlink
- Google Slides APIのnative link
- `k1LoW/deck` を使ったGoogle Slides生成
- GitHub Actions / GitHub Pages

検証結果をそのまま全部productionへ入れず、通常経路に必要なものだけを残しています。

---

<!-- {"key":"current","type":"section"} -->
# 5. 現在地

まず、GitHub上のテキストからHTMLスライドを安定して作る。

---

<!-- {"key":"current-scope"} -->
# 現在のproduction範囲

```text
slides.md
  ↓ misereru adapter
一時Marp入力
  ↓ Marp
  ├─ HTML
  └─ PDF (optional)
```

- HTMLは常時生成
- PDFは必要な場合だけ
- Pages公開も明示的に有効化
- AI編集支援はsource編集側で利用し、buildには必須化しない
- Google Slides / PPTXはまだproduction対象外

未検証のoutputへ黙って分岐せず、対応範囲を限定しています。

---

<!-- {"key":"branches"} -->
# 配布物と開発資料をbranchで分ける

| branch | 役割 |
| --- | --- |
| [`main`](https://github.com/myokoym/misereru/tree/main) | 配布用の自己完結セット |
| [`develop`](https://github.com/myokoym/misereru/tree/develop) | 開発・統合・docs / research / prototype |

`main` に開発用資料を混ぜず、通常利用者が取得する内容を小さく保つ方針です。

---

<!-- {"key":"site"} -->
# この資料自体もmisereruで生成する

この紹介資料のsourceは、Pages上の分類と揃えて配置します。

```text
site/
├─ slides/
│  └─ about/
│     ├─ slides.md
│     └─ misereru.config.json
├─ docs/        # 将来追加可能
└─ examples/    # 将来追加可能
```

公開先も同じ構造で `/slides/about/` とします。

---

<!-- {"key":"next"} -->
# まだ決めていないことも残す

今後の検討対象には、次があります。

- Markdown以外のsource adapter
- 複数Markdown構成
- 共通presentation model / AST
- Google Slidesのproduction対応
- Mermaid
- AIをrenderer / 自動レイアウト工程へ入れるか
- template更新を既存資料repoへどう反映するか

未決事項を無理に初期版へ押し込まず、必要になった段階で判断します。

---

<!-- {"key":"summary"} -->
# misereruが目指しているもの

**Gitで管理できるテキストを正本にし、スマートフォンからでも、資料の編集・生成・公開まで辿れること。**

そのために、

- 通常経路を単純にする
- AI編集規範も資料repositoryへ持たせる
- 日本語品質を妥協しない
- buildをGitHub側へ寄せる
- 既存ツールを活用する
- 未検証機能を安易にproductionへ入れない

という方針で進めています。

[GitHub repository](https://github.com/myokoym/misereru)
