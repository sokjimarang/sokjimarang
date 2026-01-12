#!/bin/bash
# Ralph 플랜 실행 헬퍼
# Usage: ./run-ralph.sh [plan-type] [options]

PROMPTS_DIR="prompts"

show_help() {
    echo "Usage: ./run-ralph.sh [plan-type] [options]"
    echo ""
    echo "Plan types:"
    echo "  refactor    리팩토링 플랜 실행"
    echo "  feature     기능 추가 플랜 실행"
    echo "  bugfix      버그 수정 플랜 실행"
    echo "  optimize    성능 최적화 플랜 실행"
    echo "  custom      커스텀 플랜 (prompts/custom.md)"
    echo "  list        사용 가능한 플랜 목록"
    echo ""
    echo "Options (ralph에 전달):"
    echo "  --monitor   tmux 모니터링 활성화"
    echo "  --verbose   상세 로그 출력"
    echo "  --timeout N 타임아웃 설정 (분)"
    echo "  --calls N   시간당 최대 호출 수"
    echo ""
    echo "Examples:"
    echo "  ./run-ralph.sh refactor --monitor"
    echo "  ./run-ralph.sh feature --timeout 30"
    echo "  ./run-ralph.sh bugfix --verbose"
}

list_plans() {
    echo "Available plans in $PROMPTS_DIR/:"
    echo ""
    for file in $PROMPTS_DIR/*.md; do
        if [ -f "$file" ]; then
            name=$(basename "$file" .md)
            title=$(head -1 "$file" | sed 's/^# //')
            echo "  $name - $title"
        fi
    done
}

PLAN_TYPE=$1
shift

case "$PLAN_TYPE" in
    refactor)
        ralph --prompt "$PROMPTS_DIR/refactor.md" "$@"
        ;;
    feature)
        ralph --prompt "$PROMPTS_DIR/feature-add.md" "$@"
        ;;
    bugfix)
        ralph --prompt "$PROMPTS_DIR/bug-fix.md" "$@"
        ;;
    optimize)
        ralph --prompt "$PROMPTS_DIR/optimize.md" "$@"
        ;;
    custom)
        ralph --prompt "$PROMPTS_DIR/custom.md" "$@"
        ;;
    list)
        list_plans
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        if [ -f "$PROMPTS_DIR/$PLAN_TYPE.md" ]; then
            ralph --prompt "$PROMPTS_DIR/$PLAN_TYPE.md" "$@"
        else
            echo "Unknown plan type: $PLAN_TYPE"
            echo ""
            show_help
            exit 1
        fi
        ;;
esac
