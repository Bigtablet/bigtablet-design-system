import type { DocPage } from "../docs";

export const modal: DocPage = {
	slug: "modal",
	category: "오버레이",
	order: 0,
	title: "Modal",
	name: "모달",
	summary:
		"화면 위쪽(가로 가운데)에 뜨는 대화 상자입니다. 포커스 트랩 · Esc 닫기 · 배경 스크롤 잠금을 자동으로 처리합니다.",
	when: [
		["폼 · 상세 내용처럼 자유로운 내용을 화면 위에 띄움", "Modal", true],
		['삭제 확인처럼 "예 / 아니요" 만 받으면 됨', "useConfirm", false],
		["옆에서 나와 뒤 화면을 일부 보여 줌, 모바일 하단 시트", "Drawer", false],
		["결과를 잠깐 알림", "Toast", false],
	],
	examples: [
		{
			id: "modal/basic",
			open: true,
			title: "기본",
			desc: "`footer` 에 버튼을 넣으면 오른쪽 정렬됩니다.",
		},
		{ id: "modal/form", title: "폼 넣기", desc: "열리면 본문 첫 입력에 포커스가 갑니다." },
		{
			id: "modal/steps",
			title: "단계 바꾸기",
			desc: "`ModalSteps` 로 같은 창 안에서 단계를 바꿉니다. 높이가 이어서 바뀌고 새 단계가 옆에서 들어옵니다.",
		},
	],
	props: ["ModalProps", "ModalStepsProps", "ModalStepProps"],
	notes: [
		"`document.body` 로 포털로 렌더되어 부모의 `overflow: hidden` 에 잘리지 않습니다",
		"패널 윗변은 화면 위쪽 15% 자리에 고정되고 아래로만 자랍니다 - 오류 안내가 나타나도 모달이 튀지 않습니다",
		"닫히는 모션이 끝날 때까지 DOM 에 남습니다. 본문 데이터는 `onExited` 에서 비웁니다",
		"단계를 바꾸면 포커스가 새 단계로 가고, 돌아가면 그 단계에서 마지막으로 있던 자리로 돌아옵니다. 숨긴 단계도 마운트된 채라 입력한 값이 남습니다",
		"첫 단계로 되돌리기는 `onExited` 에서 합니다 - 닫히는 동안 되돌아가는 움직임이 보이지 않습니다",
	],
};
