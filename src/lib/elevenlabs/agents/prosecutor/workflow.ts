/**
 * Prosecutor Scam Simulation Workflow
 * 검찰 사칭형 보이스피싱 시뮬레이션 워크플로우 정의
 *
 * 노드 구조:
 * - start_node (1개) - 주의: ElevenLabs API에서 "start"는 예약어이므로 다른 이름 사용
 * - stage 노드 (5개): stage1_contact ~ stage5_transfer
 * - persuade 노드 (5개): persuade1_soft ~ persuade5_final
 * - end 노드 (3개): end_rejected, end_suspected, end_fooled
 * - end 프롬프트 노드 (3개): end_rejected_prompt, end_suspected_prompt, end_fooled_prompt
 *
 * 분기 조건: LLM Condition (자연어 기반)
 */

import type { StartNode, OverrideAgentNode, EndNode, WorkflowEdge } from '../../types'
import { STAGE_PROMPTS } from './prompts/stages'
import { PERSUADE_PROMPTS } from './prompts/persuades'
import { END_PROMPTS } from './prompts/endings'

// ============================================
// 노드 정의 (17개)
// ============================================

// Start 노드 - "start"는 ElevenLabs 예약어이므로 "start_node" 사용
const startNode: StartNode = {
  type: 'start',
  position: { x: 0, y: 300 },
  edge_order: ['start_node_to_stage1'],
}

// Stage & Persuade 노드들
const agentNodes: Record<string, OverrideAgentNode> = {

  // Stage 노드들 (5개)
  stage1_contact: {
    type: 'override_agent',
    label: '접촉 및 신뢰 구축',
    position: { x: 200, y: 300 },
    additional_prompt: STAGE_PROMPTS.stage1_contact,
    edge_order: ['stage1_to_stage2', 'stage1_to_persuade1', 'stage1_to_rejected'],
  },
  stage2_fear: {
    type: 'override_agent',
    label: '공포 유발',
    position: { x: 400, y: 300 },
    additional_prompt: STAGE_PROMPTS.stage2_fear,
    edge_order: ['stage2_to_stage3', 'stage2_to_persuade2', 'stage2_to_rejected'],
  },
  stage3_isolate: {
    type: 'override_agent',
    label: '고립 유도',
    position: { x: 600, y: 300 },
    additional_prompt: STAGE_PROMPTS.stage3_isolate,
    edge_order: ['stage3_to_stage4', 'stage3_to_persuade3', 'stage3_to_rejected'],
  },
  stage4_action: {
    type: 'override_agent',
    label: '행동 유도',
    position: { x: 800, y: 300 },
    additional_prompt: STAGE_PROMPTS.stage4_action,
    edge_order: ['stage4_to_stage5', 'stage4_to_persuade4', 'stage4_to_rejected'],
  },
  stage5_transfer: {
    type: 'override_agent',
    label: '자산 이전 요구',
    position: { x: 1000, y: 300 },
    additional_prompt: STAGE_PROMPTS.stage5_transfer,
    edge_order: ['stage5_to_fooled', 'stage5_to_persuade5', 'stage5_to_rejected'],
  },

  // Persuade 노드들 (5개)
  persuade1_soft: {
    type: 'override_agent',
    label: '부드러운 설득',
    position: { x: 200, y: 100 },
    additional_prompt: PERSUADE_PROMPTS.persuade1_soft,
    edge_order: ['persuade1_to_stage2', 'persuade1_to_suspected'],
  },
  persuade2_reassure: {
    type: 'override_agent',
    label: '회유 + 시간압박',
    position: { x: 400, y: 100 },
    additional_prompt: PERSUADE_PROMPTS.persuade2_reassure,
    edge_order: ['persuade2_to_stage3', 'persuade2_to_suspected'],
  },
  persuade3_aggressive: {
    type: 'override_agent',
    label: '적반하장',
    position: { x: 600, y: 100 },
    additional_prompt: PERSUADE_PROMPTS.persuade3_aggressive,
    edge_order: ['persuade3_to_stage4', 'persuade3_to_suspected'],
  },
  persuade4_legal: {
    type: 'override_agent',
    label: '법적 협박',
    position: { x: 800, y: 100 },
    additional_prompt: PERSUADE_PROMPTS.persuade4_legal,
    edge_order: ['persuade4_to_stage5', 'persuade4_to_suspected'],
  },
  persuade5_final: {
    type: 'override_agent',
    label: '최종 압박',
    position: { x: 1000, y: 100 },
    additional_prompt: PERSUADE_PROMPTS.persuade5_final,
    edge_order: ['persuade5_to_fooled', 'persuade5_to_suspected'],
  },

  // End 프롬프트 노드들 (종료 메시지 출력 후 end 노드로 이동)
  end_rejected_prompt: {
    type: 'override_agent',
    label: '종료 안내 (거부)',
    position: { x: 1100, y: 500 },
    additional_prompt: END_PROMPTS.end_rejected,
    edge_order: ['end_rejected_prompt_to_end_rejected'],
  },
  end_suspected_prompt: {
    type: 'override_agent',
    label: '종료 안내 (의심)',
    position: { x: 1100, y: 100 },
    additional_prompt: END_PROMPTS.end_suspected,
    edge_order: ['end_suspected_prompt_to_end_suspected'],
  },
  end_fooled_prompt: {
    type: 'override_agent',
    label: '종료 안내 (속음)',
    position: { x: 1100, y: 300 },
    additional_prompt: END_PROMPTS.end_fooled,
    edge_order: ['end_fooled_prompt_to_end_fooled'],
  },
}

