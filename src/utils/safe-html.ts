/**
 * 컴포넌트 props 에서 `dangerouslySetInnerHTML` 을 뺀다 (시큐어코딩 가이드 W-1-4-6).
 *
 * DS 컴포넌트는 나머지 props 를 루트 요소에 펼치므로, HTML 속성 타입을 그대로 확장하면
 * `<Button dangerouslySetInnerHTML={{ __html: input }} />` 가 타입 검사를 통과해 그대로 DOM 에
 * 닿는다. 마크업이 필요하면 `children` 으로 넘긴다.
 *
 * 새 컴포넌트는 `React.*HTMLAttributes<…>` 를 직접 확장하지 말고 이 타입으로 감싼다 -
 * `safe-html.type-test.ts` 가 공개 export 전체를 검사해 빠진 곳을 tsc 에러로 잡는다.
 */
export type SafeHTMLProps<P> = Omit<P, "dangerouslySetInnerHTML">;
