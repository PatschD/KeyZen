<script lang="ts">
	import { stats, resetLetterStats } from '$lib/stats.svelte';
	import { summaryState } from '$lib/summary.svelte';
	import { page } from '$app/stores';
	import { type_state } from '$lib/typeState.svelte';

	const mode = $page.url.pathname;
	function resetAll(c: string) {
		if (c === mode && !summaryState.display) {
			return;
		} else {
			summaryState.display = false;
			stats.reset();
			resetLetterStats();
			type_state.setMode(mode);
		}
	}
</script>

<div class="mb-3 flex pt-5 pl-5">
	<a class="mx-2" href="/" onclick={() => resetAll('/')}>KeyZen</a>
	<a class="mx-2" href="/endless" onclick={() => resetAll('/endless')}>Endless</a>
	<a class="mx-2" href="/code" onclick={() => resetAll('/code')}>Code</a>
	<a class="mx-2" href="/practice" onclick={() => resetAll('/practise')}>Practice</a>
	<a class="mx-2" href="/about" onclick={() => resetAll('/about')}>About</a>
</div>
