import {
	Button,
	Card,
	Container,
	Dropdown,
	Field,
	Form,
	PageHeader,
	Stack,
	TextField,
	ToastProvider,
	useToast,
} from "@bigtablet/design-system";
import { type FormEvent, type ReactNode, useState } from "react";

function MemberForm() {
	const toast = useToast();
	const [errors, setErrors] = useState<Record<string, ReactNode>>({});
	const submit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const data = new FormData(e.currentTarget);
		const next: Record<string, ReactNode> = {};
		if (!data.get("name")) next.name = "이름을 입력해 주세요";
		if (!data.get("email")) next.email = "이메일을 입력해 주세요";
		if (Object.keys(next).length > 0) {
			// 서버 · 검증 에러는 이름으로 한 번에 넘깁니다 - 첫 에러 칸으로 포커스가 갑니다
			setErrors(next);
			return;
		}
		setErrors({});
		toast.success("구성원을 초대했습니다");
	};
	return (
		<Container size="sm" center={false}>
			<Stack gap={16}>
				<PageHeader title="구성원 초대" description="초대 메일을 보냅니다" />
				<Card>
					<Form errors={errors} onSubmit={submit}>
						<Field name="name" label="이름" required>
							<TextField name="name" />
						</Field>
						<Field name="email" label="이메일" required>
							<TextField name="email" type="email" />
						</Field>
						<Field name="role" label="역할">
							<Dropdown
								name="role"
								options={[
									{ value: "admin", label: "관리자" },
									{ value: "member", label: "구성원" },
								]}
							/>
						</Field>
						<Form.Actions>
							<Button type="submit">초대</Button>
						</Form.Actions>
					</Form>
				</Card>
			</Stack>
		</Container>
	);
}

// 폼 화면 - PageHeader + Card 안 Form · Field, 저장 결과는 Toast. ToastProvider 는 앱 최상위에 한 번 둡니다
export default function Example() {
	return (
		<ToastProvider>
			<MemberForm />
		</ToastProvider>
	);
}
