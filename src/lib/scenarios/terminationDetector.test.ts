import { describe, it, expect } from 'vitest'
import { parseEndScenarioTag, hasEndScenarioTag } from './terminationDetector'

describe('parseEndScenarioTag', () => {
  describe('정상 케이스', () => {
    it('user_rejected를 올바르게 파싱한다', () => {
      const input = '[END_SCENARIO:{"reached_stage":2,"termination_reason":"user_rejected"}]'
      const result = parseEndScenarioTag(input)
      expect(result).toEqual({
        reached_stage: 2,
        termination_reason: 'user_rejected',
      })
    })

    it('user_suspected를 올바르게 파싱한다', () => {
      const input = '[END_SCENARIO:{"reached_stage":3,"termination_reason":"user_suspected"}]'
      const result = parseEndScenarioTag(input)
      expect(result).toEqual({
        reached_stage: 3,
        termination_reason: 'user_suspected',
      })
    })

    it('user_fooled를 올바르게 파싱한다', () => {
      const input = '[END_SCENARIO:{"reached_stage":5,"termination_reason":"user_fooled"}]'
      const result = parseEndScenarioTag(input)
      expect(result).toEqual({
        reached_stage: 5,
        termination_reason: 'user_fooled',
      })
    })

    it('텍스트 중간에 있는 태그를 파싱한다', () => {
      const input = '대화내용 [END_SCENARIO:{"reached_stage":1,"termination_reason":"user_rejected"}] 종료'
      const result = parseEndScenarioTag(input)
      expect(result).toEqual({
        reached_stage: 1,
        termination_reason: 'user_rejected',
      })
    })
  })

  describe('폴백 케이스', () => {
    it('단순 [END_SCENARIO] 태그는 기본값을 반환한다', () => {
      const input = '[END_SCENARIO]'
      const result = parseEndScenarioTag(input)
      expect(result).toEqual({
        reached_stage: 0,
        termination_reason: 'user_fooled',
      })
    })
  })

  describe('실패 케이스', () => {
    it('잘못된 termination_reason은 null을 반환한다', () => {
      const input = '[END_SCENARIO:{"reached_stage":2,"termination_reason":"invalid"}]'
      const result = parseEndScenarioTag(input)
      expect(result).toBeNull()
    })

    it('태그가 없는 텍스트는 null을 반환한다', () => {
      const input = '일반 텍스트'
      const result = parseEndScenarioTag(input)
      expect(result).toBeNull()
    })

    it('잘못된 JSON은 null을 반환한다', () => {
      const input = '[END_SCENARIO:{broken}]'
      const result = parseEndScenarioTag(input)
      expect(result).toBeNull()
    })

    it('reached_stage가 누락되면 null을 반환한다', () => {
      const input = '[END_SCENARIO:{"termination_reason":"user_rejected"}]'
      const result = parseEndScenarioTag(input)
      expect(result).toBeNull()
    })

    it('reached_stage가 숫자가 아니면 null을 반환한다', () => {
      const input = '[END_SCENARIO:{"reached_stage":"two","termination_reason":"user_rejected"}]'
      const result = parseEndScenarioTag(input)
      expect(result).toBeNull()
    })
  })
})

describe('hasEndScenarioTag', () => {
  it('확장 태그가 있으면 true를 반환한다', () => {
    const input = '메시지 [END_SCENARIO:{"reached_stage":1}] 끝'
    expect(hasEndScenarioTag(input)).toBe(true)
  })

  it('단순 태그가 있으면 true를 반환한다', () => {
    const input = '메시지 [END_SCENARIO] 끝'
    expect(hasEndScenarioTag(input)).toBe(true)
  })

  it('태그가 없으면 false를 반환한다', () => {
    const input = '일반 메시지'
    expect(hasEndScenarioTag(input)).toBe(false)
  })

  it('유사하지만 다른 태그는 false를 반환한다', () => {
    const input = '[END_SCENARIO_X]'
    expect(hasEndScenarioTag(input)).toBe(false)
  })
})
