import type { Meta, StoryObj } from "@storybook/react";
import { Filter, Lock, Mail, Search, User } from "lucide-react";
import { useState } from "react";
import { Button } from "../../ui/button";
import { Checkbox } from "../../ui/checkbox";
import { Chip } from "../../ui/chip";
import { Divider } from "../../ui/divider";
import { Dropdown } from "../../ui/dropdown";
import { Radio } from "../../ui/radio";
import { Stack } from "../../ui/stack";
import { TextField } from "../../ui/textfield";
import { Toggle } from "../../ui/toggle";

const meta: Meta = {
	title: "Guide/Cookbook/Form Patterns",
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"**폼 패턴 cookbook** — 로그인·가입·검색·설정 등 실제 화면에서 자주 쓰는 폼 조합을 그대로 복사해 사용할 수 있도록 정리한 레시피 모음입니다.\n\n각 예시는 Stack 레이아웃 프리미티브와 입력 컴포넌트만으로 self-contained되어 있어 import 후 바로 붙여 넣을 수 있습니다.",
			},
		},
	},
};

export default meta;
type Story = StoryObj;

// 공통 카드 래퍼 — 코드에 영향을 주지 않는 스토리북 디스플레이용
const FormCard = ({
	title,
	width = 400,
	children,
}: {
	title: string;
	width?: number;
	children: React.ReactNode;
}) => (
	<div
		style={{
			width,
			background: "#fff",
			borderRadius: 16,
			border: "1px solid #E5E5E5",
			padding: "28px 24px",
			boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04), 0 8px 24px rgba(15, 23, 42, 0.04)",
		}}
	>
		<h3
			style={{
				margin: "0 0 20px",
				fontSize: 18,
				fontWeight: 700,
				color: "#121212",
				letterSpacing: "-0.01em",
			}}
		>
			{title}
		</h3>
		{children}
	</div>
);

// ─── Login Form ─────────────────────────────────────────────────────────────

export const LoginForm: Story = {
	name: "로그인 폼",
	render: () => {
		const [email, setEmail] = useState("");
		const [password, setPassword] = useState("");
		const [remember, setRemember] = useState(true);

		return (
			<FormCard title="로그인">
				<Stack gap={16}>
					<TextField
						label="이메일"
						type="email"
						placeholder="you@example.com"
						leadingIcon={<Mail size={18} />}
						value={email}
						onChangeAction={setEmail}
						fullWidth
					/>
					<TextField
						label="비밀번호"
						type="password"
						placeholder="비밀번호 입력"
						leadingIcon={<Lock size={18} />}
						value={password}
						onChangeAction={setPassword}
						fullWidth
					/>

					<Stack direction="horizontal" justify="between" align="center" gap={8}>
						<Checkbox
							label="로그인 상태 유지"
							checked={remember}
							onChange={(e) => setRemember(e.target.checked)}
						/>
						<button
							type="button"
							style={{
								background: "none",
								border: "none",
								padding: 0,
								color: "#47555E",
								fontSize: 13,
								fontWeight: 500,
								cursor: "pointer",
								textDecoration: "underline",
							}}
						>
							비밀번호 찾기
						</button>
					</Stack>

					<Button variant="filled" size="lg" fullWidth>
						로그인
					</Button>

					<Divider />

					<Stack direction="horizontal" justify="center" gap={4} align="center">
						<span style={{ fontSize: 13, color: "#666" }}>아직 계정이 없으신가요?</span>
						<button
							type="button"
							style={{
								background: "none",
								border: "none",
								padding: 0,
								color: "#303841",
								fontSize: 13,
								fontWeight: 600,
								cursor: "pointer",
							}}
						>
							회원가입
						</button>
					</Stack>
				</Stack>
			</FormCard>
		);
	},
};

// ─── Sign Up Form ───────────────────────────────────────────────────────────

