# Add an optional standalone article source and rendered HTML output

- Status: Accepted
- Date: 2026-09-18

## Context and Problem Statement

misereru では、`slides.md` を視覚的なpresentationの正本、`presentation-script.md` をスライドを見ながら話すための任意原稿として扱っています。

ただし、どちらも「文章だけで読み進める文書」とは目的が異なります。スライドは情報をページへ分割し、発表原稿は画面上の内容を参照しながら補足できます。そのままブログ記事や解説記事として利用すると、ページ分割や「この表」「次のスライド」といったpresentation依存が残りやすくなります。

スライドを見ない読者にも、前提、論点、根拠、留保、結論が文章だけで伝わる形式を追加する必要があります。

## Considered Options

- `slides.md` をそのまま通常Markdownとして公開する。
- `presentation-script.md` を記事形式へ自動変換する。
- `slides.md` と `presentation-script.md` からbuild時に記事本文を自動生成する。
- 独立した任意source `article.md` を持ち、公開時だけ `article.html` へrenderする。

## Decision Outcome

misereru に任意の `article.md` を追加します。

`article.md` はスライドや発表原稿の派生ファイルではなく、**文章だけで内容が完結する独立したcanonical source** とします。

役割分担:

- `slides.md`: 視覚的に見せるpresentation source
- `presentation-script.md`: スライドを見ながら話すためのoptional narration source
- `article.md`: スライドを見なくても単体で読めるoptional article source

articleではslideとの1対1対応やstable key対応を要求しません。説明順、章立て、接続は記事として再構成できます。一方、主要な事実、数値、条件、留保はslides / research等と矛盾させません。

GitHub Pages公開は他の公開設定と同様にexplicit opt-inとします。

```json
{
  "publish": {
    "githubPages": {
      "enabled": true,
      "article": {
        "enabled": true
      }
    }
  }
}
```

公開時はraw `article.md` をそのまま配布せず、読み物向けの `article.html` をPagesルートへ生成します。

初期rendererは Markdown parser として `marked` を利用します。`article.md` はテキスト中心sourceとして扱うためraw HTMLを禁止し、危険なURL schemeもbuild errorにします。H1は記事タイトルとして1つだけ要求します。

## Consequences

- 同じ調査・資料について、presentation、speaker narration、standalone articleを用途別に分けて管理できます。
- articleはスライド順やページ境界に拘束されず、読み物として自然な説明順へ再構成できます。
- presentation scriptからの機械的変換ではないため、「この表」「次のスライド」等の画面依存を記事へ持ち込みにくくなります。
- articleは別sourceになるため、slides / researchとのsemantic cross reviewが必要です。
- articleを使わない資料では `article.md` 自体を不要とし、通常buildや公開の必須条件にはしません。
- article公開はGitHub Pages公開とは別の明示設定とし、資料作成のついでに勝手に公開範囲を広げません。
