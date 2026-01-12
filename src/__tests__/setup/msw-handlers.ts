import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

const handlers = [
  // Vapi API 모킹 (필요시 추가)
  http.post('https://api.vapi.ai/*', () => {
    return HttpResponse.json({ success: true })
  }),
]

export const server = setupServer(...handlers)

// 에러 핸들러 (테스트에서 사용)
export const errorHandler = http.post('https://api.vapi.ai/*', () => {
  return HttpResponse.json({ error: 'Test error' }, { status: 500 })
})
