import { TextField } from "@bigtablet/design-system";
import { Search } from "lucide-react";

export default function Example() {
	return (
		<div style={{ display: "grid", gap: 16, maxWidth: 360 }}>
			<TextField label="이름" placeholder="홍길동" />
			<TextField label="검색" leadingIcon={<Search size={16} />} clearable />
			<TextField label="비밀번호" type="password" showPasswordToggle />
			<TextField
				label="이메일"
				defaultValue="hello@"
				invalid
				supportingText="이메일 형식이 아닙니다"
			/>
		</div>
	);
}
