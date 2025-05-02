<script>
	import Header from '$lib/components/Header.svelte';
	import Summary from '$lib/components/Summary.svelte';
	import Typing from '$lib/components/Typing.svelte';
	import { summaryState } from '$lib/summary.svelte';
</script>

<div class="h-screen w-screen">
	<Header />
	<div class="flex flex-col items-center justify-center">
		{#if summaryState.display}
			<Summary />
		{:else}
			<Typing />
		{/if}
	</div>
</div>

<style>
</style>
