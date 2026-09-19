# Do not inherit misereru's internal branch model into derived repositories

- Status: Accepted
- Date: 2026-09-19

## Context and Problem Statement

misereru本体は、Template Repositoryとして配布するproduction内容を `main`、misereru自身の設計・調査・統合を `develop` へ分けています。

一方、`main` の `AGENTS.md` はTemplate Repositoryから派生repositoryへコピーされます。ここにmisereru本体のbranch運用が十分にscopeされていないと、AI agentが派生した資料・調査repositoryにも `main` / `develop` の2branch modelを適用し、「調査中だからdevelop」「完成したらmain」と誤って解釈できます。

調査型repositoryでは、調査過程・source・中間仮説・修正履歴そのものが成果物です。この場合、未完成であることとdefault branchから隔離すべきことは同義ではありません。Git commit historyと `research.md` 等の調査正本で履歴を保持できるため、履歴保存のためだけにbranchを分ける必要もありません。

## Considered Options

- Templateから派生したrepositoryにも `main` / `develop` を標準化する。
- 調査repositoryだけ例外として `main` 一本にする。
- 派生repositoryへbranch modelを規定せず、repository固有ルールを優先し、既定はdefault branchを正本とする。
- branchを成果物の成熟度（draft / final）で使い分ける。

## Decision Outcome

**misereru本体のbranch modelを派生repositoryへ自動継承しません。**

misereru本体では従来どおり次を維持します。

- `main`: Template Repositoryとして配布するproduction正本
- `develop`: misereru本体の開発・統合・調査

Template Repositoryから作成した資料・調査repositoryでは、次をproduction契約とします。

- repository固有の `README.md` / `AGENTS.md` に別規定がなければdefault branchを正本とする
- 「調査中」「草稿」「未公開」「まだ完成していない」という状態だけをbranch新設理由にしない
- 調査履歴を保持するrepositoryでは、`research.md`、source ledger、中間仮説、留保、更新履歴をdefault branchへ継続的に保存できる
- 時系列の履歴はGit commit historyと調査正本で保持する
- branchは、並行作業、破壊的な大規模再構成、独立実験、PRレビュー、公開版freeze等、default branchから隔離する具体的対象がある場合だけ作る
- branch作成前に「何を隔離するか」「なぜdefault branchでは不十分か」を説明できることを要求する

branch名を、成果物の完成度を表す状態ラベルとしては使いません。必要ならREADMEや正本内のstatusで表現します。

## Consequences

- 派生repositoryを開いたとき、現在の調査・資料正本をdefault branchで直接確認できます。
- 調査過程を隠さず、repository全体を調査アーカイブとして利用できます。
- 不要な長期branchが増えにくくなります。
- 本当に隔離が必要な大規模再構成や実験では、従来どおりbranchを利用できます。
- misereru本体と派生repositoryでbranch policyが異なるため、AI agentは作業開始時にrepository contextを判定する必要があります。
- production templateの `AGENTS.md` は、misereru本体内部のbranch規則と派生repositoryのbranch規則を明確にscopeしなければなりません。
