/**
 * 작은 라벨 3종(Badge · Chip · TagInput)을 고르는 기준 - Storybook meta 설명 전용 문자열.
 *
 * 세 스토리가 같은 표를 싣는다. 같은 패턴: `src/ui/feedback/loading-comparison.docs.ts`.
 * 런타임 코드가 아니다 - `src/index.ts` 에서 export 되지 않아 번들에 들어가지 않는다.
 */
export const LABEL_COMPARISON = [
	"#### 작은 라벨 3종 중 무엇을 쓰나",
	"",
	"| 상황 | 컴포넌트 |",
	"| --- | --- |",
	"| 개수 · 점 · 짧은 상태 표시 (`5`, `99+`, 온라인 점, `New`) - **보기만** 한다 | `Badge` |",
	"| 읽을 거리가 있는 태그·카테고리 (`static`), 또는 누르고 고르고 지우는 토큰 (`filter` · `input`) | `Chip` |",
	"| 사용자가 **목록에 없는 값을 직접 입력**해 여러 개 만든다 (자유 키워드, 사내 라벨) | `TagInput` |",
	"",
	"정해진 후보 중 여러 개를 고르면 `TagInput` 이 아니라 `Dropdown` 의 `multiple` 입니다.",
	"`TagInput` 이 만드는 칩은 `Chip` 의 `static` + `removable` 입니다.",
].join("\n");
