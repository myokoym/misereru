---
marp: true
size: 16:9
paginate: true
title: 日本語組版ストレステスト
---

# 日本語組版ストレステスト

同一の Markdown を baseline / tuned の2系統でレンダリングし、改行・禁則・和欧混植の差を比較します。

---

## 1. 行頭禁則

これは句読点や閉じ括弧が行頭へ追い出されやすい長さを意図した文章です。「日本語のスライドでは、読点、句点、閉じ括弧）」が不自然に次行へ残ると読みづらさが目立ちます。

「括弧の中に長めの文章を入れて、最後の閉じ括弧」が行頭に単独で現れないことも確認します。

---

## 2. 行末禁則

行末に開始括弧や開始引用符だけが残らないことを確認します。次の文章では説明の途中に「新しい概念」を置き、その直前で折り返しが発生しても開始括弧だけが前の行へ残らないことを期待します。

（このような丸括弧でも同様です。）

---

## 3. 和欧混植

ChatGPTでMarkdown資料を作り、GitHub ActionsでMarp CLIを実行し、PDFとPPTXを生成します。

CSSの`text-autospace`が有効な場合、CJK文字とLatin文字・数字の境界がどのように見えるかを確認します。

---

## 4. 長い欧文単語

日本語の途中に InternationalizationArchitecture や CSSContainerQueryImplementation のような長い英単語が入るケースです。

英単語を無理に途中分割するのか、語全体を次行へ送るのか、overflowするのかを確認します。

---

## 5. 数字・単位・記号

画面サイズは1920×1080、余白は32px、処理時間は1.25秒、成功率は99.9%というように、数字・単位・記号が連続する文章を確認します。

価格12,800円、容量256GB、温度20℃、比率16:9、バージョンv4.5.1も同じ段落に含めます。

---

## 6. URL

長いURLが本文に入る場合の折返しを確認します。

https://example.com/research/japanese-typesetting/very-long-path-with-query?mode=preview&language=ja

URLだけがレイアウト全体を押し広げたり、本文が極端に崩れたりしないことを確認します。

---

## 7. インラインコード

本文中の`markdown.breaks = false`や`text-wrap: pretty`、`line-break: strict`のようなcode spanが、周囲の日本語と不自然に分離しないかを確認します。

`veryLongFunctionNameWithoutNaturalBreakPoint()`のような長いcode spanも含めます。

---

## 8. 日本語 + 括弧 + 英文

日本語の説明（This sentence is intentionally written in English to create a mixed-script boundary.）の後に、日本語へ戻るケースです。

引用「Markdown is the source of truth.」を文中に入れた場合の括弧・句読点も確認します。

---

## 9. 見出しの折返し

# 日本語とEnglishWordsが混在するかなり長い見出しを二行に折り返したときのバランスを確認する

本文ではなく、見出しに`text-wrap: balance`を適用した場合の差を比較します。

---

## 10. 箇条書き

- 句読点を含む長めの箇条書きが、二行目以降でも自然に読めること。
- `GitHub Actions`や`Marp CLI`などの英語を含んでも、不自然な文字単位分割を起こさないこと。
- 「開始括弧」や閉じ括弧）を含む項目でも、禁則処理が崩れないこと。
- 12,800円・256GB・99.9%のような数字と記号を含むこと。

---

## 11. Markdownソース上の物理改行

この段落はソースを読みやすくするために
途中で物理的に改行していますが、tuned版では
その位置を強制改行として扱わないことを期待します。

baseline版ではMarp Core既定の`breaks: true`との差が見える想定です。

---

## 12. overflow境界

このスライドは、情報量が増えたときに単純な文字縮小へ逃げるべきか、警告を出すべきか、レイアウトを再構成すべきかを検討するための境界ケースです。現時点では自動縮小を実装せず、まずレンダラーの自然な挙動を観察します。

- 日本語の長文
- English words mixed into Japanese sentences
- 1920×1080 / 16:9 / 99.9%
- `inline code` と URL https://example.com/very/long/path
- 「括弧」と句読点、読点、句点。
- さらに文章量を増やして、下端に近づいたときの見え方を確認します。
- 初期プロトタイプでは、この状態を自動で修復せず比較対象として残します。
