<script lang="ts">
	import Summary from '$lib/components/Summary.svelte';
	import Typing from '$lib/components/Typing.svelte';
	import { letterStats } from '$lib/stats.svelte';
	import { summaryState } from '$lib/summary.svelte';
	import { type_state } from '$lib/typeState.svelte';
	import { Alphabet } from '$lib/utils';
	import { untrack } from 'svelte';

	async function fetchWords() {
		type_state.text = 'loading...';
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
			errorRates
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
		type_state.setNewText(words);
		return words;
	}
	let lessonCount = $state(0);

	$effect(() => {
		untrack(() => fetchWords());
	});

	$effect(() => {
		if (lessonCount === 3) {
			summaryState.display = true;
			return;
		}
		if (type_state.cursor === type_state.text.length) {
			lessonCount++;
			fetchWords();
		}
	});
</script>

{#if summaryState.display}
	<Summary />
{:else}
	<Typing chunk_seperator={'\n'} />
{/if}
