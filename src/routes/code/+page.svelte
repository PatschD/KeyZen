<script lang="ts">
	import Summary from '$lib/components/Summary.svelte';
	import Typing from '$lib/components/Typing.svelte';
	import { resetLetterStats, stats } from '$lib/stats.svelte';

	import { summaryState } from '$lib/summary.svelte';
	import { type_state } from '$lib/typeState.svelte';
	import { onMount } from 'svelte';

	onMount(() => {
		summaryState.display = false;
		stats.reset();
		resetLetterStats();
		type_state.setCode();
	});

	$effect(() => {
		if (type_state.cursor === type_state.text.length) {
			summaryState.display = true;
		}
	});
</script>

{#if summaryState.display}
	<Summary />
{:else}
	<Typing chunk_seperator={'\n'} />
{/if}
