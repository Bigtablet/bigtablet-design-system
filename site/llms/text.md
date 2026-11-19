# 줄바꿈 - `@bigtablet/design-system/text`

한국어 글이 어색한 자리에서 갈리지 않게 하는 하위 경로입니다. 런타임 의존성이 없습니다. DS 컴포넌트(Toast · Alert `message`, `supportingText` 등)는 이 규칙을 이미 씁니다 - 앱이 직접 그리는 글에 같은 규칙을 걸 때 가져옵니다.

```tsx
import { BalancedText, BalancedTextScript, Sentences } from "@bigtablet/design-system/text";
```

## 무엇을 쓰나

- 제목 · 히어로 · 소개 문구 · 짧은 문단(수십 어절): **`BalancedText`** - 실제 폭을 재서 같은 줄 수 안에서 가장 자연스러운 자리(문장 끝 · 쉼표 뒤)에서 줄을 바꿉니다
- 긴 본문, 문장 사이에서 먼저 끊기만 하면 될 때: `Sentences` (문자열) · `renderSentences` (React 노드)
- 꾸미는 말과 꾸밈받는 말("이 아래의 컴포넌트에서")만 묶기: `renderPhrases`
- React 밖(서버 · 다른 렌더러)에서 같은 규칙: `splitSentences` · `phraseRanges` · `chooseBreaks`

## BalancedText

```tsx
<BalancedText as="h1" className="hero_title">
  고객의 신뢰를 먼저 얻은 다음에 더 많은 데이터를 요청하세요
</BalancedText>

<BalancedText as="p">
  마크업 없이 <code>useConfirm</code> 훅으로 띄웁니다.
</BalancedText>
```

- `as` 는 블록으로 놓이는 요소(h1 · p 또는 `display: block`)여야 합니다 - 폭을 잽니다. 기본값은 `span`
- children 은 글자와 인라인 요소(`<code>` · `<strong>` · 링크)를 섞어도 됩니다. 요소 하나는 쪼개지 않는 한 조각입니다 - 여러 어절을 굵게 하려면 어절마다 `<strong>` 으로 나눕니다
- 줄은 `<br>` 이 아니라 nowrap 묶음으로 그립니다 - 복사 · 페이지 검색 · 스크린리더가 원문 그대로입니다
- 폭이 바뀌면 멈춘 뒤(100ms) 다시 고르고, 웹폰트를 받는 중이면 받은 뒤에 고릅니다
- 긴 본문(수백 어절)에는 쓰지 않습니다 - 계산이 어절 수의 제곱에 비례합니다

## SSR 앱 - BalancedTextScript

서버는 화면 폭을 몰라 서버 HTML 은 브라우저 줄바꿈입니다. `<body>` 끝(BalancedText 들 뒤)에 한 번 두면 JS 를 받기 전에 같은 줄로 보이고, 하이드레이션 뒤 BalancedText 가 그 줄을 그대로 넘겨받습니다. CSR 앱에는 필요 없습니다.

```tsx
// app/layout.tsx (Next App Router)
<body>
  {children}
  <BalancedTextScript nonce={nonce} />
</body>
```

- React 가 그린 DOM 은 건드리지 않고 `<style>` 규칙만 넣습니다 - 하이드레이션이 어긋나지 않습니다
- 글꼴을 아직 받는 중이면(첫 방문) 손대지 않고 하이드레이션이 고릅니다 - 본문 웹폰트를 preload 하면 첫 방문에도 맞을 때가 많습니다
- React 없이 HTML 에 넣을 때는 `balancedTextScript` 문자열을 `<script>` 안에 그대로 씁니다

## Sentences · renderSentences

```tsx
<p><Sentences text="저장했어요. 계속할까요?" /></p>
```

- 두 문장 이상이면 문장마다 묶어 줄이 문장 사이에서 먼저 끊깁니다. 한 문장이면 마크업 없이 그대로입니다
- 테스트에서 나뉜 문구를 찾을 때: `screen.getByText(sentenceText("저장했어요. 계속할까요?"))`
- 코드 · 링크 사이 조각에 걸 때: `renderSentences(text, { continuesFrom, continuesTo })` - 요소에 이어 붙은 조각을 묶지 않아 요소와 조사가 떨어지지 않습니다
