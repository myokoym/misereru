# Initial operation model

最終更新: 2026-09-19

misereru の初期運用で利用者が通常触る経路を定義します。

## 基本モデル

1つのスライド資料を、原則1つの GitHub repository として管理します。

```text
misereru template repository
  ↓ Use this template
presentation repository
  ├─ slides.md
  ├─ misereru.config.json
  ├─ .agents/skills/misereru-slide-writing/SKILL.md
  ├─ package.json
  ├─ marp.config.mjs
  ├─ themes/
  ├─ scripts/
  └─ .github/workflows/
```

新しい資料repositoryには、buildに必要なファイルと、資料編集を支援するrepository-scoped Agent Skillをテンプレートからコピーします。外部のmisereru repositoryを実行時依存として参照しません。

通常の編集では `slides.md` を更新します。必要な場合だけ `misereru.config.json` や theme を変更します。

```text
slides.md を編集
  ↓ commit / push
GitHub Actions
  ↓
Marp
  ├─ HTML             常時生成
  │   └─ GitHub Pages 初版成立後に公開
  └─ PDF              設定時のみ
```

ローカルPC、PowerPoint、Node.js CLIを日常操作の必須工程にしません。スマートフォン上のChatGPT / GitHubからの編集を通常経路として成立させます。

## Template Repository と開発branch

misereru repository自体は、配布物と開発資料をbranchで分けます。

```text
main      = Template Repositoryとして配布する自己完結セット
develop   = 開発・統合用。docs / research / prototype等を含む
```

`main` には資料repositoryが単独でbuildできるために必要なファイルに加え、資料repository内でAI編集支援を再現するためのSkillを置きます。`develop` には設計資料、調査、検証コード等を追加できます。

Template Repositoryから通常作成する資料repositoryではdefault branchである `main` の内容を使う想定です。開発資料を利用者側へコピーしないため、配布対象と開発専用資料を同じbranchへ混在させません。

### 派生repositoryのbranch方針

misereru本体の `main` / `develop` は、templateの配布物とmisereru自身の開発資料を分けるための内部構成です。**このbranch modelを、Template Repositoryから作成した資料repositoryへ自動継承しません。**

派生repositoryでは次を既定とします。

- repository固有のREADME / AGENTSに別規定がなければ、default branchを正本とする
- 「調査中」「草稿」「未公開」をbranch分離の理由にしない
- 調査履歴を保存するrepositoryでは、`research.md`、source、仮説、修正履歴をdefault branchへ積み上げる
- 履歴の時間軸はGit commit historyと調査正本で保持する
- branch新設は、並行作業、破壊的再構成、独立実験、PR review、公開版freezeなど、隔離する具体的対象がある場合だけにする
- branchを作る前に「何を隔離するか」「default branchではなぜ不十分か」を確認する

したがって、misereru本体のbranch名やbranch役割は、派生repositoryの「完成／未完成」「公開／未公開」の状態表現として使いません。

## `slides.md` はサンプル兼テンプレート

初期版では、空に近い最小テンプレートと別サンプルデッキを二重管理しません。rootの `slides.md` を、そのまま書き換えて使えるサンプル兼テンプレートとします。

代表的なページ型を `slides.md` に含めます。

- 表紙
- セクション見出し
- 通常本文
- 長めの本文
- 箇条書き
- 番号付き手順
- 表
- 引用
- コードブロック
- 外部リンク
- 強調表現
- 複数要素を含むページ
- まとめ

利用者は不要なページを削除し、内容を書き換えて使います。`type: "section"` を付けたセクション見出しから、build時に目次を自動生成します。

## AI編集支援

初期テンプレートには `.agents/skills/misereru-slide-writing/SKILL.md` を含めます。

このSkillはbuild処理ではなく、`slides.md` をAIで作成・編集する際の内容設計ルールです。Codex等がrepository-scoped Skillを利用できる場合に自動検出できる配置とし、Skill発見だけを目的とした `AGENTS.md` は必須にしません。

Skillの主な責務:

- Presented / Reference / Mixed の用途を区別し、用途に応じて情報密度を変える
- 1 slide 1 primary messageを基本としながら、必要な根拠・条件・比較は保持する
- 調査・仕様資料にstoryや強い主張を機械的に強制しない
- 事実、解釈、提案、未確認事項を区別する
- 日本語の論証、用語の一貫性、冗長性、AI的な空疎表現を点検する
- stable `key` と `type: "section"` を保持し、renderer固有front matterを正本へ持ち込まない
- publish/output設定を内容編集のついでに変更しない

Skill自体はGitHub Actionsのbuild依存にしません。Skillを解釈しない編集環境でも、`slides.md` とbuildは通常どおり利用できます。

参照元として、既存の高品質なpresentation / Marp / Japanese technical writing Skill・規範をSkill内に記録します。外部Skillを実行時依存にはせず、misereru用の規則はrepository内で完結させます。

