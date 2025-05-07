<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import '../app.css';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';

	injectSpeedInsights();
	injectAnalytics();

	let { children } = $props();
</script>

<div class="h-screen w-screen">
	<Header />
	<div class="flex flex-col items-center justify-center">
		{@render children()}
	</div>
</div>
