<script>
	import Summary from '$lib/components/Summary.svelte';
	import Typing from '$lib/components/Typing.svelte';
	import { summaryState } from '$lib/summary.svelte';
</script>

<div class="flex h-screen w-full flex-col items-center justify-center">
	{#if summaryState.display}
		<Summary />
	{:else}
		<Typing />
	{/if}
</div>

<style>
</style>
