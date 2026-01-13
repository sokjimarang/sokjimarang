import { test, expect } from '@playwright/test'

/**
 * 온보딩 완료 상태의 localStorage 설정을 위한 헬퍼 함수
 * zustand persist 미들웨어의 실제 저장 구조를 반영
 */
function getOnboardedUserStorage() {
  return JSON.stringify({
    state: {
      hasCompletedOnboarding: true,
      agreedToTerms: true,
      context: {},
    },
    version: 0,
  })
}

function getOnboardedTrainingStorage() {
  return JSON.stringify({
    state: {
      sessions: [],
      selectedScenario: 'random',
      selectedPresetId: null,
    },
    version: 0,
  })
}

test.describe('홈 화면', () => {
  test.beforeEach(async ({ page }) => {
    // localStorage에 온보딩 완료 상태 설정 후 페이지 이동
    await page.addInitScript(() => {
      localStorage.setItem(
        'sokjimarang-user',
        JSON.stringify({
          state: {
            hasCompletedOnboarding: true,
            agreedToTerms: true,
            context: {},
          },
          version: 0,
        })
      )
      localStorage.setItem(
        'sokjimarang-training',
        JSON.stringify({
          state: {
            sessions: [],
            selectedScenario: 'random',
            selectedPresetId: null,
          },
          version: 0,
        })
      )
    })
    await page.goto('/')
  })

  test('홈 화면 기본 요소 렌더링', async ({ page }) => {
    // 헤더
    await expect(page.getByText('속지마랑')).toBeVisible()
    await expect(page.getByText('보이스피싱 예방 훈련')).toBeVisible()

    // 프리셋 섹션
    await expect(page.getByText('내 정보 선택')).toBeVisible()

    // 시나리오 섹션
    await expect(page.getByText('시나리오 선택')).toBeVisible()

    // CTA 버튼
    await expect(page.getByRole('button', { name: /전화하기/ })).toBeVisible()
  })

  test('프리셋 카루셀에 프리셋 카드 표시', async ({ page }) => {
    // 프리셋 카드 확인 (프리셋 1, 프리셋 2)
    await expect(page.getByText('프리셋 1')).toBeVisible()

    // 프리셋 설명 텍스트 확인 (50대 / 서울 / 자녀 2명)
    await expect(page.getByText(/50대/)).toBeVisible()
  })

  test('시나리오 카루셀에 시나리오 카드 표시', async ({ page }) => {
    // MVP에서는 prosecutor 시나리오만 표시
    await expect(page.getByText('검찰 사칭')).toBeVisible()
  })

  test('초기 상태에서 CTA 버튼 비활성화', async ({ page }) => {
    const ctaButton = page.getByRole('button', { name: /전화하기/ })
    await expect(ctaButton).toBeDisabled()
  })

  test('프리셋만 선택 시 CTA 버튼 여전히 비활성화', async ({ page }) => {
    // 프리셋 1 선택
    await page.getByText('프리셋 1').click()

    // CTA 버튼 여전히 비활성화
    const ctaButton = page.getByRole('button', { name: /전화하기/ })
    await expect(ctaButton).toBeDisabled()
  })

  test('시나리오만 선택 시 CTA 버튼 여전히 비활성화', async ({ page }) => {
    // 시나리오 선택
    await page.getByText('검찰 사칭').click()

    // CTA 버튼 여전히 비활성화
    const ctaButton = page.getByRole('button', { name: /전화하기/ })
    await expect(ctaButton).toBeDisabled()
  })

  test('프리셋 + 시나리오 모두 선택 시 CTA 버튼 활성화', async ({ page }) => {
    // 프리셋 선택
    await page.getByText('프리셋 1').click()

    // 시나리오 선택
    await page.getByText('검찰 사칭').click()

    // CTA 버튼 활성화 확인
    const ctaButton = page.getByRole('button', { name: /전화하기/ })
    await expect(ctaButton).toBeEnabled()
  })

  test('프리셋 카드 선택 시 체크 표시 (선택 스타일)', async ({ page }) => {
    // 프리셋 1 선택
    await page.getByText('프리셋 1').click()

    // 선택된 카드의 스타일 확인 (border-blue-500 클래스)
    const selectedCard = page.locator('button:has-text("프리셋 1")')
    await expect(selectedCard).toHaveClass(/border-blue-500/)
  })

  test('시나리오 카드 선택 시 체크 표시 (선택 스타일)', async ({ page }) => {
    // 시나리오 선택
    await page.getByText('검찰 사칭').click()

    // 선택된 카드의 스타일 확인
    const selectedCard = page.locator('button:has-text("검찰 사칭")')
    await expect(selectedCard).toHaveClass(/border-blue-500/)
  })

  test('프리셋 선택 시 userStore에 context 저장', async ({ page }) => {
    // 프리셋 1 선택 (50대 / 서울 / 자녀 2명)
    await page.getByText('프리셋 1').click()

    // localStorage에 context 저장 확인
    const storage = await page.evaluate(() =>
      localStorage.getItem('sokjimarang-user')
    )
    expect(storage).toContain('50s')
    expect(storage).toContain('seoul')
  })

  test('선택 상태가 localStorage에 persist', async ({ page }) => {
    // 프리셋 + 시나리오 선택
    await page.getByText('프리셋 1').click()
    await page.getByText('검찰 사칭').click()

    // localStorage에 선택 상태 저장 확인
    const trainingStorage = await page.evaluate(() =>
      localStorage.getItem('sokjimarang-training')
    )
    expect(trainingStorage).toContain('preset-1')
    expect(trainingStorage).toContain('prosecutor')
  })
})

test.describe('홈 화면 Swiper 카루셀', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'sokjimarang-user',
        JSON.stringify({
          state: {
            hasCompletedOnboarding: true,
            agreedToTerms: true,
            context: {},
          },
          version: 0,
        })
      )
      localStorage.setItem(
        'sokjimarang-training',
        JSON.stringify({
          state: {
            sessions: [],
            selectedScenario: 'random',
            selectedPresetId: null,
          },
          version: 0,
        })
      )
    })
    await page.goto('/')
  })

  test('프리셋 카루셀 Swiper 컨테이너 렌더링', async ({ page }) => {
    // Swiper 컨테이너 존재 확인
    const swiperContainer = page.locator('.swiper').first()
    await expect(swiperContainer).toBeVisible()
  })

  test('프리셋 카루셀에서 두 번째 카드로 스와이프', async ({ page }) => {
    // 프리셋 카루셀 영역 찾기
    const presetSection = page.locator('section:has-text("내 정보 선택")')
    const swiper = presetSection.locator('.swiper')

    // Swiper가 렌더링될 때까지 대기
    await expect(swiper).toBeVisible()

    // 스와이프 동작 시뮬레이션 (왼쪽으로 드래그)
    const box = await swiper.boundingBox()
    if (box) {
      await page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2)
      await page.mouse.down()
      await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2, {
        steps: 10,
      })
      await page.mouse.up()
    }

    // 프리셋 2가 보이는지 확인 (이미 1.3개 노출이라 보일 수 있음)
    await expect(page.getByText('프리셋 2')).toBeVisible()
  })

  test('시나리오 카루셀 Swiper 컨테이너 렌더링', async ({ page }) => {
    // 시나리오 섹션의 Swiper 컨테이너 확인
    const scenarioSection = page.locator('section:has-text("시나리오 선택")')
    const swiper = scenarioSection.locator('.swiper')
    await expect(swiper).toBeVisible()
  })
})
