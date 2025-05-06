<script lang="ts">
	import Summary from '$lib/components/Summary.svelte';
	import Typing from '$lib/components/Typing.svelte';
	import { summaryState } from '$lib/summary.svelte';
	import { type_state } from '$lib/typeState.svelte';
	import { untrack } from 'svelte';

	$effect(() => {
		untrack(() => {
			type_state.setMode('code');
		});
	});
</script>

{#if summaryState.display}
	<Summary />
{:else}
	<Typing chunk_seperator={'\n'} />
{/if}
