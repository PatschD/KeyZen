import { untrack } from 'svelte';
import { Alphabet } from './utils';
import { type_state } from './typeState.svelte';
import { timer } from './timer.svelte';

export const letterStats: any = $state({ chunks: [], global: {} });

for (const a of Alphabet) {
	letterStats.global[a] = {
		total: 0,
		correct: 0
	};
}

export const stats = $state({
	accuracy: [] as number[],
	wpm: [] as number[],
	update() {
		const c = untrack(() => computeChunkStats());
		this.accuracy.push(c.acc);
		this.wpm.push(c.wpm);
	}
});

export function computeChunkStats() {
	const currentCursor = untrack(() => type_state.cursor);
	const lastCursor = untrack(() => type_state.lastChunkCursor);
	const lastChunkKeys = untrack(() => type_state.lastChunkKeys);
	let currentKeys = untrack(() => type_state.totalKeys);
	currentKeys = currentKeys - lastChunkKeys;
	const cursorMovement = currentCursor - lastCursor;

	const currentStats = untrack(() => type_state.stats);
	const currentText = untrack(() => type_state.text);
	const letterStatsTemp: any = {};

	const curentTime = untrack(() => timer.time);
	const lastTime = untrack(() => type_state.lastChunkTimestamp);
	const timeText = currentText.slice(lastCursor, currentCursor);
	const nWords = timeText.split(' ').length;
	const wpm = Math.floor((nWords / (curentTime - lastTime)) * 60);

	for (let i = lastCursor; i <= currentCursor; i++) {
		const c = currentStats[i];

		if (c && c.length) {
			const currentLetter = currentText[i].toLowerCase();
			if (!letterStatsTemp[currentLetter]) {
				letterStatsTemp[currentLetter] = {
					total: 0,
					correct: 0
				};
			}
			if (Alphabet.includes(currentLetter)) {
				const correctlyTypedLetters = c.filter((e: number) => e === 1);
				const numCorrect = correctlyTypedLetters.length;
				letterStatsTemp[currentLetter].total += c.length;
				letterStatsTemp[currentLetter].correct += numCorrect;
			}

			const item = c[c.length - 1];
			if (item === 0) {
				currentKeys += 4;
			}
		}
	}
	letterStats.chunks.push(letterStatsTemp);
	Object.keys(letterStatsTemp).map((ele) => {
		if (!Alphabet.includes(ele)) return;
		letterStats.global[ele].total += letterStatsTemp[ele].total;
		letterStats.global[ele].correct += letterStatsTemp[ele].correct;
	});

	// Avoid division by zero
	if (currentKeys === 0) {
		return {
			acc: 0,
			wpm: 0
		}; // Or 100, depending on desired behaviour when no keys are typed yet
	}

	type_state.lastChunkCursor = type_state.cursor;
	type_state.lastChunkKeys = type_state.totalKeys;
	type_state.lastChunkTimestamp = curentTime;
	const acc = Math.floor((cursorMovement / currentKeys) * 100);
	return {
		acc,
		wpm
	};
}
