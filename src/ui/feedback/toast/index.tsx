"use client";

import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export interface ToastProviderProps {
  containerId?: string;
}

/**
 * 토스트 컨테이너를 렌더링한다.
 * 기본 옵션을 설정하고 전역 토스트 표시 영역을 제공한다.
 * @param props 토스트 컨테이너 속성
 * @returns 렌더링된 토스트 컨테이너
 */
export const ToastProvider = ({ containerId = "default" }: ToastProviderProps) => {
  return (
      <ToastContainer
          containerId={containerId}
          position="top-right"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          transition={Slide}
      />
  );
};
