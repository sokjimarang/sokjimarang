import type { UserContext, AgeGroup, Region } from '@/types/database'

/**
 * 프리셋 = UserContext + 식별자(id, name)
 * 별도 맵핑 없이 UserContext 필드를 그대로 사용
 */
export interface PresetData {
  id: string
  name: string
  context: UserContext
}

export const PRESETS: PresetData[] = [
  {
    id: 'preset-1',
    name: '프리셋 1',
    context: {
      age_group: '50s',
      region: 'seoul',
      children: 2,
      grandchildren: null,
    },
  },
  {
    id: 'preset-2',
    name: '프리셋 2',
    context: {
      age_group: '60s',
      region: 'gyeonggi',
      children: 2,
      grandchildren: 1,
    },
  },
]

const AGE_LABELS: Record<AgeGroup, string> = {
  under50: '50대 미만',
  '50s': '50대',
  '60s': '60대',
  '70plus': '70대 이상',
}

const REGION_LABELS: Record<Region, string> = {
  seoul: '서울',
  gyeonggi: '경기',
  other: '기타',
}

/**
 * UserContext를 화면 표시용 문자열로 변환
 * @example "50대 / 서울 / 자녀 2명"
 */
export function getUserContextDescription(context: UserContext): string {
  const parts: string[] = []

  if (context.age_group) {
    parts.push(AGE_LABELS[context.age_group])
  }
  if (context.region) {
    parts.push(REGION_LABELS[context.region])
  }
  if (context.children && context.children > 0) {
    parts.push(`자녀 ${context.children}명`)
  }
  if (context.grandchildren && context.grandchildren > 0) {
    parts.push(`손주 ${context.grandchildren}명`)
  }

  return parts.join(' / ')
}

export function getPresetById(id: string): PresetData | undefined {
  return PRESETS.find((preset) => preset.id === id)
}