export const SignUpForm: Story = {
	name: "회원가입 폼",
	render: () => {
		const [form, setForm] = useState({
			name: "",
			email: "",
			password: "",
			passwordConfirm: "",
		});
		const [agreed, setAgreed] = useState(false);

		const passwordMismatch =
			form.password.length > 0 &&
			form.passwordConfirm.length > 0 &&
			form.password !== form.passwordConfirm;

		return (
			<FormCard title="회원가입" width={440}>
				<Stack gap={16}>
					<TextField
						label="이름"
						placeholder="홍길동"
						leadingIcon={<User size={18} />}
						value={form.name}
						onChangeAction={(v) => setForm({ ...form, name: v })}
						fullWidth
					/>
					<TextField
						label="이메일"
						type="email"
						placeholder="you@example.com"
						leadingIcon={<Mail size={18} />}
						value={form.email}
						onChangeAction={(v) => setForm({ ...form, email: v })}
						fullWidth
					/>
					<TextField
						label="비밀번호"
						type="password"
						placeholder="8자 이상 영문·숫자 포함"
						leadingIcon={<Lock size={18} />}
						supportingText="영문, 숫자, 특수문자 조합 8자 이상"
						value={form.password}
						onChangeAction={(v) => setForm({ ...form, password: v })}
						fullWidth
					/>
					<TextField
						label="비밀번호 확인"
						type="password"
						placeholder="비밀번호 재입력"
						leadingIcon={<Lock size={18} />}
						value={form.passwordConfirm}
						onChangeAction={(v) => setForm({ ...form, passwordConfirm: v })}
						error={passwordMismatch}
						supportingText={passwordMismatch ? "비밀번호가 일치하지 않습니다" : undefined}
						fullWidth
					/>

					<Divider />

					<Checkbox
						label={
							<span style={{ fontSize: 13 }}>
								<a
									href="#terms"
									style={{ color: "#303841", textDecoration: "underline" }}
								>
									이용약관
								</a>{" "}
								및{" "}
								<a
									href="#privacy"
									style={{ color: "#303841", textDecoration: "underline" }}
								>
									개인정보처리방침
								</a>
								에 동의합니다
							</span>
						}
						checked={agreed}
						onChange={(e) => setAgreed(e.target.checked)}
					/>

					<Button
						variant="filled"
						size="lg"
						fullWidth
						disabled={!agreed || passwordMismatch}
					>
						가입 완료
					</Button>
				</Stack>
			</FormCard>
		);
	},
};

// ─── Search with Filter ─────────────────────────────────────────────────────

export const SearchWithFilter: Story = {
	name: "검색 + 필터",
	render: () => {
		const [keyword, setKeyword] = useState("");
		const [sort, setSort] = useState<string | null>("newest");
		const [activeFilters, setActiveFilters] = useState<string[]>([
			"카페",
			"서울",
		]);

		const removeFilter = (label: string) =>
			setActiveFilters((prev) => prev.filter((item) => item !== label));

		return (
			<div
				style={{
					width: 600,
					background: "#fff",
					borderRadius: 16,
					border: "1px solid #E5E5E5",
					padding: "24px",
					boxShadow:
						"0 1px 3px rgba(15, 23, 42, 0.04), 0 8px 24px rgba(15, 23, 42, 0.04)",
				}}
			>
				<Stack gap={16}>
					<Stack direction="horizontal" gap={12} align="end">
						<div style={{ flex: 1 }}>
							<TextField
								label="검색"
								placeholder="매장 이름·지역으로 검색"
								leadingIcon={<Search size={18} />}
								value={keyword}
								onChangeAction={setKeyword}
								clearable
								fullWidth
							/>
						</div>
						<div style={{ width: 160 }}>
							<Dropdown
								label="정렬"
								value={sort}
								onChange={(v) => setSort(v)}
								options={[
									{ value: "newest", label: "최신순" },
									{ value: "rating", label: "평점순" },
									{ value: "popular", label: "인기순" },
									{ value: "nearby", label: "가까운 순" },
								]}
								fullWidth
							/>
						</div>
					</Stack>

					<Stack direction="horizontal" gap={8} align="center" wrap="wrap">
						<Chip
							type="static"
							size="sm"
							tone="default"
							leadingIcon={<Filter size={14} />}
							label="활성 필터"
						/>
						{activeFilters.map((filter) => (
							<Chip
								key={filter}
								type="input"
								size="sm"
								label={filter}
								removable
								onRemove={() => removeFilter(filter)}
							/>
						))}
						{activeFilters.length > 0 && (
							<button
								type="button"
								onClick={() => setActiveFilters([])}
								style={{
									background: "none",
									border: "none",
									padding: 0,
									marginLeft: 4,
									color: "#666",
									fontSize: 12,
									fontWeight: 500,
									cursor: "pointer",
									textDecoration: "underline",
								}}
							>
								모두 지우기
							</button>
						)}
					</Stack>
				</Stack>
			</div>
		);
	},
};

