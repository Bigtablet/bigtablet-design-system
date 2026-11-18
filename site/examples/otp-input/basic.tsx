import { OtpInput } from "@bigtablet/design-system";
import { useState } from "react";

export default function Example() {
	const [code, setCode] = useState("");
	return (
		<OtpInput
			length={6}
			value={code}
			onValueChange={setCode}
			ariaLabel="인증 코드"
			supportingText="문자로 받은 6자리를 입력합니다"
		/>
	);
}
