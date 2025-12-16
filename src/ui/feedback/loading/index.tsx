import "./style.scss";

export interface LoadingProps {
  size?: number;
}

export const Loading = ({ size = 24 }: LoadingProps) => {
  return (
      <span
          className="loading"
          style={{ width: size, height: size }}
          role="status"
          aria-label="로딩 중"
      />
  );
};