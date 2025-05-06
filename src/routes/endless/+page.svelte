<script lang="ts">
	import Summary from '$lib/components/Summary.svelte';
	import Typing from '$lib/components/Typing.svelte';
	import { difficulty } from '$lib/difficulty.svelte';
	import { letterStats } from '$lib/stats.svelte';
	import { summaryState } from '$lib/summary.svelte';
	import { type_state } from '$lib/typeState.svelte';
	import { Alphabet, generateRandomCharacters } from '$lib/utils';
	import { untrack } from 'svelte';

	const stack: string[] = [];

	async function fetchWords() {
		const words = generateRandomCharacters(20);
		return words as string;
	}

	async function addToStack() {
		stack.push(await untrack(() => fetchWords()));
	}

	$effect(() => {
		stack.splice(0, stack.length);
		(async function () {
			type_state.text = 'loading...';
			for (let i = stack.length; i < 3; i++) {
				stack.push(await untrack(() => fetchWords()));
			}
			const first = stack.shift();
			if (first) {
				type_state.setNewText(first);
			}
		})();
	});

	$effect(() => {
		if (type_state.cursor === type_state.text.length) {
			untrack(() => {
				const first = stack.shift();
				if (first) {
					type_state.setNewText(first);
				} else {
					type_state.setNewText(type_state.text);
				}
				addToStack();
			});
		}
	});
</script>

{#if summaryState.display}
	<Summary />
{:else}
	<Typing chunk_seperator={'\n'} />
{/if}
