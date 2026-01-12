import { test, expect } from '@playwright/test'

test.describe('온보딩 플로우', () => {
  test.beforeEach(async ({ page }) => {
    // localStorage 초기화
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
  })

  test('온보딩 미완료 시 온보딩 페이지로 리다이렉트', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/onboarding/)
  })

  test('온보딩 4페이지 스와이프 가능', async ({ page }) => {
    await page.goto('/onboarding')

    // 페이지 1: 보이스피싱 설명
    await expect(page.getByText('보이스피싱')).toBeVisible()

    // 다음 버튼 클릭
    await page.getByRole('button', { name: '다음' }).click()

    // 페이지 2: AI 사기범 역할
    await expect(page.getByText('AI')).toBeVisible()

    await page.getByRole('button', { name: '다음' }).click()

    // 페이지 3: 훈련 안내
    await expect(page.getByText('훈련')).toBeVisible()

    await page.getByRole('button', { name: '다음' }).click()

    // 페이지 4: 동의 화면
    await expect(page.getByText('동의')).toBeVisible()
  })

  test('동의 체크박스 모두 선택 시 시작 버튼 활성화', async ({ page }) => {
    await page.goto('/onboarding')

    // 페이지 4로 이동
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: '다음' }).click()
    }

    // 시작 버튼 비활성화 상태 확인
    const startButton = page.getByRole('button', { name: /동의하고 시작|시작/ })
    await expect(startButton).toBeDisabled()

    // 모든 체크박스 선택
    const checkboxes = page.getByRole('checkbox')
    for (const checkbox of await checkboxes.all()) {
      await checkbox.check()
    }

    // 시작 버튼 활성화 확인
    await expect(startButton).toBeEnabled()
  })

  test('온보딩 완료 후 메인 화면으로 이동', async ({ page }) => {
    await page.goto('/onboarding')

    // 페이지 4로 이동
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: '다음' }).click()
    }

    // 모든 체크박스 선택
    const checkboxes = page.getByRole('checkbox')
    for (const checkbox of await checkboxes.all()) {
      await checkbox.check()
    }

    // 시작 버튼 클릭
    await page.getByRole('button', { name: /동의하고 시작|시작/ }).click()

    // 메인 화면으로 이동 확인
    await expect(page).toHaveURL('/')
    await expect(page.getByText('속지마랑')).toBeVisible()
  })
})