## 初期 source

初期テンプレートでは Markdown を正本 source とします。

- 既定ファイル: `slides.md`
- ページ区切り: `---`
- 外部リンク: 通常の Markdown link
- 各slideはmetadata commentのstable `key` を持つ
- 目次へ載せるセクション見出しは `type: "section"` を付ける
- 正本 `slides.md` には `marp: true` 等のrenderer固有front matterを要求しない

これは初期運用経路の決定です。misereru全体を永久にMarkdown専用へ固定するものではありません。

## Renderer 方針

### 初期 production renderer: Marp

初期版はrendererを1系統に限定します。

```text
slides.md
  ↓ misereru adapter
Marp用の一時入力
  ↓ Marp
  ├─ HTML
  └─ PDF
```

Marp固有front matter / theme指定はbuild時に一時入力へ注入し、利用者が編集する `slides.md` 自体には持ち込みません。初期production buildはMarpだけを呼び出します。

### k1LoW/deck

`deck` はMarkdownからGoogle Slidesを生成・更新するツールで、HTML rendererではありません。

Marpとdeckを同時にproduction targetへ入れると、Marp CSS/themeとGoogle Slides base presentation/layoutの2系統を維持する必要があります。内容sourceを共有できても同一デザインを保証できないため、初期版では採用しません。

Google Slides生成はresearch / prototypeで継続し、共通レイアウトモデルを持てるか、別デザイン系成果物として明示的に許容する仕様を採用した場合に再検討します。

### PPTX

初期版では未対応です。MarpのPPTXを正式採用するとも決めません。

## 出力

### HTML

初期版の必須outputです。

- 常時生成する。
- `slides.md` / config / theme / build処理の変更でGitHub Actionsが自動buildする。
- 公開用HTMLは `dist/site/` に分離する。
- 生成物はActions artifactとして取得可能にする。
- GitHub Pagesはテンプレート作成直後はOFFとする。ただしOFFを恒久的な非公開判断とはみなさず、slides / article のどちらか一つでも初版成立したら他形式の完成を待たず公開へ進む。

### 初回公開の優先順位

初回Pages公開は「全形式が揃ったか」ではなく、**単体で成立する成果物が一つできたか**で判断します。

- slidesが先に成立したらslidesを公開する
- articleが先に成立したらarticleを公開する
- presentation scriptはslides依存のため、それ単独では初回公開トリガーにしない
- 他形式がサンプル／未完成でも、それだけを理由に完成済み成果物のブラウザ閲覧を遅らせない
- 未完成サンプルの同時露出は後で解消する表示上の問題として扱い、完成済み成果物を閲覧不能にする問題より優先度を下げる
- confidential / private-only資料はこの自動的な公開判断の対象外

「初版成立」は最終版ではなく、単体で通読・閲覧でき、テンプレート残骸や既知の重大な誤りがなく、buildが成功する状態を指します。

### GitHub Pages

HTML生成とは別のpublish targetです。

`misereru.config.json` の `publish.githubPages.enabled` を `true` にすると、default branchのbuildでPages deployを行います。

```text
HTML build
  ↓
actions/upload-pages-artifact
  ↓
actions/configure-pages
  ↓
actions/deploy-pages
  ↓
GitHub Pages
```

テンプレート作成直後の既定値は `false` とします。これは安全な開始状態であり、公開しない意思決定ではありません。slides / article のどちらか一つでも初版が成立したら `true` へ切り替えます。

GitHubの制約上、各presentation repositoryでPages自体が未有効の場合、標準の `GITHUB_TOKEN` だけでは `configure-pages` が自動有効化できません。初回だけrepositoryの Settings > Pages でGitHub Actions publishingを有効にする運用を基本とし、自動有効化のためだけに高権限PATを標準要求しません。

### PDF

初期版で任意outputとして扱います。

- `misereru.config.json` で有効化した場合だけ生成する。
- HTMLと同じMarp renderer / themeを使う。

## 設定とフォールバック

`misereru.config.json` がprojectごとのoutput / publish設定を持ちます。

初期方針:

- HTML: 必須・常時生成
- GitHub Pages: optional publish。作成直後はOFF、最初のpublishable artifactが初版成立したらON
- PDF: optional output、既定OFF
- Google Slides: production未対応
- PPTX: production未対応

初期production設定では `outputs` に `html` / `pdf` 以外を指定した場合、build errorにします。未検証rendererへ黙って分岐しません。

## 日常運用

想定する通常操作は次です。

```text
1. template repository から新しい資料 repository を作る
2. rootの slides.md をサンプルとして内容を書き換える
   - 対応Agentでは .agents/skills/misereru-slide-writing/ を編集規範として利用できる
3. 不要なページを削除する
4. commit / pushする
5. Actions が HTML を生成する
6. slides / article のどちらかが初版成立したらPagesを有効化する。PDFは必要な場合だけ有効化する
```