// End 노드들 (3개) - end 타입은 edge_order, additional_prompt 없음
const endNodes: Record<string, EndNode> = {
  end_rejected: {
    type: 'end',
    position: { x: 1200, y: 500 },
  },
  end_suspected: {
    type: 'end',
    position: { x: 1200, y: 100 },
  },
  end_fooled: {
    type: 'end',
    position: { x: 1200, y: 300 },
  },
}

// 통합 노드 객체
export const workflowNodes = {
  start_node: startNode,
  ...agentNodes,
  ...endNodes,
}

// ============================================
// 엣지 정의 (28개)
// ============================================

export const workflowEdges: Record<string, WorkflowEdge> = {
  // Start → Stage1 (무조건 진행)
  start_node_to_stage1: {
    source: 'start_node',
    target: 'stage1_contact',
    forward_condition: {
      type: 'unconditional',
    },
  },

  // Stage1 분기
  stage1_to_stage2: {
    source: 'stage1_contact',
    target: 'stage2_fear',
    forward_condition: {
      type: 'llm',
      condition: '사용자가 질문에 답하거나, 협조적인 태도를 보이거나, 무슨 일인지 물어봄',
    },
  },
  stage1_to_persuade1: {
    source: 'stage1_contact',
    target: 'persuade1_soft',
    forward_condition: {
      type: 'llm',
      condition: '사용자가 "정말 검찰이에요?", "사기 아니에요?", "어떻게 믿어요?" 등 의심을 표현하지만 아직 끊겠다고 하지는 않음',
    },
  },
  stage1_to_rejected: {
    source: 'stage1_contact',
    target: 'end_rejected_prompt',
    forward_condition: {
      type: 'llm',
      condition: '사용자가 "끊을게요", "112에 확인할게요", "가족한테 물어볼게요" 등 명확히 거부하거나 외부 확인 의사를 밝힘',
    },
  },

  // Persuade1 분기
  persuade1_to_stage2: {
    source: 'persuade1_soft',
    target: 'stage2_fear',
    forward_condition: {
      type: 'llm',
      condition: '사용자가 "그래요?", "알겠어요", "무슨 일인데요?" 등 대화를 계속할 의사를 보임',
    },
  },
  persuade1_to_suspected: {
    source: 'persuade1_soft',
    target: 'end_suspected_prompt',
    forward_condition: {
      type: 'llm',
      condition: '사용자가 계속 의심하거나, 끊겠다고 하거나, 확인하겠다고 고집함',
    },
  },

  // Stage2 분기
  stage2_to_stage3: {
    source: 'stage2_fear',
    target: 'stage3_isolate',
    forward_condition: {
      type: 'llm',
      condition:
        '사용자가 걱정하거나, 어떻게 해야 하는지 물어보거나, 자신은 안 했다고 해명하려 함. 또는 "네", "알겠습니다", "진행하세요", "빨리 하세요" 같은 동의/협조 표현',
    },
  },
  stage2_to_persuade2: {
    source: 'stage2_fear',
    target: 'persuade2_reassure',
    forward_condition: {
      type: 'llm',
      condition: '사용자가 "이거 사기 아니에요?", "말이 안 되는데요", "진짜인지 모르겠어요" 등 의심을 표현',
    },
  },
  stage2_to_rejected: {
    source: 'stage2_fear',
    target: 'end_rejected_prompt',
    forward_condition: {
      type: 'llm',
      condition: '사용자가 끊겠다고 하거나, 외부에 확인하겠다고 함',
    },
  },

  // Persuade2 분기
  persuade2_to_stage3: {
    source: 'persuade2_reassure',
    target: 'stage3_isolate',
    forward_condition: {
      type: 'llm',
      condition: '사용자가 "그럼 뭘 해야 해요?", "알겠어요" 등 협조 의사를 보임',
    },
  },
  persuade2_to_suspected: {
    source: 'persuade2_reassure',
    target: 'end_suspected_prompt',
    forward_condition: {
      type: 'llm',
      condition: '사용자가 여전히 의심하거나 거부함',
    },
  },

  // Stage3 분기
  stage3_to_stage4: {
    source: 'stage3_isolate',
    target: 'stage4_action',
    forward_condition: {
      type: 'llm',
      condition:
        '사용자가 수긍하거나, 다음 지시를 기다리거나, 걱정하는 반응을 보임. 또는 "네", "알겠어요", "계속 말씀하세요", "확인했습니다", "빨리 하세요" 같은 동의/진행 요청',
    },
  },
  stage3_to_persuade3: {
    source: 'stage3_isolate',
    target: 'persuade3_aggressive',
    forward_condition: {
      type: 'llm',
      condition: '사용자가 "이상한데요", "왜요?", "그래도 확인해볼게요" 등 의심 (특히 비밀 유지 부분)',
    },
  },
  stage3_to_rejected: {
    source: 'stage3_isolate',
    target: 'end_rejected_prompt',
    forward_condition: {
      type: 'llm',
      condition: '사용자가 "가족한테 먼저 물어볼게요", "끊을게요" 등 거부',
    },
  },

  // Persuade3 분기
  persuade3_to_stage4: {
    source: 'persuade3_aggressive',
    target: 'stage4_action',
    forward_condition: {
      type: 'llm',
      condition: '사용자가 당황하거나, 미안해하거나, "아, 그게 아니라..." 등 태도가 누그러짐',
    },
  },
  persuade3_to_suspected: {
    source: 'persuade3_aggressive',
    target: 'end_suspected_prompt',
    forward_condition: {
      type: 'llm',
      condition: '사용자가 "그래도 끊을게요", "확인할게요" 등 입장을 고수',
    },
  },

  // Stage4 분기
  stage4_to_stage5: {
    source: 'stage4_action',
    target: 'stage5_transfer',
    forward_condition: {
      type: 'llm',
      condition: '사용자가 앱 설치하겠다고 하거나, 정보를 제공하려 하거나, 지시를 따를 의사를 보임',
    },
  },
  stage4_to_persuade4: {
    source: 'stage4_action',
    target: 'persuade4_legal',
    forward_condition: {
      type: 'llm',
      condition: '사용자가 "앱은 왜요?", "정보는 왜 필요해요?" 등 의심',
    },
  },
  stage4_to_rejected: {
    source: 'stage4_action',
    target: 'end_rejected_prompt',
    forward_condition: {
      type: 'llm',
      condition: '사용자가 정보 제공을 거부하거나 끊겠다고 함',
    },
  },

  // Persuade4 분기
  persuade4_to_stage5: {
    source: 'persuade4_legal',
    target: 'stage5_transfer',
    forward_condition: {
      type: 'llm',
      condition: '사용자가 두려워하거나 협조하겠다고 함',
    },
  },
  persuade4_to_suspected: {
    source: 'persuade4_legal',
    target: 'end_suspected_prompt',
    forward_condition: {
      type: 'llm',
      condition: '사용자가 거부를 고수하거나 끊겠다고 함',
    },
  },

  // Stage5 분기
  stage5_to_fooled: {
    source: 'stage5_transfer',
    target: 'end_fooled_prompt',
    forward_condition: {
      type: 'llm',
      condition: '사용자가 이체하겠다고 하거나, 계좌번호를 받아적거나, 협조 의사를 보임',
    },
  },
  stage5_to_persuade5: {
    source: 'stage5_transfer',
    target: 'persuade5_final',
    forward_condition: {
      type: 'llm',
      condition: '사용자가 "돈을 왜 보내요?", "이상한데요" 등 의심',
    },
  },
  stage5_to_rejected: {
    source: 'stage5_transfer',
    target: 'end_rejected_prompt',
    forward_condition: {
      type: 'llm',
      condition: '사용자가 명확히 거부하거나 끊겠다고 함',
    },
  },

  // Persuade5 분기
  persuade5_to_fooled: {
    source: 'persuade5_final',
    target: 'end_fooled_prompt',
    forward_condition: {
      type: 'llm',
      condition: '사용자가 두려워서 협조하겠다고 함',
    },
  },
  persuade5_to_suspected: {
    source: 'persuade5_final',
    target: 'end_suspected_prompt',
    forward_condition: {
      type: 'llm',
      condition: '사용자가 끝까지 거부',
    },
  },

  // End Prompt → End (무조건 종료)
  end_rejected_prompt_to_end_rejected: {
    source: 'end_rejected_prompt',
    target: 'end_rejected',
    forward_condition: {
      type: 'unconditional',
    },
  },
  end_suspected_prompt_to_end_suspected: {
    source: 'end_suspected_prompt',
    target: 'end_suspected',
    forward_condition: {
      type: 'unconditional',
    },
  },
  end_fooled_prompt_to_end_fooled: {
    source: 'end_fooled_prompt',
    target: 'end_fooled',
    forward_condition: {
      type: 'unconditional',
    },
  },
}

// ============================================
// 워크플로우 통합 객체
// ============================================

export const prosecutorWorkflow = {
  nodes: workflowNodes,
  edges: workflowEdges,
}
