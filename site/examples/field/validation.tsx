import { Field, TextField } from "@bigtablet/design-system";
import { useState } from "react";

export default function Example() {
	const [email, setEmail] = useState("");
	const [touched, setTouched] = useState(false);
	const emailError = touched && !email.includes("@") ? "이메일 형식이 아닙니다" : undefined;
	return (
		<div style={{ maxWidth: 360 }}>
			<Field name="email" label="이메일" required help="업무용 주소를 적습니다" error={emailError}>
				<TextField value={email} onValueChange={setEmail} onBlur={() => setTouched(true)} />
			</Field>
		</div>
	);
}
