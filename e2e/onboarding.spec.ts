import { test, expect } from '@playwright/test'

test.describe('온보딩 플로우', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
  })

  test('온보딩 미완료 시 온보딩 페이지로 리다이렉트', async ({ page }) => {
    await expect(page).toHaveURL(/onboarding/)
  })

  test('온보딩 4페이지 네비게이션', async ({ page }) => {
    await page.goto('/onboarding')

    // 페이지 1: 보이스피싱 설명
    await expect(page.getByText('보이스피싱, 겪어봐야 압니다')).toBeVisible()
    await expect(page.getByText('매년 3,000억원 이상')).toBeVisible()

    // 다음 버튼 클릭
    await page.getByRole('button', { name: '다음' }).click()

    // 페이지 2: AI 사기범 역할
    await expect(page.getByText('AI가 사기범 역할을 합니다')).toBeVisible()

    await page.getByRole('button', { name: '다음' }).click()

    // 페이지 3: 훈련 안내
    await expect(page.getByText('속아도 괜찮습니다')).toBeVisible()

    await page.getByRole('button', { name: '다음' }).click()

    // 페이지 4: 동의 화면
    await expect(page.getByText('서비스 이용을 위해')).toBeVisible()
    await expect(page.getByText('다음에 동의해주세요')).toBeVisible()
  })

  test('동의 체크박스 4개 확인 (모두 동의 + 개별 3개)', async ({ page }) => {
    await page.goto('/onboarding')

    // 페이지 4로 이동
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: '다음' }).click()
    }

    // 체크박스 4개 확인 (모두 동의 1개 + 개별 3개)
    const checkboxes = page.getByRole('checkbox')
    await expect(checkboxes).toHaveCount(4)

    // 모두 동의 라벨 확인
    await expect(page.getByText('모두 동의')).toBeVisible()

    // 시작 버튼 비활성화 상태 확인
    const startButton = page.getByRole('button', { name: '동의하고 시작' })
    await expect(startButton).toBeDisabled()
  })

  test('모두 동의 체크 시 전체 선택 및 시작 버튼 활성화', async ({ page }) => {
    await page.goto('/onboarding')

    // 페이지 4로 이동
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: '다음' }).click()
    }

    // 모두 동의 체크박스 클릭
    const agreeAllCheckbox = page.getByRole('checkbox').first()
    await agreeAllCheckbox.check()

    // 모든 체크박스가 선택되었는지 확인
    const checkboxes = page.getByRole('checkbox')
    for (const checkbox of await checkboxes.all()) {
      await expect(checkbox).toBeChecked()
    }

    // 시작 버튼 활성화 확인
    const startButton = page.getByRole('button', { name: '동의하고 시작' })
    await expect(startButton).toBeEnabled()
  })

  test('개별 동의 체크박스 선택으로 시작 버튼 활성화', async ({ page }) => {
    await page.goto('/onboarding')

    // 페이지 4로 이동
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: '다음' }).click()
    }

    // 시작 버튼 비활성화 상태 확인
    const startButton = page.getByRole('button', { name: '동의하고 시작' })
    await expect(startButton).toBeDisabled()

    // 개별 체크박스 3개만 선택 (모두 동의 제외)
    const checkboxes = page.getByRole('checkbox')
    const allCheckboxes = await checkboxes.all()
    for (let i = 1; i < allCheckboxes.length; i++) {
      await allCheckboxes[i].check()
    }

    // 시작 버튼 활성화 확인
    await expect(startButton).toBeEnabled()
  })

  test('동의 항목 라벨 확인', async ({ page }) => {
    await page.goto('/onboarding')

    // 페이지 4로 이동
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: '다음' }).click()
    }

    // 동의 항목 라벨 확인
    await expect(page.getByText('(필수) 서비스 이용약관')).toBeVisible()
    await expect(page.getByText('(필수) 개인정보처리방침')).toBeVisible()
    await expect(page.getByText('(필수) 통화 녹음 및 분석 동의')).toBeVisible()
  })

  test('온보딩 완료 후 메인 화면으로 이동 및 localStorage 저장', async ({ page }) => {
    await page.goto('/onboarding')

    // 페이지 4로 이동
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: '다음' }).click()
    }

    // 모두 동의 체크박스로 전체 선택
    const agreeAllCheckbox = page.getByRole('checkbox').first()
    await agreeAllCheckbox.check()

    // 시작 버튼 클릭
    await page.getByRole('button', { name: '동의하고 시작' }).click()

    // 메인 화면으로 이동 확인
    await expect(page).toHaveURL('/')
    await expect(page.getByText('속지마랑')).toBeVisible()

    // localStorage에 onboarding 완료 저장 확인
    const storage = await page.evaluate(() => localStorage.getItem('sokjimarang-user'))
    expect(storage).toContain('hasCompletedOnboarding')
    expect(storage).toContain('true')
  })

  test('건너뛰기 버튼으로 동의 페이지로 바로 이동', async ({ page }) => {
    await page.goto('/onboarding')

    // 건너뛰기 버튼 클릭
    await page.getByRole('button', { name: '건너뛰기' }).click()

    // 동의 페이지로 이동 확인
    await expect(page.getByText('서비스 이용을 위해')).toBeVisible()
  })

  test('이전 버튼으로 페이지 뒤로 이동', async ({ page }) => {
    await page.goto('/onboarding')

    // 다음으로 이동
    await page.getByRole('button', { name: '다음' }).click()
    await expect(page.getByText('AI가 사기범 역할을 합니다')).toBeVisible()

    // 이전으로 이동
    await page.getByRole('button', { name: '이전' }).click()
    await expect(page.getByText('보이스피싱, 겪어봐야 압니다')).toBeVisible()
  })
})
