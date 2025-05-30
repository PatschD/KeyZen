<script lang="ts">
	import { timer } from '$lib/timer.svelte';
	import { type_state } from '$lib/typeState.svelte';
	import { updateUnderline } from '$lib/typing';
	import { onMount, untrack } from 'svelte';
	import Metrics from './Metrics.svelte';
	import { stats } from '$lib/stats.svelte';
	import Mode from './Mode.svelte';

	let underline: HTMLDivElement;
	let textContainer: HTMLDivElement;
	let displaySpace = '·';
	let displayTab = '\u00A0\u00A0';

	// let chunk_seperator = '\n';
	let { chunk_seperator = '\n' } = $props();

	let chunk_size = 1;

	$effect(() => {
		if (type_state.cursor === type_state.text.length) {
			untrack(() => stats.update());
			// summaryState.display = true;
			return;
		}
		// console.log('i am here');
		// console.log(bounds, type_state.cursor);
		if (type_state.cursor >= bounds.upper) {
			type_state.chunk += 1;
		} else if (type_state.cursor < bounds.lower) {
			console.log('NO');
			// type_state.chunk = Math.max(0, type_state.chunk - 1);
		}

		updateUnderline(type_state, textContainer, underline);
	});

	const bounds = $derived.by(() => {
		const b = getIndexOfWordRange(type_state.text, type_state.chunk, chunk_size, chunk_seperator);
		const lower_offset = b.lower === 0 ? 0 : 1;
		b.lower += lower_offset;

		b.upper += 1;
		return b;
	});

	const bounds_pre = $derived.by(() => {
		const b = getIndexOfWordRange(
			type_state.text,
			type_state.chunk - 1,
			chunk_size,
			chunk_seperator
		);
		// b.lower = Math.max(0, b.lower - 1);
		if (b.lower > 0) b.lower += 1;
		return b;
	});

	const bounds_post = $derived.by(() => {
		const b = getIndexOfWordRange(
			type_state.text,
			type_state.chunk + 1,
			chunk_size,
			chunk_seperator
		);
		b.lower += 1;
		return b;
	});

	// $effect(() => {
	// 	for (let i = 0; i < 5; i++) {
	// 		const b = getIndexOfWordRange(type_state.text, i, chunk_size, chunk_seperator);
	// 		console.log(type_state.text.slice(b.lower, b.upper));
	// 	}
	// });

	function getIndexOfWordRange(text: string, chunk: number, chunk_size: number, seperator = ' ') {
		if (chunk < 0)
			return {
				lower: 0,
				upper: 0
			};
		const arr = text.split(seperator);
		const chunk_pre = chunk === 0 ? [] : arr.slice(0, chunk * chunk_size);
		const chunk_main = arr.slice(chunk * chunk_size, (chunk + 1) * chunk_size);

		const lower = [...chunk_pre].join(seperator);
		const upper = [...chunk_pre, ...chunk_main].join(seperator);

		return {
			lower: chunk === 0 ? 0 : lower.length,
			upper: upper.length
		};
	}

	function onKeyDown(e: KeyboardEvent) {
		untrack(() => (timer.lasInteraction = Date.now()));
		if (e.key === 'Backspace') {
			const reduce = type_state.text[type_state.cursor - 1] === '\t' ? 2 : 1;
			type_state.cursor = Math.max(bounds.lower, type_state.cursor - reduce);
			type_state.totalKeys++;
			return;
		}

		if (e.key.length > 2 && e.key !== 'Enter') {
			return;
		}

		type_state.totalKeys++;
		let current = e.key;
		if (current === 'Enter') current = '\n';
		const want = type_state.text[type_state.cursor];
		const correct = current === want;

		if (!type_state.stats[type_state.cursor]) {
			type_state.stats[type_state.cursor] = [];
		}

		type_state.stats[type_state.cursor].push(correct ? 1 : 0);
		type_state.increment();
	}

	function getColor(idx: number, type_state: any, inBounds = true): string {
		if (idx >= type_state.cursor) return inBounds ? 'text-gray-400' : 'text-gray-200';
		else {
			const arr = type_state.stats[idx];
			if (!arr) return '';
			return arr[arr.length - 1]
				? inBounds
					? 'text-gray-800'
					: 'text-gray-200'
				: inBounds
					? 'text-red-400'
					: 'text-red-200';
		}
	}
	let maxLineWidth = 35;
	let tolerance = 5;
	let lastNewline = 0;
	onMount(() => (lastNewline = 0));
	let startLooking = false;
	function checkBreak(c: string) {
		return false;
		lastNewline++;
		if (c === '\n') {
			startLooking = false;
			lastNewline = 0;
			return;
		}
		if (lastNewline > maxLineWidth + tolerance) {
			startLooking = false;
			lastNewline = 0;
			return;
		}

		if (lastNewline % maxLineWidth === 0) {
			startLooking = true;
		}
		if (startLooking) {
			if (c === ' ') {
				startLooking = false;
				lastNewline = 0;
				return true;
			}
		}
		return false;
	}
</script>

<svelte:window on:keydown|preventDefault={onKeyDown} />

<div class="mt-12 flex h-full flex-col items-center justify-center">
	<div class="flex h-[70vh] w-full flex-col items-center justify-center">
		<div class="text-container mx-auto max-w-5xl" bind:this={textContainer}>
			{#each type_state.text as t, i (i)}
				{#if i >= bounds_pre.lower && i < bounds_post.upper}
					{@const needBreak = checkBreak(t)}
					{@const inBounds = i >= bounds.lower && i < bounds.upper}
					{@const color = getColor(i, type_state, inBounds)}
					<span
						class={`mono-text ${color} text-xl md:text-2xl lg:text-3xl`}
						id={`text_element_${i}`}
					>
						{#if t === ' '}
							{displaySpace}
						{:else if t === '\n'}
							↵
						{:else if t === '\t'}
							{displayTab}
						{:else}
							{t}
						{/if}
					</span>
					{#if needBreak}
						<div class="flex-break"></div>
					{/if}
					{#if t === '\n'}
						<div class="flex-break"></div>
					{/if}
				{/if}
			{/each}
			<div id="dynamicUnderline" bind:this={underline}></div>
		</div>
	</div>
	<Metrics />
	<Mode />
</div>

<style>
	.text-container {
		position: relative;
		/* display: inline-block; Remove or override */
		display: flex; /* Use Flexbox */
		flex-wrap: wrap; /* Allow items to wrap */
		margin-bottom: 10px;
		padding-bottom: 5px;
		/* border: 1px solid #ccc; */
		padding: 10px;
		line-height: 1.2; /* Adjust line height for wrapped lines */
		/* Consider adding align-items if vertical alignment looks off */
		/* align-items: baseline;  */
	}
	.flex-break {
		flex-basis: 100%; /* Make this invisible item take up the full width */
		height: 0; /* Ensure it doesn't add extra vertical space */
		overflow: hidden; /* Prevent potential content overflow issues */
	}

	.mono-text {
		letter-spacing: normal; /* Or adjust if needed, but keep it consistent */
		display: inline-block; /* Helps contain the text properly */
	}

	#dynamicUnderline {
		position: absolute;
		top: 0; /* Position at the very bottom of the container */
		left: 0; /* Start at the left edge (translateX will move it) */
		height: 3px; /* Underline thickness */
		background-color: dodgerblue; /* Underline color */

		/* Animation */
		transition:
			transform 0.25s ease-out,
			width 0.1s ease-out; /* Smooth transition for movement */
	}
</style>
