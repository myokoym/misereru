# Initial operation model

最終更新: 2026-09-17

misereru の初期運用で利用者が通常触る経路を定義します。

## 基本モデル

1つのスライド資料を、原則1つの GitHub repository として管理します。

```text
misereru template repository
  ↓ Use this template
presentation repository
  ├─ slides.md
  ├─ misereru.config.json
  ├─ assets/
  ├─ themes/
  └─ GitHub Actions
```

通常の編集では `slides.md` を更新します。必要な場合だけ `misereru.config.json` や assets / theme を変更します。

```text
slides.md を編集
  ↓ push / merge
GitHub Actions
  ↓
HTML を必ず生成
  ├─ PDF              設定時のみ
  ├─ Google Slides    設定時のみ（実経路検証後に有効化）
  └─ PPTX             初期版では未接続
```

## 初期 source

初期テンプレートでは Markdown を正本 source とします。

- 既定ファイル: `slides.md`
- ページ区切り: `---`
- 外部リンク: 通常の Markdown link
- stable slide identity が必要なページは page config comment の `key` を利用可能

これは初期運用経路の決定です。misereru 全体を永久に Markdown 専用へ固定するものではありません。

## 出力

### HTML

初期版の必須 output です。

- 設定なしでも生成できる既定 target とする。
- `slides.md` / config / theme の変更で GitHub Actions が自動 build する。
- 生成物はまず Actions artifact として扱う。
- GitHub Pages 公開は明示的に有効化するまで行わない。

### PDF

初期版で任意 output として扱います。

- `misereru.config.json` で有効化した場合だけ生成する。
- HTML と同じ source から再生成する。

### Google Slides

任意 output として設計しますが、初期テンプレートの自動 target へ昇格するのは `source -> deck apply -> real Google Slides -> navigation post-process -> readback verification` が通ってからとします。

- 認証なしの場合は Google Slides を生成しない。
- `enabled:false` は正常な無効状態。
- `enabled:true` なのに認証・template・実装条件が不足する場合は、別形式へ黙ってフォールバックせず build error にする。
- デザイン template が未指定の場合は、将来の `misereru-default` を利用する。
- Google Slides / deck の素のレイアウトへ品質を落としてフォールバックしない。

### PPTX

候補として残しますが、初期版では未接続です。

## 設定とフォールバック

`misereru.config.json` が project ごとの output 設定を持ちます。

初期方針:

- HTML: 必須・常時生成
- PDF: optional
- Google Slides: optional
- PPTX: optional / 未接続
- GitHub Pages: explicit opt-in

未接続 target を `enabled:true` にした場合は成功扱いでスキップしません。設定と実際の生成結果が食い違わないことを優先します。

## 日常運用

想定する通常操作は次だけです。

```text
1. template repository から新しい資料 repository を作る
2. slides.md を ChatGPT / GitHub で編集する
3. commit / push
4. Actions が HTML 等を生成する
5. 必要な target だけ config で追加する
```

ローカル PC、PowerPoint、Node.js CLI を日常操作の必須工程にしません。
