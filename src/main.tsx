import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App from './App.tsx';
import './index.css';
// MSW 시작
async function enableMocking() {
  if (import.meta.env.MODE !== 'development') {
    return;
  }
  const { worker } = await import('./mocks/browser');
  return worker.start();
}
// QueryClient 생성
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});
enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
        {/* React Query로 관리되는 서버 상태를 확인할 수 있는 개발자 도구.
 브라우저 우측 하단에 아이콘이 표시되며, 클릭하면 쿼리 캐시 상태를 볼 수 있다.
 프로덕션 환경에서는 보통 제거한다. 제거하려면 해당 행 삭제 */}
      </QueryClientProvider>
    </React.StrictMode>,
  );
});