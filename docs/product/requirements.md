# Product requirements

最終更新: 2026-09-19

この文書には、調査の途中経過ではなく、現時点で比較的安定しているプロダクト要件だけを置きます。

関連文書:

- 初期運用モデル: [`operation-model.md`](operation-model.md)
- 既存ツール調査: [`../research/slide-tools.md`](../research/slide-tools.md)
- 日本語組版調査: [`../research/japanese-typesetting.md`](../research/japanese-typesetting.md)
- source / output 構成調査: [`../research/source-output-architecture.md`](../research/source-output-architecture.md)
- 発表原稿 / 相互レビュー調査: [`../research/presentation-script.md`](../research/presentation-script.md)
- 命名調査: [`../research/naming.md`](../research/naming.md)
- 意思決定記録: [`../adr/`](../adr/)

## 目的

Git で管理しやすいテキスト中心の入力から、スライド / presentation を再生成・公開できる仕組みを想定します。

価値の中心は特定の記法ではなく、次の流れを簡単かつ再現可能にすることです。

```text
text / project source
  ↓ 解釈・変換
情報構造・見出し・本文・画像・図・設定を認識
  ↓
slide / presentation
  ↓
日本語として自然に組版・改行
  ↓
publish / render
```

## 初期運用経路

初期版では misereru repository を GitHub Template Repository として利用し、原則 **1資料 = 1 repository** とします。

```text
misereru template repository
  ↓
presentation repository
  ├─ slides.md
  ├─ presentation-script.md                    # optional。不要なら削除可
  ├─ misereru.config.json
  ├─ .agents/skills/misereru-slide-writing/SKILL.md
  ├─ .agents/skills/misereru-presentation-script/SKILL.md
  ├─ assets/
  ├─ themes/
  └─ GitHub Actions
```

初期 template の必須の正本 source は Markdown (`slides.md`) とします。`presentation-script.md` は発表原稿を管理したい資料だけで利用する任意sourceです。

通常操作:

```text
slides.md を編集
  ↓ push / merge
GitHub Actions
  ↓
Mermaid block → PNG（存在する場合）
  ↓
Marp
  ├─ HTML             常時生成
  │   └─ GitHub Pages 初版成立後に公開
  └─ PDF              設定時のみ
```

`presentation-script.md` が存在する場合は同じbuild内で構造整合性を検査しますが、原稿ファイルの作成自体は通常buildの前提にしません。

Google Slides / PPTX は初期production targetには含めません。renderer とデザインの一貫性を維持できる方式が検証できるまで research / prototype 扱いとします。

この初期運用判断は、misereru 全体を将来にわたり Markdown 専用へ固定するものではありません。必要になれば source adapter を追加できる構成を維持します。

## Source / project model

- 正本は **ChatGPT と GitHub から安全に編集できるテキスト中心の構成**にする。
- 初期 template では `slides.md` を必須の正本 source とする。
- `presentation-script.md` は任意とし、slides-only運用を標準で許容する。
- `presentation-script.md` が存在する場合も、全slide分の原稿を通常運用で強制しない。partial scriptを正当な状態として扱う。
- 正本 `slides.md` には renderer 固有 front matter を必須にしない。
- 1ファイル完結を永続的な製品制約にはしない。
- コンテンツ、設定、テーマ、画像等を分けたプロジェクト構成を許容する。
- 初期運用では GitHub Template Repository から新規スライドプロジェクトを生成する。
- AI編集支援の規則は `.agents/skills/` にrepository-scoped Skillとして同梱できる。
- Skillは編集支援であり、build時の実行依存にはしない。
- 既存ツールで要件を満たせる場合、独自フォーマットや独自レンダラーを先に作らず、そのツールの wrapper / adapter として成立させてよい。
- 複数の source format / renderer を将来扱う場合も、利用者が通常触る既定経路は簡単に保つ。
- misereru本体の `main` / `develop` branch modelを、派生資料repositoryへ自動継承しない。
- 派生repositoryに固有のbranch方針がない場合、default branchを正本として扱う。
- 「調査中」「草稿」「未公開」という状態だけを理由に追加branchを作らない。
- 調査型repositoryでは、調査履歴をrepositoryの成果物として扱い、`research.md`、source ledger、中間仮説、更新履歴をdefault branchへ蓄積できる。
- 履歴保持はGit commit historyと調査正本で行い、branch分離を履歴保存の代替にしない。
- branchを新設する場合は、default branchから隔離すべき具体的な並行作業・実験・再構成等の理由を要求する。

