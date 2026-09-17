# AGENTS.md

このrepositoryと、これをTemplate Repositoryとして作成するmisereru資料repositoryでAI agentが作業するときの運用ルールです。

目的はSkill discoveryではなく、**既存repository・正本・公開経路を確認せずに別成果物を作る事故を防ぐこと**です。

## 1. Repository-first

既存のmisereru資料を更新する依頼では、最初にその資料のrepositoryを作業対象として確定します。

作業開始前に最低限、次を確認します。

1. repository名とdefault branch
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

## 4. 更新時の同期ルール

事実・調査結果が変わる場合は、同じ内容を持つ正本間の矛盾を残しません。

### 調査型repositoryに`research.md`がある場合

1. 一次情報・第三者検証を確認する
2. `research.md`へ根拠、条件、留保を記録する
3. 人に見せる価値がある内容を`slides.md`へ反映する
4. `presentation-script.md`が存在し、該当slideを説明するなら同期する
5. `article.md`が存在し、記事の理解に必要なら同期する
6. 追跡方針やファイル役割が変わる場合だけ`README.md`も更新する

すべての調査メモをスライドへ入れる必要はありません。`research.md`は詳細、`slides.md`は要約、`article.md`は単体で読める再構成、`presentation-script.md`は口頭説明です。

### slide構造を変更する場合

- 既存slideの意味を保つならstable `key`を保持する
- 新規slideには安定した`key`を付ける
- `presentation-script.md`がある場合、対応する`slide` keyとの整合性を確認する
- 自動生成される目次用keyを手動の通常slideとして流用しない

## 5. repository固有ルールを優先して読む

テンプレートの一般論だけで作業を決めません。

特に次をrepositoryごとに確認します。

- GitHub Pagesが有効か
- 発表原稿を公開しているか
- 記事を公開しているか
- `research.md`等の追加正本があるか
- Reference / Presented / Mixedのどの資料モードか
- 独自Skillや追加検査があるか

テンプレート側でGitHub Pagesが既定OFFでも、派生repositoryでONなら、その派生repositoryの設定が現在の正しい状態です。

## 6. 調査と根拠

外部情報を資料へ反映するときは、関連Skillに加えて次を守ります。

- 一次情報を優先する
- ベンダーの性能主張と第三者実測を分ける
- 日付、地域、サンプル数、比較条件を確認する
- 「できる」と「その条件で実用になる」を分ける
- 既存手法でも同様のことができる場合、Jev等の対象技術だけの固有能力として書かない
- 誤記を見つけた場合、該当する全正本を確認して整合させる

## 7. Skillの扱い

内容編集前に、対象に対応する`.agents/skills/`を確認します。

- slide編集: `misereru-slide-writing`
- 発表原稿: `misereru-presentation-script`
- 記事: `misereru-article-writing`

Skillは書き方・レビュー規則、`AGENTS.md`はrepository運用と誤操作防止を担います。両方を適用します。

## 8. build / publish確認

正本をpushしただけで「公開済み」とは扱いません。

関連ファイルの変更でGitHub Actionsが起動するrepositoryでは、作業後にworkflowを確認します。

- buildが成功したか
- Pagesを有効にしている場合、deployが成功したか
- build errorがあれば、正本または設定を修正する

公開URLを案内するのは、既存URLであることが確認でき、必要なdeployが成功した後にします。

## 9. 完了報告

repositoryを更新した場合、最低限次を明示します。

- 作業したrepository
- 更新した正本ファイル
- 主要な変更内容
- commitまたはHEAD
- build / deploy結果
- 公開している場合は既存の公開URL

別形式の成果物を作っていない場合、そのことを曖昧にする必要はありません。正本repositoryの更新を成果として扱います。

## 10. 最重要の禁止事項

**既存misereru資料のrepositoryがあるのに、それを確認せず「スライド作成依頼」とだけ解釈して別のPPTXや資料を新規生成しないこと。**

まずrepository、次に正本、その後に必要な調査・編集・buildという順序を固定します。