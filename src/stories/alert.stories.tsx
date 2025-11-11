import type { Meta, StoryObj } from "@storybook/react";
import { AlertProvider, useAlert } from "../ui/feedback/alert";

// useAlert를 사용하는 예제 컴포넌트
const AlertDemo = ({
  variant,
  title,
  message,
  showCancel,
  actionsAlign
}: any) => {
  const { showAlert } = useAlert();

  const handleClick = () => {
    showAlert({
      variant,
      title,
      message,
      showCancel,
      actionsAlign,
      onConfirm: () => console.log("확인됨"),
      onCancel: () => console.log("취소됨"),
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <button
        onClick={handleClick}
        style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "14px",
        }}>
        Alert 띄우기
      </button>
    </div>
  );
};

const meta: Meta = {
  title: "Components/Feedback/Alert",
  decorators: [
    (Story) => (
      <AlertProvider>
        <Story />
      </AlertProvider>
    ),
  ],
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "자바스크립트 alert()처럼 화면 위에 뜨는 모달 형태의 Alert입니다. `useAlert` 훅과 `AlertProvider`를 사용합니다.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof AlertDemo>;

export const Info: Story = {
  render: () => (
    <AlertDemo
      variant="info"
      title="알림"
      message="이것은 정보 알림입니다."
      showCancel={false}
    />
  ),
};

export const Success: Story = {
  render: () => (
    <AlertDemo
      variant="success"
      title="성공"
      message="작업이 성공적으로 완료되었습니다."
      showCancel={false}
    />
  ),
};

export const Warning: Story = {
  render: () => (
    <AlertDemo
      variant="warning"
      title="경고"
      message="이 작업을 진행하시겠습니까?"
      showCancel={true}
    />
  ),
};

export const Error: Story = {
  render: () => (
    <AlertDemo
      variant="error"
      title="오류"
      message="작업을 처리하는 중 오류가 발생했습니다."
      showCancel={true}
    />
  ),
};

export const WithCancel: Story = {
  render: () => (
    <AlertDemo
      variant="info"
      title="확인 필요"
      message="이 작업을 계속하시겠습니까?"
      showCancel={true}
    />
  ),
};

export const ActionsLeft: Story = {
  render: () => (
    <AlertDemo
      variant="info"
      title="왼쪽 정렬"
      message="버튼이 왼쪽에 정렬됩니다."
      showCancel={true}
      actionsAlign="left"
    />
  ),
};

export const ActionsCenter: Story = {
  render: () => (
    <AlertDemo
      variant="info"
      title="중앙 정렬"
      message="버튼이 중앙에 정렬됩니다."
      showCancel={true}
      actionsAlign="center"
    />
  ),
};

export const ActionsRight: Story = {
  render: () => (
    <AlertDemo
      variant="info"
      title="오른쪽 정렬"
      message="버튼이 오른쪽에 정렬됩니다."
      showCancel={true}
      actionsAlign="right"
    />
  ),
};

export const LongMessage: Story = {
  render: () => (
    <AlertDemo
      variant="info"
      title="긴 메시지"
      message="이것은 매우 긴 메시지입니다. Alert는 자동으로 메시지의 길이에 맞춰 크기가 조정됩니다. 여러 줄의 텍스트도 잘 표시됩니다."
      showCancel={true}
    />
  ),
};
