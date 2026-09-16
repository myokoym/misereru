# Product requirements

最終更新: 2026-09-16

この文書には、調査の途中経過ではなく、現時点で比較的安定しているプロダクト要件だけを置きます。

関連文書:

- 既存ツール調査: [`../research/slide-tools.md`](../research/slide-tools.md)
- 日本語組版調査: [`../research/japanese-typesetting.md`](../research/japanese-typesetting.md)
- source / output 構成調査: [`../research/source-output-architecture.md`](../research/source-output-architecture.md)
- 命名調査: [`../research/naming.md`](../research/naming.md)
- 意思決定記録: [`../adr/`](../adr/)

## 目的

Git で管理しやすいテキスト中心の入力から、スライド / presentation を再生成・公開できる仕組みを想定します。

**Markdown は有力候補ですが必須ではありません。**

単一 Markdown、複数 Markdown、YAML / JSON / TOML 等の構造化データ、独自の軽量フォーマット、複数ファイルからなるプロジェクトテンプレートのいずれも候補に含めます。複数入力形式を扱う構成も許容します。

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
  ├─ Google Slides
  ├─ HTML / GitHub Pages
  ├─ PDF
  └─ PPTX 等
```

## Source / project model

- 正本は **ChatGPT と GitHub から安全に編集できるテキスト中心の構成**にする。
- Markdown 固有機能を製品要件にはしない。
- 1ファイル完結を必須にしない。
- コンテンツ、設定、テーマ、画像等を分けたプロジェクト構成も許容する。
- GitHub の template repository から新規スライドプロジェクトを生成する方式も候補とする。
- 既存ツールで要件を満たせる場合、独自フォーマットや独自レンダラーを先に作らず、そのツールの wrapper / adapter として成立させてよい。
- 複数の source format / renderer を扱う場合も、利用者が通常触る既定経路は簡単に保つ。

想定例であり、確定仕様ではありません。

```text
presentation-project/
├─ presentation.yml      # 共通設定・出力先
├─ slides.md             # 例: Markdown source
├─ assets/
└─ theme/
```

別案として `slides/` 配下に1ページ1ファイルを置く構成や、YAML / JSON からスライドを構成する方式も検討対象です。

## 編集・管理

- PowerPoint や Google Slides 上での手編集を正本管理の必須工程にしない。
- Google Slides 等を成果物・デザインテンプレート・確認画面として利用することは許容する。
- タイトル、テーマ、ページサイズ、ページ番号、出力設定等は可能な限りテキスト側で管理可能にする。
- **日常的な編集・生成に PC、ローカル CLI、ローカル Node.js 環境を必須にしない。**
- スマートフォン + ChatGPT + GitHub を基本の操作経路として成立させたい。
- ビルドや重い生成処理は GitHub Actions 等のリモート環境へ置ける構成を優先する。
- Git 管理しやすいことを重視する。
- 生成物は正本と分離し、原則として再生成可能にする。

## Build / publish

規定位置の source / config / assets が更新された場合に、GitHub Actions 等で自動的に build / publish できる構成を想定します。

```text
source update
  ↓ push / merge
GitHub Actions
  ↓
build
  ↓
publish target
```

出力先は設定可能にする方向です。

候補:

- Google Slides / Google Drive
- GitHub Pages 上の HTML
- Actions artifact
- PDF
- PPTX

単一出力に固定せず、必要なら複数 target を同時に有効化できる構成を許容します。

ただし初期版は、設定なしでも動く簡単な既定 target を1つ持たせてよいです。何を既定にするかは未決定です。

Google Slides を target にする場合は、次の方式を比較します。

1. Google Slides API へ直接 native 要素を生成・更新する。
2. PPTX 等を生成し、Google Drive API で Google Slides へ変換する。
3. `k1LoW/deck` 等、Google Slides を直接 target にする既存ツールを利用する。

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

少なくとも以下を扱いたいです。

- 行頭禁則
- 行末禁則
- 句読点・括弧の扱い
- 英数字と日本語が混在する場合の折返し
- 欧文単語の不自然な途中分割を避ける
- 見出しの不自然な分割を避ける
- 約物の間隔
- 行長・行分割の自然さ
- overflow 時の扱い

参考:

- W3C JLREQ: <https://www.w3.org/International/jlreq/?lang=ja>

## 未決事項

- 正本となる source format を何にするか。
- 単一ファイル型と project template 型のどちらを既定にするか。
- 複数 source format を最初から対応するか。
- 共通の中間 presentation model / AST を持つか、renderer wrapper を直接使うか。
- Marp を renderer の一つとして採用するか。
- `k1LoW/deck` 等を Google Slides renderer として採用するか。
- Vivliostyle を内部レンダリングに利用するか。
- Google Slides / HTML Pages / PDF / PPTX のどれを既定 target にするか。
- Google Slides 出力を native 要素中心にするか、見た目優先の画像 / PPTX 変換にするか。
- Google API 認証を repository secret / GitHub OIDC / その他のどの方式で扱うか。
- 目次生成時の slide identity を source format ごとにどう持つか。
- 目次を表紙直後に固定するか、設定可能にするか。
- Mermaid を標準対応するか。
- 共通テーマをどこまで source から分離するか。
- AI をレンダリング工程へ入れるか、source 編集側の ChatGPT に限定するか。

## 仮称

現在の仮称は **misereru** です。正式名称は未確定です。

名称の調査経緯は [`../research/naming.md`](../research/naming.md) に隔離し、名称決定後は通常の技術検討から切り離します。
