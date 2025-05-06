<script lang="ts">
	import Summary from '$lib/components/Summary.svelte';
	import Typing from '$lib/components/Typing.svelte';
	import { language } from '$lib/language.svelte';
	import { resetLetterStats, stats } from '$lib/stats.svelte';

	import { summaryState } from '$lib/summary.svelte';
	import { type_state } from '$lib/typeState.svelte';
	import { onMount, untrack } from 'svelte';

	onMount(() => {
		summaryState.display = false;
		stats.reset();
		resetLetterStats();
	});

	$effect(() => {
		if (type_state.cursor === type_state.text.length) {
			summaryState.display = true;
		}
	});

	$effect(() => {
		const l = language.lang;
		untrack(() => {
			stats.reset();
			resetLetterStats();
			type_state.setCode(l);
		});
	});
</script>

{#if summaryState.display}
	<Summary />
{:else}
	<Typing chunk_seperator={'\n'} />
{/if}
