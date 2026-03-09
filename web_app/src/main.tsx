// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { IS_LOGGER_READY } from './config/env.config'

// 전역 콘솔 로그 차단 (배포/무음 모드)
// - createLogger()를 쓰지 않고 직접 console.log 하는 코드까지 모두 막기 위함
// - console.error는 남겨두어 치명적인 에러 확인은 가능하게 함
if (IS_LOGGER_READY) {
  const noop = () => {}
  ;(console as any).log = noop
  ;(console as any).info = noop
  ;(console as any).debug = noop
  ;(console as any).warn = noop
}

createRoot(document.getElementById('root')!).render(
  // StrictMode는 개발 중 중복 렌더링을 유발할 수 있어 비활성화
  // 프로덕션 빌드에서는 자동으로 제거됨
  // <StrictMode>
    <App />
  // </StrictMode>,
)