初期 template の構成:

```text
presentation-project/
├─ slides.md
├─ presentation-script.md                     # optional sample
├─ misereru.config.json
├─ mermaid.config.json                         # 図の可読性・既定theme
├─ .agents/
│  └─ skills/
│     ├─ misereru-slide-writing/
│     │  └─ SKILL.md
│     └─ misereru-presentation-script/
│        └─ SKILL.md
├─ assets/
├─ themes/
└─ .github/workflows/
```

## 編集・管理

- PowerPoint や Google Slides 上での手編集を正本管理の必須工程にしない。
- タイトル、テーマ、ページサイズ、ページ番号、出力設定等は可能な限りテキスト側で管理可能にする。
- **日常的な編集・生成に PC、ローカル CLI、ローカル Node.js 環境を必須にしない。**
- スマートフォン + ChatGPT + GitHub を基本の操作経路として成立させる。
- ビルドや重い生成処理は GitHub Actions 等のリモート環境へ置く。
- Git 管理しやすいことを重視する。
- 生成物は正本と分離し、原則として再生成可能にする。

### AI編集支援

初期templateでは次のrepository-scoped Skillを同梱します。

- `.agents/skills/misereru-slide-writing/SKILL.md`
- `.agents/skills/misereru-presentation-script/SKILL.md`

`misereru-slide-writing` に求める要件:

- `slides.md` の新規作成、再構成、推敲で利用できる。
- Presented / Reference / Mixed の用途を区別し、ライブ発表用の低密度ルールを調査・共有資料へ機械的に適用しない。
- 1 slide 1 primary messageを基本とするが、正確さに必要な根拠、条件、留保、比較は削らない。
- 調査報告や仕様資料へstory、対立、強い断定を人工的に追加しない。
- 事実、出典に基づく解釈、提案、仮説、未確認事項を区別する。
- 見出しは空のラベルを避け、対象、問い、観察、結論などslideの役割が分かる形を優先する。
- 箇条書き、本文、表を内容の構造に応じて使い分け、文章を短くするだけの目的で箇条書きへ変換しない。
- 日本語の論証の厳密さ、用語の一貫性、冗長性、AI的な空疎表現を点検する。
- 和文中の英数字前後への半角スペース等、特定の文体規則を一律に強制せず、既存資料と日本語としての自然さを優先する。
- stable `key` を保持し、新規slideには安定した `key` を付ける。
- `type: "section"` 等のmisereru metadataを保持する。
- renderer固有front matterやHTML/CSSを内容編集の都合だけで正本へ持ち込まない。
- publish/output設定を内容編集のついでに変更しない。
- 外部情報に依存する主張は、可能な限り後から検証できるリンク・出典を保持する。
- 図をslide内へ収めるためだけに文字を縮小しない。文言削減、構造簡略化、図またはslideの分割を先に行う。
- 図のノード形状、強調、線、余白、方向は情報上の役割を持たせ、同格でない要素を同じ見た目へ潰さない。
- 図はsourceだけで判断せず、実際のrender結果で文字サイズ・コントラスト・overflow・スマートフォンでの可読性を確認する。
- 既存の高品質なpresentation / Marp / Japanese technical writing Skill・規範を参照した場合、Skill内に参照元を記録する。

`misereru-presentation-script` に求める要件:

- 原稿を求められていないslides-only編集で、`presentation-script.md` の新規作成を強制しない。
- `slides.md` のstable `key`とscript entryをページ番号ではなくkeyで対応付ける。
- partial scriptを許容し、通常編集で全slide coverageを要求しない。
- narrationをslide本文の逐語読み上げにせず、自然な口頭説明として整える。
- narrationだけに重要な事実・条件・結論を追加しない。
- slides → script / script → slides の両方向から意味的な矛盾・欠落・不自然な順序をレビューする。
- 問題がslide構成側にある場合は、原稿だけを合わせずslide側も修正候補へ戻す。
- complete scriptを明示的に求める場合だけ、全slide coverageを要求する。
- 音声合成・録画・動画等の派生用途を理由に、timingやcueを通常の発表原稿へ必須化しない。

