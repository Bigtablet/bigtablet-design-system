import { Button, ToastProvider, useToast } from "@bigtablet/design-system";

function Buttons() {
	const toast = useToast();
	return (
		<div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
			<Button onClick={() => toast.success("저장했습니다")}>성공</Button>
			<Button variant="outline" onClick={() => toast.error("저장하지 못했습니다")}>
				실패
			</Button>
			<Button
				variant="outline"
				onClick={() => {
					const id = toast.info("업로드 중…", { duration: Infinity });
					setTimeout(
						() => toast.update(id, { tone: "success", message: "업로드 완료", duration: 3000 }),
						1500,
					);
				}}
			>
				진행 → 완료
			</Button>
			{/* 같은 id 는 새로 쌓지 않고 갱신한다 - 연달아 눌러도 하나만 남고 남은 시간을 다시 센다 */}
			<Button
				variant="outline"
				onClick={() => toast.success("설정을 저장했습니다.", { id: "settings-save" })}
			>
				같은 토스트 갱신
			</Button>
		</div>
	);
}

// 앱에서는 ToastProvider 를 최상위에 한 번 둡니다
export default function Example() {
	return (
		<ToastProvider>
			<Buttons />
		</ToastProvider>
	);
}
