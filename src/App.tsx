import { useState, useCallback } from 'react';
import TossProvider from '@/components/providers/TossProvider';
import HomePage from '@/pages/HomePage';
import QuizPage from '@/pages/QuizPage';
import ResultPage from '@/pages/ResultPage';
import FinalResultPage from '@/pages/FinalResultPage';
import WorldCupPage from '@/pages/WorldCupPage';

interface RouteState {
  page: string;
  params: Record<string, string>;
}

export default function App() {
  const [route, setRoute] = useState<RouteState>({ page: 'home', params: {} });

  const onNavigate = useCallback((page: string, params?: Record<string, string>) => {
    setRoute({ page, params: params || {} });
  }, []);

  let page;
  switch (route.page) {
    case 'quiz':
      page = (
        <QuizPage
          stage={parseInt(route.params.stage || '1', 10)}
          onNavigate={onNavigate}
        />
      );
      break;
    case 'result':
      page = (
        <ResultPage
          stage={parseInt(route.params.stage || '1', 10)}
          onNavigate={onNavigate}
        />
      );
      break;
    case 'final':
      page = <FinalResultPage onNavigate={onNavigate} />;
      break;
    case 'worldcup':
      page = <WorldCupPage onNavigate={onNavigate} />;
      break;
    default:
      page = <HomePage onNavigate={onNavigate} />;
  }

  return <TossProvider>{page}</TossProvider>;
}
