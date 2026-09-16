# Product requirements

最終更新: 2026-09-16

この文書には、調査の途中経過ではなく、現時点で比較的安定しているプロダクト要件だけを置きます。

関連文書:

- 既存ツール調査: [`../research/slide-tools.md`](../research/slide-tools.md)
- 日本語組版調査: [`../research/japanese-typesetting.md`](../research/japanese-typesetting.md)
- 命名調査: [`../research/naming.md`](../research/naming.md)
- 意思決定記録: [`../adr/`](../adr/)

## 目的

Markdown を唯一の正本として、スライドを生成・レンダリングするツールを想定します。

単なる Markdown ビューワーではありません。

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

意味上の二本柱は次の通りです。

1. **Slide / presentation** — テキストをスライドにする。
2. **Rendering** — テキストをレイアウトし、見える形へ描画する。

## 編集・管理

- 編集は Markdown のみで完結させたい。
- タイトル、テーマ、ページサイズ、ページ番号、出力設定などのメタ情報もテキスト管理する。
- PowerPoint や Google Slides 上での手編集を前提にしない。
- 生成物と正本を分離する。

```text
Markdown = source
HTML / PDF / PPTX = build artifact
```

- **日常的な編集・生成に PC、ローカル CLI、ローカル Node.js 環境を必須にしない。**
- スマートフォン + ChatGPT + GitHub を基本の操作経路として成立させたい。
- ビルドや重い生成処理は GitHub Actions 等のリモート環境へ置ける構成を優先する。
- ChatGPT から扱う主要な編集対象は Markdown とし、複雑なローカル開発環境の操作を前提にしない。
- Git 管理しやすいことを重視する。
- 生成物は再生成可能な artifact として扱う。

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

- Marp をそのまま採用するか。
- Marp fork / wrapper 程度にするか。
- レンダラーを自作するか。
- Vivliostyle を内部レンダリングに利用するか。
- HTML / PDF / PPTX のどこまでを初期対応するか。
- Mermaid を標準対応するか。
- 外部 CSS を許すか、Markdown 1 ファイル完結を強制するか。
- 共通テーマをどこまで分離するか。
- Markdown を完全に Marp 互換にするか、独自 front matter / directive を持つか。
- Marp の上位互換を目指すか、別設計にするか。
- AI はレンダリング時には使わず、Markdown 編集側の ChatGPT に限定するか。

## 仮称

現在の仮称は **misereru** です。正式名称は未確定です。

名称の調査経緯は [`../research/naming.md`](../research/naming.md) に隔離し、名称決定後は通常の技術検討から切り離します。
