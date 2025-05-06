<script lang="ts">
	import Summary from '$lib/components/Summary.svelte';
	import Typing from '$lib/components/Typing.svelte';
	import { difficulty } from '$lib/difficulty.svelte';
	import { letterStats } from '$lib/stats.svelte';
	import { summaryState } from '$lib/summary.svelte';
	import { type_state } from '$lib/typeState.svelte';
	import { Alphabet } from '$lib/utils';
	import { untrack } from 'svelte';

	const stack: string[] = [];

	async function fetchWords() {
		// type_state.text = 'loading...';
		const errorRates = Alphabet.reduce((previous: any, current) => {
			if (letterStats.global[current].total === 0) {
				previous[current] = 0;
			} else {
				previous[current] =
					1 - letterStats.global[current].correct / letterStats.global[current].total;
			}
			return previous;
		}, {});

		const payload = {
			...errorRates,
			difficulty: difficulty.difficulty
		};
		const response = await fetch('/api/v1/wordList', {
			// Target your POST endpoint
			method: 'POST',
			headers: {
				// Indicate we're sending JSON data
				'Content-Type': 'application/json'
				// Add any other headers like Authorization if needed
				// 'Authorization': 'Bearer YOUR_TOKEN'
			},
			// Convert the JavaScript object payload to a JSON string
			body: JSON.stringify(payload)
		});
		const json_response = await response.json();
		const words = json_response.words.join(' ');
		return words as string;
	}

	let lessonCount = $state(0);

	async function addToStack() {
		stack.push(await untrack(() => fetchWords()));
	}

	$effect(() => {
		const dp = difficulty.difficulty;
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
			lessonCount++;
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
