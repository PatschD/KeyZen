import { Alphabet } from './utils';

export const letterStats: any = $state({ ls: {} });

for (const a of Alphabet) {
	letterStats.ls[a] = {
		total: 0,
		correct: 0
	};
}

export const stats = $state({
	accuracy: 100
});
