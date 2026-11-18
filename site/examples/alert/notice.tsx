import { AlertProvider, Button, useAlert } from "@bigtablet/design-system";

function NoticeButton() {
	const { showAlert } = useAlert();
	return (
		<Button
			variant="outline"
			onClick={() =>
				showAlert({
					tone: "info",
					title: "점검 안내",
					message: "오늘 밤 2시부터 30분간 점검합니다.",
				})
			}
		>
			안내 띄우기
		</Button>
	);
}

export default function Example() {
	return (
		<AlertProvider>
			<NoticeButton />
		</AlertProvider>
	);
}
