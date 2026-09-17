# AGENTS.md

このrepositoryでAI agentが`develop` branchを扱うときの運用ルールです。

目的はSkill discoveryではなく、**開発・統合branchとproduction templateを混同しないこと、既存repository・正本・公開経路を確認せず別成果物を作る事故を防ぐこと**です。

## Branch role: `develop`

このbranchは **misereru本体の開発・統合・調査用branch** です。Template Repositoryとして配布するproduction正本は`main`です。

- `docs/`、research、ADR、prototypeから昇格させる検証結果、production候補の実装を扱う
- 未確定の設計・調査を`main`へ直接持ち込まず、まず`develop`で整合性を確認する
- `develop`で動いたという理由だけでproduction採用済みとは扱わない
- productionへ採用する場合は、何を`main`へ昇格させるかを明示して反映する
- `prototype/*`の結果は検証材料であり、採用判断なしに`develop`や`main`へ丸ごと同期しない
- `main`との差分を意識し、配布テンプレートに必要な変更と開発資料だけの変更を分ける

`develop`で資料repositoryの運用ルール自体を変更する場合、将来`main`へ昇格させるべきproduction契約か、開発branchだけの補助情報かを区別します。

## 1. Repository-first

既存のmisereru資料を更新する依頼では、最初にその資料のrepositoryを作業対象として確定します。

作業開始前に最低限、次を確認します。

1. repository名と現在のbranch
2. `README.md`
3. `misereru.config.json`
4. 存在する正本ファイル（`slides.md`、`presentation-script.md`、`article.md`、`research.md` 等）
5. `.agents/skills/` にある関連Skill
6. GitHub Pages等の既存publish設定と公開先

会話中に既存repositoryが特定されている場合、ローカルで新しいPPTX・Markdown一式・別repositoryを作る前に、**必ず既存repositoryを確認して更新対象を特定する**こと。

## 2. 正本と生成物を混同しない

標準の役割は次のとおりです。repository固有の`README.md`に追加定義がある場合はそちらも従います。

- `slides.md`: スライド内容の正本
- `presentation-script.md`: 任意の発表原稿の正本
- `article.md`: 任意の単体完結記事の正本
- `research.md`: 存在する場合、出典・第三者検証・留保・更新履歴を持つ調査台帳
- `misereru.config.json`: output / publish設定の正本
- `docs/`: misereru本体の開発・設計・調査資料。内容ごとの正本関係を各文書から確認する
- `dist/`: build生成物。直接編集しない

Marp用HTML、PDF、Pages用HTML等は正本からbuildする生成物です。生成物を直接修正して正本と乖離させません。

## 3. 「スライドや資料を更新」の既定動作

既存misereru資料について「スライドを更新」「資料を更新」「調査結果を反映」などと依頼された場合、既定では**その資料repository内の既存正本を更新**します。misereru本体の`develop`へ資料内容を代替保存しません。

次を勝手に行いません。

- 新しいPPTXを別途作る
- 新しい資料repositoryを作る
- `/mnt/data` 等に独立した完成版を作って既存repositoryの代わりにする
- publish先を別サービスへ変更する
- 派生repositoryの現在設定を、misereru本体のテンプレート既定値で上書きする

PPTX、Google Slides、PDF、別repository等を新たに作るのは、ユーザーが明示的に要求した場合だけです。

## 4. 開発変更の扱い

misereru本体を変更する場合は、対象を分けます。

- **production候補**: scripts、theme、config schema、workflow、template source、Agent Skills、汎用`AGENTS.md`
- **開発・調査のみ**: `docs/research/`、検証メモ、未採用案
- **決定記録**: ADRやproduct docsなど、そのrepositoryで定義された決定の正本

production候補を変更した場合は、関連するbuild・検査を実行し、`main`へ昇格させる前に既存資料repositoryへの副作用を確認します。

## 5. 資料repositoryの同期ルール

調査型repositoryに`research.md`がある場合は、原則として次の順で更新します。

1. 一次情報・第三者検証を確認する
2. `research.md`へ根拠、条件、留保を記録する
3. 人に見せる価値がある内容を`slides.md`へ反映する
4. `presentation-script.md`が存在し、該当slideを説明するなら同期する
5. `article.md`が存在し、記事の理解に必要なら同期する
6. 追跡方針やファイル役割が変わる場合だけ`README.md`も更新する

slide構造を変更する場合はstable `key`と発表原稿側の対応を確認します。

## 6. repository固有ルールを優先する

テンプレートの一般論だけで作業を決めません。派生repositoryごとに、Pages、発表原稿、記事、`research.md`、資料モード、独自Skill、追加検査を確認します。

テンプレート側でPagesが既定OFFでも、派生repositoryでONなら、その派生repositoryの設定が現在の正しい状態です。

## 7. Skillと調査品質

内容編集前に対象の`.agents/skills/`を確認します。

- slide編集: `misereru-slide-writing`
- 発表原稿: `misereru-presentation-script`
- 記事: `misereru-article-writing`

外部情報を反映するときは、一次情報を優先し、ベンダー主張と第三者実測、日付、地域、サンプル数、比較条件を分けます。既存手法でも同様の処理が可能なら、対象技術だけの固有能力として書きません。

## 8. build / publish確認

正本をpushしただけで「公開済み」とは扱いません。関連workflowがある場合はbuild結果を確認し、Pages有効時はdeployも確認します。

misereru本体の`develop`でbuildが成功しても、それだけで`main`や派生repositoryが更新済みとは扱いません。

## 9. 完了報告

repositoryを更新した場合、最低限次を明示します。

- repository / branch
- 更新した正本ファイル
- 主要な変更内容
- commitまたはHEAD
- build / deploy結果
- `main`へ未反映なら、その状態

## 10. 最重要の禁止事項

**`develop`をproduction templateそのものと誤認しないこと。既存の資料repositoryがあるのに、それを確認せず別PPTXや別資料を作らないこと。**

misereru本体の開発と、派生資料の内容更新を混同せず、repositoryとbranchを最初に確定します。