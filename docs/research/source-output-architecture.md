# Source / output architecture research

最終更新: 2026-09-16

source format を Markdown に固定せず、project template・renderer wrapper・複数 publish target を含めて構成を比較するための調査メモです。

安定要件は [`../product/requirements.md`](../product/requirements.md) を参照してください。

## 前提

- Markdown は必須ではない。
- 独自フォーマットを採用してもよい。
- 複数 source format を扱ってもよい。
- 単一ファイルではなく project template を生成する方式でもよい。
- 既存ツールで十分なら wrapper として利用する。
- 規定位置のファイル更新を GitHub Actions が検知して render / publish する運用を想定する。
- publish target は設定可能にし、Google Slides / Google Drive / GitHub Pages / artifact 等を候補とする。
- スマートフォンから成果物を確認しやすいことを重視する。

## GitHub template repository

GitHub の template repository は、既存 repository のディレクトリ構成とファイルから新しい repository を生成できます。

通常の fork と異なり、新しい repository は元 repository の履歴を引き継ぐ前提ではありません。

したがって、misereru を単一の「スライド編集アプリ」にするだけでなく、次のような starter project を提供する方式と相性があります。

```text
presentation-project/
├─ presentation.yml
├─ slides.md            # source adapter の一例
├─ assets/
├─ theme/
└─ .github/workflows/
```

参考:

- GitHub Docs: <https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-template-repository>
- GitHub Docs: <https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template>

## Google Slides を target にする経路

### A. Google Slides API へ直接生成

Google Slides API は presentation の作成と `presentations.batchUpdate` による更新を提供します。

native shape / text / image / table 等を直接管理できるため、Google Slides 側で編集可能な成果物を作る場合の自由度は最も高いです。

一方で layout・文字組み・差分更新・既存要素との対応をこちらで実装する範囲が増えます。

参考:

- Google Slides API: <https://developers.google.com/workspace/slides/api/reference/rest>
- batchUpdate 日本語: <https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations/batchUpdate?hl=ja>

### B. PPTX を生成し、Google Drive で Google Slides へ変換

Google Drive API は Microsoft PowerPoint / OpenDocument Presentation から Google Slides への import conversion をサポートします。

参考:

- Google Drive API — ファイルデータをアップロードする: <https://developers.google.com/workspace/drive/api/guides/manage-uploads?hl=ja>

既存 renderer が PPTX を安定生成できる場合には、Google Slides への publish adapter を薄くできます。

ただし renderer 側が PPTX を画像的に生成する場合、Google Slides 化しても文字・図形が native 編集可能になるとは限りません。

Marp の通常 PPTX はこの点で「閲覧用 target」としては使えても、「Google Slides 上で編集可能な target」としては強くありません。

### C. `k1LoW/deck` を利用

GitHub: <https://github.com/k1LoW/deck>

`deck` は Markdown を内容、Google Slides をデザインとして分離し、Google Slides を直接更新する既存ツールです。

確認した主要機能:

- `deck new` で Google Slides presentation を作成できる。
- 既存 presentation を base としてテーマを再利用できる。
- `deck apply` で source を Google Slides に反映する。
- watch mode がある。
- `breaks` は既定 `false` で、source 上の soft line break を強制改行にしない。
- layout 指定と、CEL による default layout 選択がある。
- Google Shared Drives にも対応する。
- Google Slides API / Drive API の OAuth 設定が必要。

今回の要件との相性は高いです。

ただし source が Markdown であるため、製品 source format を別形式にする場合は、

```text
misereru source
  ↓ source adapter
Markdown for deck
  ↓
k1LoW/deck
  ↓
Google Slides
```

のように中間生成物として利用する案があります。

また画像挿入時に一時的に Google Drive へ画像を upload して公開 URL を利用する実装上の制約が README に記載されているため、private-only 運用との整合は別途確認が必要です。

## HTML / GitHub Pages

HTML は認証や外部 API credential を必要とせず、GitHub Actions から GitHub Pages へ publish しやすい target です。

Google Slides を主成果物にする場合でも、次の用途があります。

- PR / branch ごとの軽量 preview
- Google API credential が未設定の repository でも確認可能な既定 target
- renderer の layout regression 確認

したがって Google Slides と HTML Pages は排他的に考えず、target adapter として並立可能です。

## 現時点の構成案

source format・renderer・publish target を分離します。

```text
project source
  ├─ presentation config
  ├─ content
  ├─ assets
  └─ theme / design reference
        ↓
source adapter
        ↓
renderer adapter
  ├─ Marp
  ├─ k1LoW/deck
  └─ future renderer
        ↓
publish adapter
  ├─ Google Slides
  ├─ GitHub Pages / HTML
  ├─ PDF
  ├─ PPTX
  └─ Actions artifact
```

ただし、最初から共通 AST / 独自 renderer を実装することは避けます。

既存 renderer の wrapper だけで成立する間は、source adapter と target adapter を薄く保ちます。

## 初期プロジェクトテンプレート案

確定仕様ではありません。

```text
presentation.yml
slides.md
assets/
theme/
.github/workflows/render.yml
```

`presentation.yml` の概念例:

```yaml
renderer: marp

targets:
  html:
    enabled: true
  googleSlides:
    enabled: false
```

source format を Markdown 以外にする場合でも、`renderer` adapter が必要な入力へ変換できればよい構成にします。

## default target の考え方

候補は二つあります。

### HTML / Pages default

長所:

- GitHub だけで完結しやすい。
- Google credential が不要。
- branch / PR preview と相性がよい。

### Google Slides default

長所:

- スマートフォンでの閲覧・共有が容易。
- 最終 presentation としてそのまま使える。
- Google Slides native 出力方式なら手修正も可能。

現時点では決定しません。

「セットアップなしで必ず動く preview target」と「認証済みなら便利な primary target」を分ける案も検討します。

## 現在のプロトタイプとの関係

既存の Marp prototype は破棄しません。

役割を次のように限定します。

- Chromium / Marp での日本語組版品質の実測
- HTML / PDF / PPTX renderer の比較基準
- source adapter の一例として Markdown を使う

**Markdown を製品の唯一の正本形式と決める検証ではありません。**

また 2026-09-16 の初期成果物については、スマートフォンから確認しやすくするため、tuned PNG 14枚を native Google Slides presentation の各ページへ全面配置した確認用 deck を作成しました。

これは publish UX の確認用であり、Google Slides native text renderer の実装検証ではありません。

## 次の比較

1. Marp HTML を GitHub Pages preview として publish する最小構成。
2. `k1LoW/deck` を GitHub Actions から Google Slides へ apply できるか確認する。
3. 同じ実用サンプルを Marp / deck で出し、日本語組版・編集可能性・設定量を比較する。
4. Google Slides direct API は、`deck` で不足する具体例が出た場合に実装範囲を見積もる。
5. source format は上記 renderer 比較と切り離し、ChatGPT編集性・Git差分・画像/レイアウト表現力で別途比較する。
