# Use a template repository with Markdown source and HTML default output

- Status: Accepted
- Date: 2026-09-17
- Amendment: GitHub Pages運用は [ADR-0006](0006-publish-first-complete-artifact.md) で「作成直後OFF／最初の成立成果物でON」へ変更

## Context and Problem Statement

misereru は、スマートフォン + ChatGPT + GitHub を中心に、ローカルPCやPowerPointを日常運用の必須工程にせずスライド資料を管理・再生成できることを重視しています。

運用時に毎回 renderer や CI を組み立てる構成では、資料ごとの初期設定が重くなります。また、複数rendererを同時にproduction利用すると、内容sourceを共有できてもデザイン実装が分かれ、同じ資料の別形式として扱いにくくなります。

## Considered Options

- 1つの中央 repository で複数資料を管理する。
- 資料ごとに空の repository を作り、毎回 CI / renderer を設定する。
- misereru を GitHub Template Repository とし、資料ごとに repository を生成する。

既定 output / renderer については次を比較対象としました。

- Google Slides を必須にする。
- Marpとdeckを同じproduction pipelineで併用する。
- HTMLを認証不要の既定outputとし、初期production rendererをMarp 1系統に限定する。

## Decision Outcome

初期運用では、misereru repository を GitHub Template Repository として利用し、原則として **1資料 = 1 repository** とします。

各資料 repository の通常編集対象は `slides.md` とし、出力設定は `misereru.config.json` に置きます。

初期production方針:

- renderer: Marp 1系統
- HTML: 必須・既定・push時に自動生成
- PDF: optional。同じMarp renderer/themeを使う
- GitHub Pages: explicit opt-in。生成済みHTMLだけを公開する
- Google Slides: production未対応。deck検証はresearch/prototypeに隔離
- PPTX: production未対応

正本 `slides.md` には Marp 固有 front matter を必須にせず、build 時に一時的なMarp入力へ付加します。

`k1LoW/deck` は Markdown → Google Slides のrendererでありHTML出力を持ちません。Marpとdeckをproductionで併用すると、Marp CSS/theme と Google Slides base presentation/layout の2系統を維持する必要があります。初期版ではこの二重メンテナンスを採用しません。

Google Slidesを将来追加する場合は、共通レイアウトモデルを導入するか、別デザイン系の成果物として扱うかを先に決定します。

初期版が Markdown を正本とすることは、misereru 全体を将来にわたり Markdown 専用へ固定する判断ではありません。source adapter を追加できる構成は維持します。

## Consequences

- 新しい資料は Template Repository からすぐ開始できます。
- 日常作業は主に `slides.md` の編集だけで済みます。
- HTML はGoogle認証なしで常に再生成できます。
- HTML/PDFは同じrenderer/themeで管理でき、初期版ではデザイン実装を二重化しません。
- GitHub Pages公開は明示的に有効化した場合だけ行われます。
- Google Slidesは初期版の利用者設定に出さず、検証コードだけresearch/prototypeとして残ります。
- 一方で、資料ごとに repository が増えるため、共通 workflow / theme の更新を既存資料へどう反映するかは別途設計が必要です。
