/**
 * 파일 입력 둘을 고르는 기준 - Storybook meta 설명 전용 문자열.
 *
 * `FileInput` 과 `ImageCropper` 는 둘 다 "파일을 올리기 전" 단계라 헷갈린다.
 * 갈림길은 **영역을 정해야 하는가** 다.
 *
 * 런타임 코드가 아니다 - `src/index.ts` 에서 export 되지 않아 번들에 들어가지 않는다.
 */
export const UPLOAD_COMPARISON = [
	"#### 파일을 받는 두 방법",
	"",
	"| 상황 | 컴포넌트 |",
	"| --- | --- |",
	"| 파일을 **고르게만** 할 때 (첨부, 문서, 여러 개) | `FileInput` |",
	"| 프로필 사진처럼 **보일 영역을 정해서** 올릴 때 | `ImageCropper` |",
	"",
	"**둘 다 업로드하지 않습니다.** `FileInput` 은 `onFiles(files)` 로 `File` 을 넘기고,",
	"`ImageCropper` 는 `ref.crop()` 이 잘린 `Blob` 을 돌려줍니다 - 전송은 화면의 API 호출입니다.",
	"",
	"`ImageCropper` 는 모달을 포함하지 않습니다. `Modal` 로 감싸고 적용 버튼에서",
	"`ref.crop()` 을 부르는 조합이 기본 사용법입니다.",
].join("\n");
