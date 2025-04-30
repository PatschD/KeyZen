<script lang="ts">
	import { letterStats, stats } from '$lib/stats.svelte';
	import { timer } from '$lib/timer.svelte';
	import { type_state } from '$lib/typeState.svelte';
	import { Alphabet, getColorLetters } from '$lib/utils';
	import { untrack } from 'svelte';

	$effect(() => {
		untrack(() => timer.start());
	});

	$effect(() => {
		const currentChunk = type_state.chunk;

		if (currentChunk === 0) {
			return;
		} else {
			untrack(() => stats.update());
		}
	});
</script>

<div class="flex w-full flex-col items-center">
	<div class="flex w-[728px]">
		<div>
			accuracy: {stats.accuracy[stats.accuracy.length - 1] || '100'} %
			{#if stats.accuracy.length > 1}
				{@const diff =
					stats.accuracy[stats.accuracy.length - 1] - stats.accuracy[stats.accuracy.length - 2]}
				{#if diff >= 0}
					(+{diff})
				{:else}
					({diff})
				{/if}
			{/if}
		</div>
		&nbsp;&nbsp;
		<div>
			wpm: {stats.wpm[stats.wpm.length - 1] || '100'}
			{#if stats.wpm.length > 1}
				{@const diff = stats.wpm[stats.wpm.length - 1] - stats.wpm[stats.wpm.length - 2]}
				{#if diff >= 0}
					(+{diff})
				{:else}
					({diff})
				{/if}
			{/if}
		</div>
	</div>

	<div class="flex w-[728px] flex-wrap">
		{#each Alphabet as a, i (i)}
			{@const c = letterStats.global[a]}
			{@const color = getColorLetters(c)}
			<div class="m-0.5 min-w-[24px] rounded p-1 text-center" style={color}>{a}</div>
		{/each}
	</div>
</div>
