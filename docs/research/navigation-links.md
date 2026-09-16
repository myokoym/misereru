# Navigation / hyperlink research

最終更新: 2026-09-16

外部ハイパーリンクと、自動生成する目次から各スライドへ移動する内部リンクについての調査・設計メモです。

安定要件は [`../product/requirements.md`](../product/requirements.md) を参照してください。

## 要件

- 外部 URL へのリンクを source で表現できること。
- Google Slides / HTML 等、リンク可能な target では生成後もリンクが機能すること。
- スライド構造から目次を自動生成できること。
- 目次の各項目から対応するスライドへ移動できること。
- スライド追加・削除・並べ替え後も、再生成時に内部リンクが追随すること。
- ページ番号だけではなく、可能なら stable slide identity / key を使うこと。

## Google Slides API

Google Slides の `Link` は次を native に持てます。

- `url`: 外部 Web URL
- `pageObjectId`: presentation 内の特定ページへのリンク
- `slideIndex`: presentation 内のスライド番号へのリンク
- `relativeLink`: NEXT / PREVIOUS / FIRST / LAST 等の相対リンク

今回の目次では `slideIndex` より **`pageObjectId` を優先**します。並べ替えで番号が変わっても、同じページ object ID を指し続けられるためです。

参考:

- Google Slides API `Link`: <https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations.pages/other#Link>

## `k1LoW/deck`

GitHub: <https://github.com/k1LoW/deck>

2026-09-16 時点で確認できたこと:

- Markdown の通常リンク `[text](https://example.com)` をサポートする。
- 実装では Markdown の link を Google Slides `TextStyle.Link.Url` へ反映している。
- したがって **外部リンク要件にはそのまま利用可能**。
- 一方、コード検索では `pageObjectId` / `slideIndex` / `relativeLink` を使った内部スライドリンク処理は確認できなかった。
- v1.24.0 から per-page configuration に `key` が追加され、外部ツールがスライドを安定して参照するための opaque identifier として利用できる。
- `key` は page number / heading / body fragment のように並び替えや文言変更で壊れやすい識別子を避ける目的で導入されている。

したがって `deck` を renderer として採用する場合、次の分担が自然です。

```text
source
  ↓
deck-compatible source
  - page key
  - title
  - external links
  ↓
k1LoW/deck
  ↓
Google Slides
  ↓ misereru post-process
TOC generation
  + key → Google Slides pageObjectId 解決
  + internal link(pageObjectId) 付与
```

`deck` を fork して内部リンク構文を追加するより、まずは post-process adapter で要件を満たせるか確認します。

参考:

- `deck` README: <https://github.com/k1LoW/deck>
- stable `key` 導入 PR: <https://github.com/k1LoW/deck/pull/527>

## 目次生成モデル

source format は未決定なので、Markdown 見出しそのものを製品仕様にはしません。

必要なのは source adapter が各スライドについて最低限次を返せることです。

```text
SlideDescriptor
- id / key      # stable identity
- title         # TOC label
- toc           # include / exclude
- order         # resolved order
```

目次生成器は `SlideDescriptor[]` を受け、renderer 固有の内部リンクへ変換します。

### Google Slides

```text
stable key
  ↓ publish後に解決
pageObjectId
  ↓
Link.pageObjectId
```

### HTML

```text
stable key
  ↓
id="slide-<key>"
  ↓
href="#slide-<key>"
```

この対応にすれば、source format が Markdown / YAML / JSON / 独自形式のどれになっても目次要件を共通化できます。

## 自動生成のタイミング

目次は source に手書きして正本化するより、build 時に生成する方を優先します。

理由:

- ページ追加・削除への追随が自動になる。
- ページ順変更時の更新漏れを避けられる。
- target ごとに内部リンク表現を変えられる。
- source 側には `title` / `key` / `toc:false` 等の意味情報だけを残せる。

## 初期 config 案

```json
{
  "navigation": {
    "externalLinks": true,
    "toc": {
      "enabled": true,
      "position": "after-title",
      "source": "slide-titles",
      "linkTarget": "stable-slide-id"
    }
  }
}
```

これは確定 schema ではありません。現プロトタイプで要件を明示するための仮設定です。

## 現時点の判断

- 外部リンクは renderer / target の native link を利用する。
- Google Slides の目次内部リンクは `pageObjectId` を第一候補にする。
- 目次自体は misereru 側で自動生成する責務とする方向で検証する。
- `k1LoW/deck` の `key` は stable slide identity の有力な既存実装として利用候補にする。
- `deck` 本体の fork はまだ行わない。
- source format を Markdown に固定しない。

## 次の検証

1. 現在の Google Slides プロトタイプへ自動生成相当の目次ページを追加し、`pageObjectId` リンクがスマートフォン上でも機能するか確認する。
2. 同じ deck に外部 URL リンクを追加して動作確認する。
3. `deck` で native Google Slides を生成する最小プロトタイプを作る。
4. `deck` 出力後に stable key と Google Slides pageObjectId を結び付ける方法を決める。
5. HTML target でも同じ stable key から anchor TOC を生成する。
