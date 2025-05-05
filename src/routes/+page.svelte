<script>
	import Summary from '$lib/components/Summary.svelte';
	import Typing from '$lib/components/Typing.svelte';
	import { summaryState } from '$lib/summary.svelte';
</script>

{#if summaryState.display}
	<Summary />
{:else}
	<Typing chunk_seperator={'\n'} />
{/if}

<style>
</style>
