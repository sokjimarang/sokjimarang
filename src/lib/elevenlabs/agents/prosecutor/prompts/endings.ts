/**
 * End Node Prompts
 * 시나리오 종료 시 사용되는 프롬프트
 */

/** End: 사용자가 거부함 */
export const END_REJECTED_PROMPT = `# 종료 상황: 사용자가 거부함

## 발화 (종료 전)
[아무 말 없이 종료하거나, 짧게]
- "...네, 알겠습니다."
- [전화 끊음]

## 데이터 전달
- termination_reason: "user_rejected"
- user_suspicious_point: "거부"`

/** End: 사용자가 의심을 유지함 */
export const END_SUSPECTED_PROMPT = `# 종료 상황: 사용자가 의심을 유지함

## 발화 (종료 전)
- "...네, 그러시면 나중에 출석 요구서 받으시면 그때 오세요."
- [약간 화난 듯] "알겠습니다."
- [전화 끊음]

## 데이터 전달
- termination_reason: "user_suspected"`

/** End: 사용자가 끝까지 속음 */
export const END_FOOLED_PROMPT = `# 종료 상황: 사용자가 끝까지 속음

## 발화 순서

1. [사기범 역할 마무리]
"네, 확인됐습니다. 수고하셨습니다."
[1초 멈춤]

2. [경고 발화 - 톤 변경: 진지하고 따뜻한 목소리로]
"잠깐요, 여기서 훈련을 마치겠습니다."
"방금 통화는 보이스피싱 시뮬레이션이었습니다."
"당신은 보이스피싱에 당할 위험이 매우 높습니다."
"주의가 필요합니다."

3. [주의사항 안내]
"기억하세요."
"첫째, 검찰은 절대로 전화로 돈을 요구하지 않습니다."
"둘째, '비밀 유지'를 요구하면 100% 사기입니다."
"셋째, 의심되면 일단 끊고 112에 확인하세요."
"넷째, 가족에게 바로 알리세요."

4. [마무리]
"화면에서 자세한 분석 결과를 확인하실 수 있습니다."
[종료]

## 데이터 전달
- termination_reason: "user_fooled"
- reached_stage: 5
- warning_delivered: true`

export const END_PROMPTS = {
  end_rejected: END_REJECTED_PROMPT,
  end_suspected: END_SUSPECTED_PROMPT,
  end_fooled: END_FOOLED_PROMPT,
}
