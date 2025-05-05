<script lang="ts">
	import { page } from '$app/stores';
	import { stats } from '$lib/stats.svelte';
	import { summaryState } from '$lib/summary.svelte';
	import { timer } from '$lib/timer.svelte';
	import { type_state } from '$lib/typeState.svelte';
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

<div class="mt-4 flex w-full flex-col items-center">
	<div class="flex md:w-[728px]">
		<div>
			mode: {$page.url.pathname.replace('/', '')}
		</div>
		&nbsp;&nbsp;
		<div>lesson total time: {Math.floor(timer.time / 60)} Minutes</div>
		&nbsp;&nbsp;
		<button
			class="cursor-pointer underline"
			onclick={() => {
				summaryState.display = true;
			}}>Summary-></button
		>
	</div>
</div>
