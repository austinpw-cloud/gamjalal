import type { QuizAnswer } from '@/types';

interface ProgressBarProps {
  current: number;
  total: number;
  answers: QuizAnswer[];
}

export default function ProgressBar({ current, total, answers }: ProgressBarProps) {
  return (
    <div className="flex gap-1 items-center">
      {Array.from({ length: total }, (_, i) => {
        let cls = 'progress-dot';
        if (i < answers.length) {
          cls += answers[i].correct ? ' correct' : ' wrong';
        } else if (i === current) {
          cls += ' current';
        }
        return <div key={i} className={cls} />;
      })}
    </div>
  );
}
