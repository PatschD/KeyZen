<script lang="ts">
	import { letterStats } from '$lib/stats.svelte';
	import { Alphabet, getColorLetters } from '$lib/utils';
	import Chart from 'chart.js/auto';
	import type { Chart as ChartType } from 'chart.js/auto';

	// --- Sample Input Data ---
	// Replace this with your actual data object

	// Define the full alphabet

	$effect(() => {
		// 1. Prepare data for ALL letters
		const labels: string[] = [];
		const accuracyData: number[] = [];
		const backgroundColors: string[] = [];
		const borderColors: string[] = [];
		const defaultStats = { total: 0, correct: 0 };

		for (const letter of Alphabet) {
			const stats = letterStats.global[letter] ?? defaultStats;
			const total = stats.total;
			const correct = stats.correct;

			const accuracy = total === 0 ? 0 : (correct / total) * 100;
			const bgColor = getColorLetters(stats, 5).replace('background-color: ', '').replace(';', '');
			const borderColor = bgColor.replace(/, [0-9.]+\)$/, ', 1)'); // Solid border

			labels.push(letter);
			// Ensure accuracy doesn't exceed 100 for plotting, though calculation might yield > 100 if correct > total
			// Clamping data visually if needed, though axis max=100 will clip it anyway.
			// If you strictly want to cap data value itself: accuracyData.push(Math.min(100, accuracy));
			accuracyData.push(accuracy); // Plot calculated accuracy
			backgroundColors.push(bgColor);
			borderColors.push(borderColor);
		}

		// 2. Get canvas and context
		const canvasEl = document.getElementById(
			'fullAlphabetAccuracyChart'
		) as HTMLCanvasElement | null;
		if (!canvasEl) {
			console.error('Canvas element not found!');
			return;
		}
		const ctx = canvasEl.getContext('2d');
		if (!ctx) {
			console.error('Could not get 2D context!');
			return;
		}

		// Variable to hold the chart instance
		let barChartInstance: ChartType | null = null;

		// 3. Create the new bar chart
		barChartInstance = new Chart(ctx, {
			type: 'bar',
			data: {
				labels: labels, // All 26 letters
				datasets: [
					{
						label: 'Accuracy (%)',
						data: accuracyData, // Accuracy for all 26 letters
						backgroundColor: backgroundColors,
						borderColor: borderColors,
						borderWidth: 1,
						barPercentage: 0.7, // Bar width relative to category space
						categoryPercentage: 0.8 // Category space relative to axis segment
					}
				]
			},
			options: {
				scales: {
					x: {
						title: {
							display: true,
							text: 'Letter'
						},
						ticks: {
							autoSkip: false, // Show all labels
							maxRotation: 90, // Allow rotation
							minRotation: 0
						}
					},
					y: {
						beginAtZero: true,
						max: 100, // Set Y-axis maximum strictly to 100
						title: {
							display: true,
							text: 'Accuracy (%)'
						},
						ticks: {
							// Add '%' sign to Y axis labels
							callback: function (value) {
								if (typeof value === 'number') {
									return value + '%';
								}
								return value;
							}
						}
					}
				},
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					tooltip: {
						displayColors: false, // <-- Change #2: Hides color box

						callbacks: {
							title: function (context) {
								// context is an array of tooltip items
								if (context.length > 0) {
									const index = context[0].dataIndex;
									return `Letter: ${labels[index]}`;
								}
								return '';
							},
							label: function (context) {
								const index = context.dataIndex;
								const letter = labels[index]; // Get the letter from our labels array
								const statsLetter = letterStats.global[letter] ?? defaultStats; // Get the original stats
								const correct = statsLetter.correct;
								const total = statsLetter.total;
								const accuracy = context.parsed.y; // Get the calculated accuracy

								// Format the output lines for the tooltip
								const accuracyLine = `Accuracy: ${accuracy !== null ? accuracy.toFixed(1) + '%' : 'N/A'}`;
								const countsLine = `Correct/Total: ${correct} / ${total}`; // (Correct / Total)

								// Return an array of strings for multi-line tooltips
								return [accuracyLine, countsLine];
							}
						}
					}
				}
			}
		});

		// 4. Return cleanup function
		return () => {
			if (barChartInstance) {
				barChartInstance.destroy();
				barChartInstance = null;
			}
		};
	});
</script>

<div class="h-[35vh] w-full bg-white p-4">
	<canvas id="fullAlphabetAccuracyChart"></canvas>
</div>
