import type { UserContext } from '@/types/database'

const AGE_GROUP_LABELS: Record<string, string> = {
  under50: '50대 미만',
  '50s': '50대',
  '60s': '60대',
  '70plus': '70대 이상',
}

const REGION_LABELS: Record<string, string> = {
  seoul: '서울',
  gyeonggi: '경기',
  other: '기타 지역',
}

function hasChildren(context: UserContext): boolean {
  return context.children !== null && context.children !== undefined && context.children > 0
}

function hasGrandchildren(context: UserContext): boolean {
  return context.grandchildren !== null && context.grandchildren !== undefined && context.grandchildren > 0
}

function injectContext(template: string, context: UserContext): string {
  const ageGroupLabel = context.age_group ? AGE_GROUP_LABELS[context.age_group] : '어르신'
  const regionLabel = context.region ? REGION_LABELS[context.region] : '해당 지역'

  return template
    .replace(/\{\{age_group\}\}/g, ageGroupLabel)
    .replace(/\{\{region\}\}/g, regionLabel)
    .replace(/\{\{has_children\}\}/g, String(hasChildren(context)))
    .replace(/\{\{has_grandchildren\}\}/g, String(hasGrandchildren(context)))
}

function getHonorific(context: UserContext): string {
  if (hasGrandchildren(context)) {
    return '할머니'
  }
  if (hasChildren(context)) {
    return '어머니'
  }
  return '이모'
}

export { injectContext, getHonorific, AGE_GROUP_LABELS, REGION_LABELS }
