/**
 * 알림 3종(Alert · InlineAlert · Toast)을 고르는 기준 - Storybook meta 설명 전용 문자열.
 *
 * 세 스토리가 같은 표를 싣는다. 어느 컴포넌트로 들어와도 셋을 한 번에 비교할 수 있게 하려는 것이다.
 * 같은 패턴: `loading-comparison.docs.ts`.
 *
 * 런타임 코드가 아니다 - `src/index.ts` 에서 export 되지 않아 번들에 들어가지 않는다.
 */
export const NOTICE_COMPARISON = [
	"#### 알림 3종 중 무엇을 쓰나",
	"",
	"| 상황 | 컴포넌트 |",
	"| --- | --- |",
	"| 진행 전에 **확인을 받아야** 함 - 화면을 막고 답을 기다린다 (삭제 확인, 저장 안 한 변경) | `Alert` (`useAlert` · `useConfirm`) |",
	"| 화면의 한 부분에 **남아서 읽혀야** 하는 안내 (만료 예정, 점검, 저장 결과) | `InlineAlert` |",
	"| 방금 한 일의 결과를 **잠깐 알리고 사라짐** - 화면을 막지 않는다 (저장됨, 복사됨) | `Toast` (`useToast`) |",
	"",
	"세 컴포넌트 모두 의미 색은 `tone`(`info`·`success`·`warning`·`error`)으로 고릅니다.",
	"화면·위젯 **전체**가 비었거나 불러오기에 실패했으면 셋이 아니라 `EmptyState` · `ErrorState` 입니다.",
].join("\n");
