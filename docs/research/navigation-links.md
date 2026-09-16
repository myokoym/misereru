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

## Google Slides 実装検証

2026-09-16 の確認用 Google Slides deck に、表紙直後の目次ページを追加しました。

実装内容:

- 既存14スライドを目次へ列挙。
- 各目次項目の `TextStyle.Link.pageObjectId` に対応スライドの object ID を設定。
- 参考リンク `W3C JLREQ` に `TextStyle.Link.url` を設定。
- Google Slides API で再取得し、14件すべての内部 `pageObjectId` と外部 `url` が native link として保持されていることを確認。

この結果から、Google Slides target では **外部リンク + 自動目次 + 内部スライドリンク**を画像化せず native link として実現できます。

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

## CI/CD 認証

`deck` の公式手順では CI/CD に service account を利用できます。

- Google Slides API / Drive API scope が必要。
- service account は通常の My Drive quota を持たないため、公式手順では Shared Drive を使用する。
- GitHub Actions では Workload Identity Federation が推奨されている。
- `DECK_ENABLE_ADC=1` で Application Default Credentials を利用できる。

このため、renderer / post-process の技術検証と Google Cloud 認証設定は分離します。認証不要で生成・検証できる中間 artifact を先にCIへ入れます。

参考:

- <https://github.com/k1LoW/deck/blob/main/docs/setup-service-account.md>

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

## `deck` adapter prototype

`prototype/deck/content.json` を renderer-neutral な仮 source とし、次をCIで生成するプロトタイプを追加しました。

```text
prototype/deck/content.json
  ↓ scripts/generate-deck-prototype.mjs

dist/deck/slides.md
  - deck-compatible Markdown
  - stable page key
  - external Markdown link

dist/deck/slide-manifest.json
  - key
  - title
  - toc include / exclude
  - resolved order
```

さらに `scripts/build-google-slides-navigation.mjs` が、manifest と Google Slides の slide object ID 一覧から次を生成します。

```text
dist/deck/navigation-requests.json
  - TOC slide create request
  - TOC text create request
  - key → pageObjectId mapping
  - each TOC item → Link.pageObjectId requests
```

現CIでは Google 認証を必要としない mock presentation を使い、post-process request の生成まで検証します。実運用では `deck apply` 後に Slides API から現在の object ID 一覧を取得して同じ処理へ渡します。

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
- 目次自体は misereru 側で build / post-process 時に自動生成する方向で進める。
- `k1LoW/deck` の `key` は stable slide identity の有力な既存実装として利用候補にする。
- `deck` 本体の fork はまだ行わない。
- source format を Markdown に固定しない。

## 次の検証

1. CI で deck-compatible source / manifest / navigation request の生成が通ることを確認する。
2. Google Cloud 認証方式を選び、`deck apply` を GitHub Actions から実行する。
3. 実 `deck` 出力後の Slides object ID と manifest の対応を検証する。
4. HTML target でも同じ stable key から anchor TOC を生成する。
5. スライド追加・削除・並べ替え後に目次リンクが自動追随する回帰テストを追加する。
