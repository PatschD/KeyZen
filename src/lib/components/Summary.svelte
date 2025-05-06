<script>
	import { stats } from '$lib/stats.svelte';
	import { timer } from '$lib/timer.svelte';
	import { type_state } from '$lib/typeState.svelte';
	import { calculateMean, calculateStandardDeviation } from '$lib/utils';
	import LetterStats from './LetterStats.svelte';
	import LineSummary from './LineSummary.svelte';

	const meanWPM = $derived.by(() => {
		return Math.floor(calculateMean(stats.wpm));
	});

	const stdWPM = $derived.by(() => {
		return Math.floor(calculateStandardDeviation(stats.wpm));
	});

	const meanAccuracy = $derived.by(() => {
		return Math.floor(calculateMean(stats.accuracy));
	});

	const stdAccuracy = $derived.by(() => {
		return Math.floor(calculateStandardDeviation(stats.accuracy));
	});

	const tK = $derived(stats.charactersTotal.reduce((prev, current) => (prev += current), 0));
	const tT = $derived(stats.charactersTyped.reduce((prev, current) => (prev += current), 0));

	const upk = $derived.by(() => {
		const totalKeys = stats.charactersTotal.reduce((prev, current) => (prev += current), 0);
		const totalTyped = stats.charactersTyped.reduce((prev, current) => (prev += current), 0);
		let c = (totalTyped - totalKeys) / totalKeys;
		return Math.floor(c * 100);
	});
</script>

<div class="flex h-full w-[70vw] flex-col items-center justify-center align-middle">
	<div class="text-2xl font-bold">Lesson Summary</div>
	<div>
		accuracy: {meanAccuracy}(±{stdAccuracy})
	</div>
	<div>
		wpm: {meanWPM}(±{stdWPM})
	</div>
	<div>
		total characters: {tK}
	</div>
	<div>
		typed characters: {tT}
	</div>
	<div>
		unproductive keystrokes: {Math.max(0, upk)}%
	</div>
	<div>
		time: {timer.time} seconds
	</div>
	<LetterStats />
	<LineSummary />
</div>
