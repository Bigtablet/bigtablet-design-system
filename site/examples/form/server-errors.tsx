import { Button, Field, Form, TextField } from "@bigtablet/design-system";
import { type FormEvent, type ReactNode, useState } from "react";

// 서버가 돌려준 에러를 이름으로 한 번에 넘기면 첫 에러 칸으로 포커스가 갑니다
export default function Example() {
	const [errors, setErrors] = useState<Record<string, ReactNode>>({});
	const submit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setErrors({ email: "이미 가입된 이메일입니다", name: "이름을 입력해 주세요" });
	};
	return (
		<div style={{ maxWidth: 400 }}>
			<Form errors={errors} onSubmit={submit}>
				<Field name="name" label="이름" required>
					<TextField />
				</Field>
				<Field name="email" label="이메일" required>
					<TextField defaultValue="hello@bigtablet.com" />
				</Field>
				<Form.Actions>
					<Button type="submit">가입</Button>
				</Form.Actions>
			</Form>
		</div>
	);
}
