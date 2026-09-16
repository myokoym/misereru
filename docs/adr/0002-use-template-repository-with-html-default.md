# Use a template repository with Markdown source and HTML default output

- Status: Accepted
- Date: 2026-09-17

## Context and Problem Statement

misereru は、スマートフォン + ChatGPT + GitHub を中心に、ローカルPCやPowerPointを日常運用の必須工程にせずスライド資料を管理・再生成できることを重視しています。

運用時に毎回 renderer や CI を組み立てる構成では、資料ごとの初期設定が重くなります。また、出力形式をすべて必須にすると Google 認証や renderer 固有要件が通常編集の妨げになります。

## Considered Options

- 1つの中央 repository で複数資料を管理する。
- 資料ごとに空の repository を作り、毎回 CI / renderer を設定する。
- misereru を GitHub Template Repository とし、資料ごとに repository を生成する。

既定 output については次を比較対象としました。

- Google Slides を必須にする。
- PDF / PPTX を必須にする。
- HTML を認証不要の既定 output とし、他 target を opt-in にする。

## Decision Outcome

初期運用では、misereru repository を GitHub Template Repository として利用し、原則として **1資料 = 1 repository** とします。

各資料 repository の通常編集対象は `slides.md` とし、出力設定は `misereru.config.json` に置きます。

初期 output 方針:

- HTML: 必須・既定・push時に自動生成
- PDF: optional
- Google Slides: optional。実 `deck apply` + navigation + readback verification が成立してからテンプレートの自動targetへ昇格
- PPTX: 候補として残すが初期版では未接続
- GitHub Pages: explicit opt-in。勝手に公開しない

未接続 target を設定で有効にした場合は、成功扱いで黙ってスキップせずエラーにします。

初期版が Markdown を正本とすることは、misereru 全体を将来にわたり Markdown 専用へ固定する判断ではありません。source adapter を追加できる構成は維持します。

## Consequences

- 新しい資料は Template Repository からすぐ開始できます。
- 日常作業は主に `slides.md` の編集だけで済みます。
- HTML はGoogle認証なしで常に再生成できます。
- Google Slides等の追加targetが未設定でも通常buildを阻害しません。
- 一方で、資料ごとに repository が増えるため、共通 workflow / theme の更新を既存資料へどう反映するかは別途設計が必要です。
- Google Slidesの品質は `deck` の素の既定値へフォールバックせず、misereru標準templateで保証する必要があります。
