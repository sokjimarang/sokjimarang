import { beforeAll, afterAll, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// React Testing Library cleanup
afterEach(() => {
  cleanup()
})

// MSW 서버 (필요시 활성화)
// import { server } from './src/__tests__/setup/msw-handlers'
// beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
// afterAll(() => server.close())
// afterEach(() => server.resetHandlers())
