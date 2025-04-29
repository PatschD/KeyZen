<script lang="ts">
	import { letterStats, stats } from '$lib/stats.svelte';
	import { type_state } from '$lib/typeState.svelte';
	import { Alphabet } from '$lib/utils';
	import { untrack } from 'svelte';

	let punishmentFactor = 4;

	function computeStats() {
		const currentCursor = untrack(() => type_state.cursor);
		let currentTotalKeys = untrack(() => type_state.totalKeys);
		const currentStats = untrack(() => type_state.stats);
		const currentText = untrack(() => type_state.text);

		let currentStatsSlice = [];
		for (let i = 0; i <= currentCursor; i++) {
			const c = currentStats[i];

			if (c && c.length) {
				const currentLetter = currentText[i].toLowerCase();
				if (Alphabet.includes(currentLetter)) {
					const correctlyTypedLetters = c.filter((e: number) => e === 1);
					const numCorrect = correctlyTypedLetters.length;
					letterStats[currentLetter].total += c.length;
					letterStats[currentLetter].correct += numCorrect;
				}

				const item = c[c.length - 1];
				if (item === 0) {
					currentTotalKeys += punishmentFactor;
				}
				currentStatsSlice.push(c[c.length - 1]);
			}
		}

		// Avoid division by zero
		if (currentTotalKeys === 0) {
			return 0; // Or 100, depending on desired behaviour when no keys are typed yet
		}

		const acc = Math.floor((currentCursor / currentTotalKeys) * 100);
		return acc;
	}

	$effect(() => {
		const currentChunk = type_state.chunk;
		console.log('RUNNING!!', currentChunk);

		if (currentChunk === 0) {
			stats.accuracy = 100;
			// return 100;
		} else {
			const newAccuracy = untrack(() => computeStats());
			stats.accuracy = newAccuracy;
		}
	});
</script>

<div>
	Metrics:
	<div>
		total: {type_state.totalKeys}
	</div>
	<div>
		accuracy: {stats.accuracy}%
	</div>

	<div>
		<button
			onclick={() => {
				type_state.stats = {};
				type_state.totalKeys = 0;
				type_state.cursor = 0;
				type_state.chunk = 0;
			}}>reset</button
		>
	</div>
	<div class="flex w-full items-center justify-center align-middle">
		{#each Alphabet as a, i (i)}
			{@const c = letterStats[a]}
			<div class="p-2">
				{a}{c.total}
			</div>
		{/each}
	</div>
</div>
