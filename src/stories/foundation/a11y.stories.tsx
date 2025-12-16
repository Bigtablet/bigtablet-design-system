import type {Meta, StoryObj} from "@storybook/react";
import {a11y} from "src/styles/ts/a11y";

const meta: Meta = {
    title: "foundation/a11y",
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component: `
### 접근성 (Accessibility) 토큰

이 토큰들은 **키보드 사용자, 저시력 사용자, 터치 사용자**를 고려해  
모든 인터랙션이 **명확하고 안전하게 인식되도록** 돕는 기준값입니다.

👉 “보이지 않는 규칙”을 **눈으로 확인할 수 있도록** 예시와 함께 제공합니다.
        `,
            },
        },
    },
};

export default meta;
type Story = StoryObj;

export const Overview: Story = {
    name: "접근성 기준 한눈에 보기",
    render: () => (
        <div style={{display: "grid", gap: 24, maxWidth: 720}}>
            {/* Focus Ring */}
            <section>
                <h3>포커스 표시 (Focus Ring)</h3>
                <p style={{opacity: 0.8}}>
                    키보드(Tab)로 이동할 때, 현재 위치를 명확히 보여주는 시각적 표시입니다.
                </p>

                <div style={{display: "flex", gap: 16, marginTop: 12}}>
                    <button style={focusButtonStyle(a11y.focusRing)}>
                        기본 포커스
                    </button>
                    <button style={focusButtonStyle(a11y.focusRingError)}>
                        에러 상태
                    </button>
                    <button style={focusButtonStyle(a11y.focusRingSuccess)}>
                        성공 상태
                    </button>
                </div>

                <ul style={{marginTop: 12, fontSize: 13, opacity: 0.8}}>
                    <li><code>focusRing</code> : 기본 인터랙션 포커스</li>
                    <li><code>focusRingError</code> : 오류 상황 강조</li>
                    <li><code>focusRingSuccess</code> : 완료 / 정상 상태 강조</li>
                </ul>
            </section>

            {/* Tap size */}
            <section>
                <h3>최소 터치 영역 (Tap Target)</h3>
                <p style={{opacity: 0.8}}>
                    모바일에서 손가락으로 누르기 충분한 최소 크기 기준입니다.
                </p>

                <div style={{display: "flex", alignItems: "center", gap: 24, marginTop: 12}}>
                    <div
                        style={{
                            width: a11y.tapMinSize,
                            height: a11y.tapMinSize,
                            background: "#000",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                        }}
                    >
                        44px
                    </div>
                    <span style={{fontSize: 13, opacity: 0.8}}>
            버튼·아이콘은 최소 <strong>44×44px</strong> 이상 권장
          </span>
                </div>
            </section>
        </div>
    ),
};

function focusButtonStyle(boxShadow: string) {
    return {
        padding: "10px 16px",
        borderRadius: 8,
        border: "1px solid #e5e5e5",
        background: "#fff",
        boxShadow,
        cursor: "pointer",
    } as React.CSSProperties;
}