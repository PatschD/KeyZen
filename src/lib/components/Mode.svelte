<script lang="ts">
	import { page } from '$app/stores';
	import { difficulty } from '$lib/difficulty.svelte';
	import { language } from '$lib/language.svelte';
	import { summaryState } from '$lib/summary.svelte';
	import { DropdownMenu } from 'bits-ui';

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
	// This variable controls whether the dropdown is open
	let isOpen = false;

	// Only allow opening via click, not keyboard
	function handleTriggerKeyDown(event) {
		// Prevent keyboard events (Space, Enter, Arrow keys) from opening the dropdown
		event.preventDefault();
		event.currentTarget.blur();
	}

	function handleTriggerClick() {
		// Only toggle the dropdown when clicked
		isOpen = !isOpen;
	}
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
					<DropdownMenu.Trigger
						class="cursor-pointer"
						onkeydown={handleTriggerKeyDown}
						onclick={handleTriggerClick}
					>
						difficulty: {d}</DropdownMenu.Trigger
					>

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
			{:else if mode === 'code'}
				<DropdownMenu.Root>
					<DropdownMenu.Trigger
						class="cursor-pointer"
						onkeydown={handleTriggerKeyDown}
						onclick={handleTriggerClick}
					>
						language: {language.lang}</DropdownMenu.Trigger
					>

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
