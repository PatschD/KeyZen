import { Alphabet } from './utils';

export const letterStats: Record<string, any> = {};

for (const a of Alphabet) {
	letterStats[a] = {
		total: 0,
		correct: 0
	};
}

export const stats = $state({
	accuracy: 100
});
