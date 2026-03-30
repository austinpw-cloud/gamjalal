import rawGames from '@/data/games.json';
import type { Game } from '@/types';

// games.json은 snake_case, 코드는 camelCase → 변환
function transformGame(raw: Record<string, unknown>): Game {
  return {
    id: raw.id as string,
    name: raw.name as string,
    nameEn: (raw.name_en || raw.nameEn) as string | undefined,
    year: raw.year as number,
    platform: raw.platform as string[],
    genre: raw.genre as string[],
    era: raw.era as string,
    difficulty: raw.difficulty as 1 | 2 | 3,
    hint1: raw.hint1 as string,
    hint2: raw.hint2 as string,
    hint3: raw.hint3 as string,
    imageUrl: (raw.image_url || raw.imageUrl || '') as string,
    imageType: (raw.image_type || raw.imageType || 'text_only') as Game['imageType'],
    typeWeights: (raw.type_weights || raw.typeWeights || {}) as Game['typeWeights'],
    statWeights: (raw.stat_weights || raw.statWeights || {}) as Game['statWeights'],
    active: raw.active as boolean | undefined,
    round1_featured: raw.round1_featured as boolean | undefined,
    stage: raw.stage as 1 | 2 | 3 | 4 | 5 | undefined,
    igdb_cover_id: (raw.igdb_cover_id || raw.igdb_cover_id) as string | undefined,
  };
}

export const allGames: Game[] = (rawGames as Record<string, unknown>[]).map(transformGame);
