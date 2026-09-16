# Product requirements

最終更新: 2026-09-17

この文書には、調査の途中経過ではなく、現時点で比較的安定しているプロダクト要件だけを置きます。

関連文書:

- 初期運用モデル: [`operation-model.md`](operation-model.md)
- 既存ツール調査: [`../research/slide-tools.md`](../research/slide-tools.md)
- 日本語組版調査: [`../research/japanese-typesetting.md`](../research/japanese-typesetting.md)
- source / output 構成調査: [`../research/source-output-architecture.md`](../research/source-output-architecture.md)
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
  ├─ HTML
  ├─ Google Slides
  ├─ PDF
  └─ PPTX 等
```

## 初期運用経路

初期版では misereru repository を GitHub Template Repository として利用し、原則 **1資料 = 1 repository** とします。

```text
misereru template repository
  ↓
presentation repository
  ├─ slides.md
  ├─ misereru.config.json
  ├─ assets/
  ├─ themes/
  └─ GitHub Actions
```

初期 template の正本 source は Markdown (`slides.md`) とします。

通常操作:

```text
slides.md を編集
  ↓ push / merge
GitHub Actions
  ↓
HTML を自動生成
  ├─ PDF              設定時のみ
  ├─ Google Slides    設定時のみ
  └─ PPTX             初期版では未接続
```

この初期運用判断は、misereru 全体を将来にわたり Markdown 専用へ固定するものではありません。必要になれば source adapter を追加できる構成を維持します。

## Source / project model

- 正本は **ChatGPT と GitHub から安全に編集できるテキスト中心の構成**にする。
- 初期 template では `slides.md` を正本 source とする。
- 1ファイル完結を永続的な製品制約にはしない。
- コンテンツ、設定、テーマ、画像等を分けたプロジェクト構成を許容する。
- 初期運用では GitHub Template Repository から新規スライドプロジェクトを生成する。
- 既存ツールで要件を満たせる場合、独自フォーマットや独自レンダラーを先に作らず、そのツールの wrapper / adapter として成立させてよい。
- 複数の source format / renderer を将来扱う場合も、利用者が通常触る既定経路は簡単に保つ。

初期 template の構成:

```text
presentation-project/
├─ slides.md
├─ misereru.config.json
├─ assets/
├─ themes/
└─ .github/workflows/
```

## 編集・管理

- PowerPoint や Google Slides 上での手編集を正本管理の必須工程にしない。
- Google Slides 等を成果物・デザインテンプレート・確認画面として利用することは許容する。
- タイトル、テーマ、ページサイズ、ページ番号、出力設定等は可能な限りテキスト側で管理可能にする。
- **日常的な編集・生成に PC、ローカル CLI、ローカル Node.js 環境を必須にしない。**
- スマートフォン + ChatGPT + GitHub を基本の操作経路として成立させる。
- ビルドや重い生成処理は GitHub Actions 等のリモート環境へ置く。
- Git 管理しやすいことを重視する。
- 生成物は正本と分離し、原則として再生成可能にする。

## Build / publish

規定位置の source / config / assets が更新された場合に、GitHub Actions で自動 build できる構成とします。

```text
source update
  ↓ push / merge
GitHub Actions
  ↓
build
  ↓
configured outputs
```

初期 output 方針:

- **HTML: 必須・既定。設定なしでも生成できる。**
- PDF: optional。設定した場合のみ生成。
- Google Slides: optional。認証・template・renderer経路の条件が揃った場合のみ生成。
- PPTX: 候補として残すが初期版では未接続。
- GitHub Pages: explicit opt-in。明示的に有効化するまで公開しない。
- Actions artifact: 初期確認経路として利用可能。

複数 target を同時に有効化できる構成を許容します。

未接続 target を `enabled:true` にした場合は、成功扱いで黙ってスキップしません。設定と実際の生成結果が食い違う場合は build error とします。

### Google Slides target

Google Slides を target にする場合は native Google Slides を優先し、次の経路を検証しています。

```text
slides source
  ↓ adapter
k1LoW/deck compatible source
  ↓ deck apply
native Google Slides
  ↓ misereru post-process
TOC / internal links
  ↓ readback
link / structure verification
```

Google Slidesのデザインは `deck` やGoogle Slidesの素の既定値へ品質を落としてフォールバックさせません。

- project固有template指定があればそれを使う。
- 指定がなければ `misereru-default` template を使う方向とする。
- templateが解決できない場合はエラーにする。
- Google Slidesが無効または未設定の場合は、HTML等の他targetは正常に生成する。
- Google Slidesを明示的に有効化したのに認証等が不足する場合はエラーにする。

## Navigation / links

スライドを単なる静止画ではなく、閲覧中に移動・参照できる成果物として扱います。

### ハイパーリンク

- source から外部 URL へのリンクを表現できること。
- Google Slides / HTML 等、リンクを扱える target では、生成後もリンクを実際にクリックして外部サイトへ移動できること。
- renderer / publish adapter の都合でリンク情報を失わないこと。
- PNG 等、形式自体がリンクを保持できない target は例外とするが、同じ project からリンク保持可能な target を生成できること。

### 目次

- スライド構造から **目次を自動生成**できること。
- 目次項目から対応する各スライドへ直接移動できること。
- スライドの追加・削除・並べ替え後も、再生成時に目次と内部リンクが追随すること。
- 内部リンクをページ番号の文字列だけに依存させず、可能な限り安定した slide identity / key を利用すること。
- 目次へ載せるタイトル・除外指定・目次自体の配置位置などは、source または project config から制御できる方向とする。

Google Slides では外部 URL と presentation 内の特定スライドへのリンクを native link として保持することを優先します。HTML では通常の URL / anchor navigation として同等の操作を提供します。

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

参考:

- W3C JLREQ: <https://www.w3.org/International/jlreq/?lang=ja>

## 未決事項

- Markdown 以外の source adapter をいつ追加するか。
- 1ページ1ファイル等の複数Markdown構成を追加するか。
- 共通の中間 presentation model / AST を持つか、renderer wrapper を直接使うか。
- Marp を HTML / PDF renderer として正式採用するか。
- `k1LoW/deck` を Google Slides renderer として正式採用するか。
- Vivliostyle を内部レンダリングに利用するか。
- Google Slides認証を個人My Drive向けOAuth、Shared Drive + Workload Identity Federation等のどの方式で標準化するか。
- `misereru-default` Google Slides template の具体的なデザイン。
- Google Slidesで stable key と pageObjectId を追加・削除・並べ替え後も確実に対応させる方法。
- 目次を表紙直後に固定するか、設定可能にするか。
- Mermaid を標準対応するか。
- 共通テーマをどこまで source から分離するか。
- AI をレンダリング工程へ入れるか、source 編集側の ChatGPT に限定するか。
- template repository更新を既存の各資料repositoryへどう反映するか。

## 仮称

現在の仮称は **misereru** です。正式名称は未確定です。

名称の調査経緯は [`../research/naming.md`](../research/naming.md) に隔離し、名称決定後は通常の技術検討から切り離します。
