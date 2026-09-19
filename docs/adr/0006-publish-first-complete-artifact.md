# Publish when the first standalone artifact reaches a complete pass

- Status: Accepted
- Date: 2026-09-19
- Supersedes: ADR-0005
- Amends: ADR-0002 の GitHub Pages運用

## Context and Problem Statement

misereru の初期方針は GitHub Pages explicit opt-in だった。その後、実運用でPages公開忘れが起きたため、ADR-0005ではtemplate既定ONへ反転した。

しかし、template作成直後から無条件でPagesをONにすると、private repositoryでも公開Webへ出る可能性があり、まだ資料として成立していないsample / draftを自動公開する副作用がある。一方で、全形式が完成するまでPagesをOFFに保つと、すでに一通り完成したarticle等をブラウザで確認できないという別の問題が起きる。

実際の用途では、**未完成のsampleが一時的に同時公開されることより、完成した成果物をPagesで確認できないことの方が重大な場合がある。**

## Decision Outcome

Pagesはtemplate作成直後にはOFFとするが、これは恒久的な非公開判断ではない。

次のいずれか一つでも「初版成立」した時点で、機密性・公開禁止条件がない限りPagesをONにする。

- `slides.md`: テンプレート残骸ではなく、一つの資料として最初から最後まで閲覧できる
- `article.md`: スライドや口頭補足なしで、一つの記事として最初から最後まで読める
- `ai-sources/<subject>.md`: ChatGPT等へ単独アップロードして、その主題の主要判断に利用できる

presentation script はslides依存のため、単独では初回公開トリガーにしない。

「初版成立」は最終版を意味しない。以後の修正を前提としてよい。少なくとも、対象成果物にテンプレート残骸や既知の重大な欠落・事実誤認がなく、buildが成功し、単体で内容が通ることを条件とする。

## Publication Priority

初回公開の判断では、**完成済み成果物を閲覧可能にすることを優先**する。

たとえばarticleが先に初版成立し、slidesがまだsampleのままでも、sample slideが一時的に同時公開されることだけを理由にarticle公開を遅らせない。

未完成sampleの露出は後で解消すべき表示上の問題だが、完成済みartifactをPagesで確認できない状態より優先度を下げる。

将来的にartifact単位で公開対象を完全分離できるようにすることは改善候補だが、それが完成するまで初回公開自体を止める理由にはしない。

## Exceptions

次の場合は初版成立後でも自動的に公開へ進めない。

- confidential / private-only と明示されている
- credentials、個人情報、社外秘情報等を含む
- repository固有ルールでPages OFFが明示されている
- 公開対象そのものに既知の重大な誤り・欠落が残っている

## Consequences

- template作成直後の意図しない即時公開を避けられる。
- article-first / slides-first のどちらでも、最初に成立した成果物からPagesで確認できる。
- 全形式完成を待つ必要がなくなる。
- sample slides等が一時的に同時公開される場合がある。
- artifact単位のpublish isolationは将来改善として残る。
- AI agentはtemplate既定OFFを「このrepositoryは非公開のままでよい」と解釈してはならず、成果物の成立状態を見てPages切替を判断する必要がある。
