interface AnswerOptionsProps {
  options: string[];
  correctAnswer: string;
  onSelect: (option: string) => void;
  selectedOption: string | null;
  disabled: boolean;
  eliminatedOption?: string | null;
}

export default function AnswerOptions({
  options,
  correctAnswer,
  onSelect,
  selectedOption,
  disabled,
  eliminatedOption,
}: AnswerOptionsProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((option) => {
        const isEliminated = eliminatedOption === option;
        let cls = 'answer-btn';

        if (selectedOption) {
          if (option === selectedOption && option === correctAnswer) {
            cls += ' selected-correct';
          } else if (option === selectedOption && option !== correctAnswer) {
            cls += ' selected-wrong';
          } else if (option === correctAnswer) {
            cls += ' correct-reveal';
          }
        }

        return (
          <button
            key={option}
            className={cls}
            onClick={() => onSelect(option)}
            disabled={disabled || !!selectedOption || isEliminated}
            style={isEliminated && !selectedOption ? {
              opacity: 0.2,
              textDecoration: 'line-through',
              pointerEvents: 'none',
            } : undefined}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
