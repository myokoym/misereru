<!-- {"key":"title"} -->
# misereru Marp評価用デッキ

Markdownから生成したHTMLの実表示を、複数のページパターンで確認します。

---

<!-- {"key":"section","type":"section"} -->
# 1. 標準ページ

本文・箇条書き・長文・表・引用・コード・リンクを同じMarp経路で確認します。

---

<!-- {"key":"body"} -->
# 通常の本文ページ

misereruでは、資料の正本をMarkdownとしてGitで管理し、GitHub Actions上でMarpへ渡してHTMLを生成します。

本文が1〜2段落ある一般的な説明ページで、文字サイズ・行間・余白・見出しとの距離を確認します。

---

<!-- {"key":"long-body"} -->
# 長めの日本語本文

日本語のプレゼンテーションでは、単に文字が枠内へ収まれば十分ではありません。句読点や括弧が行頭・行末で不自然にならないこと、英数字と日本語が混在したときに折り返しが崩れないこと、行長が長くなりすぎず読み進めやすいことを確認する必要があります。

さらに、スマートフォンで閲覧した場合でも本文が小さくなりすぎず、段落間隔と行間に十分な余裕があることを確認します。これは見出しだけのページでは評価できないため、実際に複数行の文章を置いて確認します。

---

<!-- {"key":"bullets"} -->
# 箇条書き

- Markdownを正本として管理する
- pushするとGitHub Actionsが自動buildする
- HTMLを既定outputとして生成する
- GitHub Pagesは設定した場合だけ公開する
- PDFは必要な資料だけ追加生成する
- ローカルPCを通常運用の必須工程にしない

---

<!-- {"key":"ordered"} -->
# 手順を示すページ

1. Template Repositoryから資料用repositoryを作成する
2. `slides.md` をChatGPTまたはGitHubで編集する
3. commit / pushする
4. ActionsがHTMLを生成する
5. Pagesが有効なら自動で公開する

---

<!-- {"key":"table"} -->
# 比較表

| 項目 | 初期版 | 将来候補 |
| --- | --- | --- |
| 正本 | Markdown | 他source adapter |
| HTML | Marp | 継続 |
| PDF | Marp | 継続 |
| Google Slides | 対象外 | 再検討 |
| PPTX | 対象外 | 再検討 |
| 公開 | GitHub Pages | 他publish target |

---

<!-- {"key":"quote"} -->
# 引用を含むページ

> テキストとして管理できることと、最終成果物として読みやすいことは別の要件です。

そのためmisereruでは、Markdownの編集しやすさだけでなく、生成後の日本語組版・可読性・ナビゲーションも評価します。

---

<!-- {"key":"code"} -->
# コードブロック

```json
{
  "outputs": {
    "html": { "enabled": true },
    "pdf": { "enabled": false }
  },
  "publish": {
    "githubPages": { "enabled": true }
  }
}
```

---

<!-- {"key":"links"} -->
# 外部リンク

通常のMarkdownリンクが、生成後のHTMLでもクリック可能なことを確認します。

- [W3C 日本語組版処理の要件（JLREQ）](https://www.w3.org/International/jlreq/?lang=ja)
- [Marp](https://marp.app/)
- [GitHub Pages](https://pages.github.com/)

---

<!-- {"key":"emphasis"} -->
# 強調表現

**重要な結論**を太字で示し、`設定名` やファイル名をインラインコードで示します。

*補足的な語句*も含め、一般的なMarkdown表現が資料として自然に見えるかを確認します。

---

<!-- {"key":"mixed"} -->
# 情報量が多いページ

misereruの初期運用では、1資料を1repositoryとして管理します。

- 通常編集: `slides.md`
- 出力設定: `misereru.config.json`
- テーマ: `themes/`
- 自動化: `.github/workflows/`

| 出力 | 状態 |
| --- | --- |
| HTML | 常時生成 |
| PDF | opt-in |
| Pages | opt-in |

---

<!-- {"key":"summary"} -->
# 確認ポイント

- 表紙だけでなく通常本文が読みやすいか
- 長文でも日本語の改行が不自然でないか
- 箇条書き・表・引用・コードの密度が適切か
- スマートフォンでも文字が小さすぎないか
- MarpのHTMLビューア操作が実用になるか
