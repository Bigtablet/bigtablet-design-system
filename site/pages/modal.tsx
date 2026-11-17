import type { DocPage } from "../docs";

export const modal: DocPage = {
	slug: "modal",
	category: "오버레이",
	order: 0,
	title: "Modal",
	name: "모달",
	summary:
		"화면 가운데에 뜨는 대화 상자입니다. 포커스 트랩 · Esc 닫기 · 배경 스크롤 잠금을 자동으로 처리합니다.",
	when: [
		["폼 · 상세 내용처럼 자유로운 내용을 화면 위에 띄움", "Modal", true],
		['삭제 확인처럼 "예 / 아니요" 만 받으면 됨', "useConfirm", false],
		["옆에서 나와 뒤 화면을 일부 보여 줌, 모바일 하단 시트", "Drawer", false],
		["결과를 잠깐 알림", "Toast", false],
	],
	examples: [
		{ id: "modal/basic", title: "기본", desc: "`footer` 에 버튼을 넣으면 오른쪽 정렬됩니다." },
		{ id: "modal/form", title: "폼 넣기", desc: "열리면 본문 첫 입력에 포커스가 갑니다." },
	],
	props: "ModalProps",
	notes: [
		"`document.body` 로 포털 렌더됩니다 - 부모의 `overflow: hidden` 에 잘리지 않습니다",
		"닫히는 모션이 끝날 때까지 DOM 에 남습니다. 본문 데이터는 `onExited` 에서 비웁니다",
	],
};
