<script lang="ts">
	import { stats, resetLetterStats } from '$lib/stats.svelte';
	import { summaryState } from '$lib/summary.svelte';
	import { type_state } from '$lib/typeState.svelte';
	import { timer } from '$lib/timer.svelte';

	function resetAll(c: string) {
		summaryState.display = false;
		stats.reset();
		resetLetterStats();
		type_state.setMode(c);
		timer.reset();
	}
</script>

<div class="mb-3 flex w-full px-5 pt-5">
	<a class="mx-2 font-bold" href="/" onclick={() => resetAll('/')}>KeyZen</a>
	<a class="mx-2" href="/endless" onclick={() => resetAll('/endless')}>Endless</a>
	<a class="mx-2" href="/code" onclick={() => resetAll('/code')}>Code</a>
	<a class="mx-2" href="/practice" onclick={() => resetAll('/practise')}>Practice</a>
	<a class="mx-2" href="/about" onclick={() => resetAll('/about')}>About</a>
	<a class="mx-2 ml-auto" href="https://github.com/PatschD/KeyZen">Github</a>
</div>