// ─── Settings Section ───────────────────────────────────────────────────────

export const SettingsSection: Story = {
	name: "설정 섹션",
	render: () => {
		const [displayName, setDisplayName] = useState("박상민");
		const [contactEmail, setContactEmail] = useState("sangmin@bigtablet.com");
		const [notifyEmail, setNotifyEmail] = useState(true);
		const [notifyPush, setNotifyPush] = useState(false);
		const [notifySms, setNotifySms] = useState(false);
		const [theme, setTheme] = useState("system");

		return (
			<FormCard title="계정 설정" width={520}>
				<Stack gap={24}>
					{/* 프로필 */}
					<Stack gap={12}>
						<p
							style={{
								margin: 0,
								fontSize: 13,
								fontWeight: 600,
								color: "#888",
								textTransform: "uppercase",
								letterSpacing: "0.04em",
							}}
						>
							프로필
						</p>
						<TextField
							label="표시 이름"
							value={displayName}
							onChangeAction={setDisplayName}
							fullWidth
						/>
						<TextField
							label="연락처 이메일"
							type="email"
							value={contactEmail}
							onChangeAction={setContactEmail}
							fullWidth
						/>
					</Stack>

					<Divider />

					{/* 알림 */}
					<Stack gap={12}>
						<p
							style={{
								margin: 0,
								fontSize: 13,
								fontWeight: 600,
								color: "#888",
								textTransform: "uppercase",
								letterSpacing: "0.04em",
							}}
						>
							알림
						</p>
						<Stack direction="horizontal" justify="between" align="center">
							<Stack gap={2}>
								<span style={{ fontSize: 14, fontWeight: 500, color: "#121212" }}>
									이메일 알림
								</span>
								<span style={{ fontSize: 12, color: "#888" }}>
									주문·정산 등 주요 활동을 이메일로 받아보기
								</span>
							</Stack>
							<Toggle
								ariaLabel="이메일 알림"
								checked={notifyEmail}
								onChange={setNotifyEmail}
								size="md"
							/>
						</Stack>
						<Stack direction="horizontal" justify="between" align="center">
							<Stack gap={2}>
								<span style={{ fontSize: 14, fontWeight: 500, color: "#121212" }}>
									푸시 알림
								</span>
								<span style={{ fontSize: 12, color: "#888" }}>
									앱에서 실시간 푸시 알림 수신
								</span>
							</Stack>
							<Toggle
								ariaLabel="푸시 알림"
								checked={notifyPush}
								onChange={setNotifyPush}
								size="md"
							/>
						</Stack>
						<Stack direction="horizontal" justify="between" align="center">
							<Stack gap={2}>
								<span style={{ fontSize: 14, fontWeight: 500, color: "#121212" }}>
									SMS 알림
								</span>
								<span style={{ fontSize: 12, color: "#888" }}>
									긴급 알림만 SMS로 발송
								</span>
							</Stack>
							<Toggle
								ariaLabel="SMS 알림"
								checked={notifySms}
								onChange={setNotifySms}
								size="md"
							/>
						</Stack>
					</Stack>

					<Divider />

					{/* 테마 */}
					<Stack gap={12}>
						<p
							style={{
								margin: 0,
								fontSize: 13,
								fontWeight: 600,
								color: "#888",
								textTransform: "uppercase",
								letterSpacing: "0.04em",
							}}
						>
							테마
						</p>
						<Stack gap={8}>
							<Radio
								name="theme"
								label="시스템 설정 따르기"
								value="system"
								checked={theme === "system"}
								onChange={(e) => setTheme(e.target.value)}
							/>
							<Radio
								name="theme"
								label="라이트 모드"
								value="light"
								checked={theme === "light"}
								onChange={(e) => setTheme(e.target.value)}
							/>
							<Radio
								name="theme"
								label="다크 모드"
								value="dark"
								checked={theme === "dark"}
								onChange={(e) => setTheme(e.target.value)}
							/>
						</Stack>
					</Stack>

					<Stack direction="horizontal" justify="end" gap={8}>
						<Button variant="outline" size="md">
							취소
						</Button>
						<Button variant="filled" size="md">
							저장
						</Button>
					</Stack>
				</Stack>
			</FormCard>
		);
	},
};
