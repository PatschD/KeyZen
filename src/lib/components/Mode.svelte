<script lang="ts">
	import { page } from '$app/stores';
	import { difficulty } from '$lib/difficulty.svelte';
	import { stats } from '$lib/stats.svelte';
	import { summaryState } from '$lib/summary.svelte';
	import { timer } from '$lib/timer.svelte';
	import { type_state } from '$lib/typeState.svelte';
	import { untrack } from 'svelte';
	import { DropdownMenu } from 'bits-ui';

	$effect(() => {
		untrack(() => timer.start());
	});

	$effect(() => {
		const currentChunk = type_state.chunk;

		if (currentChunk === 0) {
			return;
		} else {
			untrack(() => stats.update());
		}
	});
	const mode = $page.url.pathname.replace('/', '') || 'intro';
	const d = $derived.by(() => {
		let d;
		switch (difficulty.difficulty) {
			case 0:
				d = 'easy';
				break;
			case 1:
				d = 'medium';
				break;
			case 2:
				d = 'hard';
				break;
			default:
				d = 'easy';
		}
		return d;
	});
</script>

<div class="mt-4 flex w-full flex-col items-center">
	<div class="flex md:w-[728px]">
		<div>
			mode: {mode}
		</div>
		&nbsp;&nbsp;
		<div>
			{#if mode === 'practice'}
				<DropdownMenu.Root>
					<DropdownMenu.Trigger class="cursor-pointer">difficulty: {d}</DropdownMenu.Trigger>

					<DropdownMenu.Content class="rounded bg-gray-200 p-2">
						<DropdownMenu.CheckboxItem
							class="m-2 cursor-pointer"
							onclick={() => (difficulty.difficulty = 0)}>easy</DropdownMenu.CheckboxItem
						>
						<DropdownMenu.CheckboxItem
							class="m-2 cursor-pointer"
							onclick={() => (difficulty.difficulty = 1)}>medium</DropdownMenu.CheckboxItem
						>
						<DropdownMenu.CheckboxItem
							class="m-2 cursor-pointer"
							onclick={() => (difficulty.difficulty = 2)}>hard</DropdownMenu.CheckboxItem
						>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			{/if}
		</div>
		&nbsp;&nbsp;
		<button
			class="cursor-pointer underline"
			onclick={() => {
				summaryState.display = true;
			}}>Summary-></button
		>
	</div>
</div>
