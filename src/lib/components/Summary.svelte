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
	const upk = $derived.by(() => {
		let c = (type_state.totalKeys - type_state.cursor) / type_state.cursor;
		return Math.floor(c * 100);
	});
</script>

<div class="flex h-screen w-[70vw] flex-col items-center justify-center align-middle">
	<div class="text-2xl font-bold">Lesson Summary</div>
	<div>
		accuracy: {meanAccuracy}(±{stdAccuracy})
	</div>
	<div>
		wpm: {meanWPM}(±{stdWPM})
	</div>
	<div>
		total characters: {type_state.text.length}
	</div>
	<div>
		typed characters: {type_state.totalKeys}
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
