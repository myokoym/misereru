# Enable GitHub Pages by default for derived presentation repositories

- Status: Superseded by ADR-0006
- Date: 2026-09-19
- Amends: ADR-0002 の GitHub Pages explicit opt-in 部分

## Context and Problem Statement

misereru は当初、GitHub Pages を安全側の既定値としてOFFにし、資料ごとに明示的にONへ切り替える運用を採用した。

実運用では、misereruから作成した個別repositoryは「スライドや記事をブラウザで確認する」こと自体が主要用途であり、Pages公開を後から有効化する操作が毎回の追加作業になった。さらに、AI agentがテンプレート既定OFFを「この個別資料も公開しないという意思決定」と誤認し、公開確認を後回しにする問題が発生した。

GitHub Pages公開とrepositoryのprivate/public設定は別であり、Pagesを使う資料では公開URLが生じる。そのため無条件公開にはリスクがあるが、現在の運用では「作成した資料をブラウザで見る」ことを通常経路とし、公開したくない例外だけを明示的にOFFへする方が操作意図と一致する。

## Considered Options

- 従来どおりPagesを既定OFFにし、資料ごとにONへする。
- Pagesを既定ONにし、公開したくない資料だけOFFにする。
- repository作成時に毎回AIが公開要否を確認する。
- HTML artifactだけを既定とし、Pagesは使わない。

## Decision Outcome

Template Repositoryとして配布する `misereru/main` の `misereru.config.json` では、`publish.githubPages.enabled` を **true** にする。

派生repositoryでは次を既定とする。

- GitHub Pagesは既定ON
- 公開したくない資料だけ `publish.githubPages.enabled: false` へ変更する
- Pages公開先は既存のGitHub Pages経路を使い、内容編集のついでに別ホスティングへ変更しない
- `article.md` / `presentation-script.md` の公開は引き続き個別opt-inとする
- article等のoptional sourceが存在しない場合まで自動公開対象にはしない
- 各repositoryでGitHub Pages自体が未有効の場合、初回だけ Settings > Pages で GitHub Actions publishing を有効にする。高権限PATを標準要求して自動有効化しない
- 派生repositoryが明示的にPagesをOFFにしている場合、そのrepository固有設定を尊重し、テンプレート既定値で上書きしない

## Consequences

- 新規資料repositoryは、初回のPages有効化後はpushだけで通常の閲覧URLを更新できる。
- AI agentが「テンプレートがOFFだから未公開のままでよい」と誤解する余地を減らせる。
- 公開不要の資料では明示的なopt-outが必要になる。
- Private repositoryでもPagesの公開範囲はrepository privacyと同一とは限らないため、機密資料ではPagesをOFFにする判断が必要になる。
- article / presentation scriptは別設定のままなので、PagesをONにしただけで任意sourceまで自動公開されない。