Skillを解釈しない環境でもbuild・閲覧できることを維持します。AI編集支援は初期版ではsource編集側の補助であり、rendererの必須工程へは入れません。

## Presentation script validation

`presentation-script.md` は任意です。CI / buildは次の段階で扱います。

### 通常build

`npm run build:project` と通常のGitHub Actionsでは:

- `presentation-script.md` が存在しない場合、検査をスキップし、warningも出さない。
- 存在する場合、書かれているentryだけを検査する。
- scriptの`slide`参照重複、存在しないslide key参照、空の`Narration`、未対応format version等の構造破損はbuild errorにする。
- source slideにscript entryがないことはerror / warningにしない。
- generated TOCにscript entryがないことも通常buildではerror / warningにしない。
- script entryの記載順をslide順と一致させることを必須にしない。presentation sequenceはslide source側を正とする。

### complete script build

全slide分の原稿が揃っていることを明示的に確認したい場合だけ、次を使います。

```bash
npm run build:script-complete
```

この場合は通常の構造検査に加え、build後の最終presentationに含まれる全slideへscript entryがあることを要求します。自動生成される `__misereru_toc__` も、存在する場合はcoverage対象です。

complete scriptは通常資料の完成条件ではありません。

意味的な整合性や原稿品質はCIのAI判定へ依存させず、Agent Skillによるsemantic cross reviewで扱います。

## Build / publish

規定位置の source / config / assets が更新された場合に、GitHub Actions で自動 build できる構成とします。`presentation-script.md` のみを更新した場合も構造検査が走るよう、workflowのpaths対象に含めます。

初期 output 方針:

- **HTML: 必須・既定。Marpで常時生成。**
- PDF: optional。同じMarp renderer / themeで生成。
- GitHub Pages: HTML生成とは分離したpublish target。template作成直後はOFFだが、slides / article のどちらか一つでも初版成立したら、他形式の完成を待たずONへ移行する。
- Actions artifact: HTML等の生成物を常に取得可能にする。
- 初回Pages公開の成立条件は「全形式完成」ではなく「単体で成立するpublishable artifactが1つ以上あること」とする。
- articleが最初の成立成果物である場合、未完成のsample slidesが一時的に同時公開されることだけを理由にarticle公開を遅らせない。
- confidential / private-only指定、credentials、個人情報、社外秘情報等がある場合は上記自動判断より非公開条件を優先する。
- Google Slides: production未対応。
- PPTX: production未対応。

初期production設定で未対応outputを指定した場合は build error にします。未検証rendererへ黙って分岐しません。

## Renderer consistency

初期production buildでは renderer を Marp 1系統に限定します。Mermaid図は正本sourceのfenced blockとして保持し、build時にPNGへ変換して一時Marp入力へ埋め込みます。

```text
slides.md
  ↓ misereru adapter
Mermaid → PNG / 一時Marp入力
  ↓ Marp
  ├─ HTML
  └─ PDF
```

Marp固有front matter / theme指定はbuild時に一時入力へ付加し、正本sourceには混在させません。

`k1LoW/deck` は Markdown から Google Slides を生成・更新するツールであり、HTML rendererではありません。Marpとdeckをproductionで併用すると、Marp theme/CSS と Google Slides base presentation/layout の二重メンテナンスが必要になります。内容sourceを共有できても見た目の同一性は保証できないため、初期版ではこの構成を採用しません。

Google Slidesを将来production targetへ追加する場合は、次のどちらかを先に決定します。

- 共通レイアウトモデルを導入し、複数rendererへ一貫したデザインを適用する。
- Google Slidesを別デザイン系の成果物として明示的に許容する。

## Navigation / links

スライドを単なる静止画ではなく、閲覧中に移動・参照できる成果物として扱います。

### ハイパーリンク

