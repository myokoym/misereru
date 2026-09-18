# AGENTS.md

このrepositoryでAI agentが`develop` branchを扱うときの運用ルールです。

目的はSkill discoveryではなく、**開発・統合branchとproduction templateを混同しないこと、既存repository・正本・公開経路を確認せず別成果物を作る事故を防ぐこと**です。

## Branch role: `develop`

このbranchは **misereru本体の開発・統合・調査用branch** です。Template Repositoryとして配布するproduction正本は`main`です。

現行運用で使うbranchは **`main` と `develop` の2本だけ**です。

- `main`: 配布・production用Template Repository正本
- `develop`: 開発・統合・調査用

過去のprototype branchや実験branchを、現役の運用単位として扱いません。新しい長期branchを作る場合も、明示的な運用上の必要性がある場合だけにします。

- `docs/`、research、ADR、prototypeから昇格させる検証結果、production候補の実装を扱う
- 未確定の設計・調査を`main`へ直接持ち込まず、まず`develop`で整合性を確認する
- `develop`で動いたという理由だけでproduction採用済みとは扱わない
- productionへ採用する場合は、何を`main`へ昇格させるかを明示して反映する
- `main`との差分を意識し、配布テンプレートに必要な変更と開発資料だけの変更を分ける

`develop`で資料repositoryの運用ルール自体を変更する場合、将来`main`へ昇格させるべきproduction契約か、開発branchだけの補助情報かを区別します。

## 1. Repository-first

既存のmisereru資料を更新する依頼では、最初にその資料のrepositoryを作業対象として確定します。

作業開始前に最低限、次を確認します。

1. repository名と現在のbranch
2. `README.md`
3. `misereru.config.json`
4. 存在する正本ファイル（現在は `slides.md`、`presentation-script.md`、`docs/` 等）
5. `.agents/skills/` にある関連Skill
6. GitHub Pages等の既存publish設定と公開先

会話中に既存repositoryが特定されている場合、ローカルで新しいPPTX・Markdown一式・別repositoryを作る前に、**必ず既存repositoryを確認して更新対象を特定する**こと。

## 2. 正本と生成物を混同しない

標準の役割は次のとおりです。repository固有の`README.md`または`docs/`に追加定義がある場合はそちらも従います。

- `slides.md`: スライド内容の正本
- `presentation-script.md`: 任意の発表原稿の正本
- `docs/`: misereru本体の設計・要件・research・ADR
- `misereru.config.json`: output / publish設定の正本
- `dist/`: build生成物。直接編集しない

Marp用HTML、PDF、Pages用HTML等は正本からbuildする生成物です。生成物を直接修正して正本と乖離させません。

## 3. 「スライドや資料を更新」の既定動作

既存misereru資料について「スライドを更新」「資料を更新」「調査結果を反映」などと依頼された場合、既定では**そのrepository内の既存正本を更新**します。

次を勝手に行いません。

- 新しいPPTXを別途作る
- 新しい資料repositoryを作る
- `/mnt/data` 等に独立した完成版を作って既存repositoryの代わりにする
- publish先を別サービスへ変更する
- `misereru.config.json`の既存publish設定を、テンプレート既定値で上書きする

PPTX、Google Slides、PDF、別repository等を新たに作るのは、ユーザーが明示的に要求した場合だけです。

## 4. `develop`での変更分類

`develop`では変更を次の3種類に分けます。

1. **調査・設計だけ**: `docs/research/`等で管理し、production実装へ自動昇格させない
2. **production候補**: scripts / theme / config / Skill等へ実装し、`develop`で整合性を検証する
3. **production採用**: 採用が明示されたものだけ`main`へ反映する

この分類を飛ばして、調査メモをそのままproduction仕様へ格上げしたり、`develop`の全差分を`main`へ機械的に同期したりしません。

## 5. 更新時の同期ルール

事実・仕様・調査結果が変わる場合は、関連する正本間の矛盾を残しません。

- researchで新しい事実が確認された場合、必要な設計・要件・ADRへの影響を確認する
- production候補を変更した場合、対応するdocsと実装の整合を確認する
- slide / scriptを変更する場合はstable `key`や主要事実の整合を保つ
- `main`へ昇格する変更は、派生repositoryへ配布すべきproduction内容だけに絞る

## 6. repository固有ルールを優先して読む

テンプレートや過去の会話だけで現在状態を推定しません。

特に次を現在branchのファイルから確認します。

- 現在の要件・運用モデル
- build / workflow
- publish設定
- source / output構成
- 関連Skill
- researchとADRの状態

`main`の既定値と`develop`の検証中設定を混同しません。

## 7. Skillの扱い

内容編集前に、対象に対応する`.agents/skills/`を確認します。

Skillは書き方・レビュー規則、`AGENTS.md`はrepository / branch運用と誤操作防止を担います。

Skill自体を変更する場合、その変更が`develop`だけの試行か、将来`main`へ配布するproduction候補かを区別します。

## 8. build / publish確認

実装や正本の変更後は、対応するbuild / workflowを確認します。

- buildが成功したか
- 実験workflowとproduction workflowを混同していないか
- Pagesを有効にしている場合、どのbranch / environmentを公開しているか
- build errorがあれば正本または設定を修正する

`develop`のpreviewや実験outputを、`main`のproduction公開として報告しません。

## 9. 完了報告

repositoryを更新した場合、最低限次を明示します。

- 作業branch
- 更新した正本 / docs / 実装
- 変更が調査・production候補・production採用のどれか
- commitまたはHEAD
- build / deploy結果
- `main`への昇格を行ったか、行っていないか

## 10. 最重要の禁止事項

**`develop`をproduction templateそのものとして扱わないこと。既存misereru資料のrepositoryがある場合は、そのrepositoryを確認せず別成果物を新規生成しないこと。**

まずrepositoryとbranch、次に正本・docs・現在設定、その後に調査・実装・buildという順序を固定します。