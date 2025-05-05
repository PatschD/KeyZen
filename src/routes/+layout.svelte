<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import '../app.css';

	let { children } = $props();
</script>

<div class="h-screen w-screen">
	<Header />
	<div class="flex flex-col items-center justify-center">
		{@render children()}
	</div>
</div>
