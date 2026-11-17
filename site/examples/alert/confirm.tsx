import { AlertProvider, Button, useConfirm } from "@bigtablet/design-system";
import { useState } from "react";

function DeleteButton() {
	const confirm = useConfirm();
	const [result, setResult] = useState("");
	return (
		<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
			<Button
				danger
				onClick={async () => {
					const ok = await confirm({
						tone: "error",
						title: "프로젝트를 삭제할까요?",
						message: "삭제하면 되돌릴 수 없습니다.",
						confirmText: "삭제",
						destructive: true,
					});
					setResult(ok ? "삭제했습니다" : "취소했습니다");
				}}
			>
				삭제
			</Button>
			<span>{result}</span>
		</div>
	);
}

// 앱에서는 AlertProvider 를 최상위에 한 번 둡니다
export default function Example() {
	return (
		<AlertProvider>
			<DeleteButton />
		</AlertProvider>
	);
}