- source から外部 URL へのリンクを表現できること。
- HTML等、リンクを扱えるtargetでは生成後もリンクが機能すること。
- renderer / publish adapter の都合でリンク情報を失わないこと。

### 目次

- スライド構造から **目次を自動生成**できること。
- 目次項目から対応する各スライドへ直接移動できること。
- スライドの追加・削除・並べ替え後も、再生成時に目次と内部リンクが追随すること。
- 内部リンクをページ番号の文字列だけに依存させず、可能な限り安定した slide identity / key を利用すること。
- 目次へ載せるタイトル・除外指定・目次自体の配置位置などは、source または project config から制御できる方向とする。

## 図解・視覚的可読性

Mermaidは初期productionで標準対応します。正本は `slides.md` 内のMermaid sourceであり、生成済みPNGは正本として管理しません。

図解は「描画できる」「overflowしない」だけでは合格としません。本文と同様に、スライドとして短時間で構造を把握できる可読性を要求します。

- 図を枠内へ収める目的で、rendererが文字サイズを自動的・機械的に縮小しない。
- 図が重い場合は **文言を削る → 構造を簡略化する → 図またはslideを分割する** の順で対処し、文字縮小を解決策にしない。
- ノード本文とedge labelは、投影・通常画面・スマートフォン表示で読める大きさを維持する。
- ノードの形状、強調、線、方向、余白は情報構造を補助するために使い、意味の異なる要素を理由なく同じ見た目へ揃えない。
- 配色は装飾目的ではなく、主工程・補助要素・入力・出力などの区別とコントラスト確保に使う。
- source上のMermaidが正しいだけで完了とせず、HTML等の実render結果で文字サイズ、コントラスト、線の視認性、余白、overflowを確認する。
- 図を簡略化すると条件・留保・意味が失われる場合は、無理に図へ押し込まず本文・表・複数slideへ分ける。

実装上の共通既定値は `mermaid.config.json` で管理します。現行既定のノード文字サイズは28pxとし、個別図を収めるための自動縮小は行いません。既定値を変更する場合は、実renderで可読性を再検証します。

## 日本語組版

日本語の品質は重要要件です。単に文字が枠内に収まるだけでは不足です。

少なくとも以下を扱います。

- 行頭禁則
- 行末禁則
- 句読点・括弧の扱い
- 英数字と日本語が混在する場合の折返し
- 欧文単語の不自然な途中分割を避ける
- 見出しの不自然な分割を避ける
- 約物の間隔
- 行長・行分割の自然さ
- overflow 時の扱い

また、通常本文ページについて次の可読性を検証対象に含めます。

- 過剰な余白を避ける。
- スマートフォン表示でも本文が小さすぎないこと。
- 日本語資料として適切なフォントを利用すること。
- 行間が狭すぎないこと。
- 見出しページだけでなく、本文・箇条書き・複数段落・リンクを含む通常ページを評価すること。

文章内容の日本語品質はAgent Skill側でも扱いますが、改行・禁則・overflow等の表示品質はrenderer/theme/build側の責務として分離します。

参考:

- W3C JLREQ: <https://www.w3.org/International/jlreq/?lang=ja>

## 未決事項

- Markdown 以外の source adapter をいつ追加するか。
- 1ページ1ファイル等の複数Markdown構成を追加するか。
- 共通の中間 presentation model / AST を持つか、renderer wrapper を直接使うか。
- Marp を初期版以降も正式rendererとして継続するか。
- Google Slidesを同一デザインtargetとして扱うか、別デザインtargetとして扱うか。
- Google Slides対応時に `k1LoW/deck` を採用するか。
- Vivliostyle を内部レンダリングに利用するか。
- 目次を表紙直後に固定するか、設定可能にするか。
- presentation scriptに将来、pronunciation / pause / cue等の追加仕様が必要になるか。
- 音声合成・録画・動画等の派生出力をmisereru側で扱うか。
- AI を将来renderer / 自動レイアウト工程へ入れるか。初期版のAI支援はsource編集側に限定する。
- template repository更新を既存の各資料repositoryへどう反映するか。

## 仮称

現在の仮称は **misereru** です。正式名称は未確定です。
