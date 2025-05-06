<script lang="ts">
	import { stats } from '$lib/stats.svelte';
	import Chart from 'chart.js/auto';
	import type { Chart as ChartType, ChartConfiguration } from 'chart.js/auto';

	// Reactive variables to hold chart data
	let chartDataWpm: number[] = [];
	let chartDataAccuracy: number[] = [];
	let chartLabels: string[] = [];

	// Variable to hold the chart instance
	let lineChartInstance: ChartType | null = null;
	let canvasEl: HTMLCanvasElement | null = $state(null);

	// Function to update chart data based on the stats store
	function updateChartData() {
		const numChunks = stats.wpm.length;
		chartLabels = Array.from({ length: numChunks }, (_, i) => `Chunk ${i + 1}`);
		chartDataWpm = [...stats.wpm]; // Create copies to avoid direct mutation issues if any
		chartDataAccuracy = [...stats.accuracy];
	}

	// Effect to initialize and update the chart
	$effect(() => {
		// Ensure canvas element is available
		if (!canvasEl) {
			console.log('Canvas element not ready yet.');
			return;
		}

		// Update local chart data arrays whenever stats change
		updateChartData();

		// Get canvas context
		const ctx = canvasEl.getContext('2d');
		if (!ctx) {
			console.error('Could not get 2D context!');
			return;
		}

		// --- Destroy existing chart before creating a new one ---
		if (lineChartInstance) {
			lineChartInstance.destroy();
			lineChartInstance = null;
		}
		// --- End Destroy ---

		// Chart.js configuration
		const chartConfig: ChartConfiguration = {
			type: 'line',
			data: {
				labels: chartLabels,
				datasets: [
					{
						label: 'WPM',
						data: chartDataWpm,
						borderColor: 'rgb(75, 192, 192)', // Teal
						backgroundColor: 'rgba(75, 192, 192, 0.5)',
						yAxisID: 'yWpm', // Link to the WPM Y-axis
						tension: 0.1 // Optional: makes lines slightly curved
					},
					{
						label: 'Accuracy (%)',
						data: chartDataAccuracy,
						borderColor: 'rgb(255, 99, 132)', // Red
						backgroundColor: 'rgba(255, 99, 132, 0.5)',
						yAxisID: 'yAccuracy', // Link to the Accuracy Y-axis
						tension: 0.1 // Optional: makes lines slightly curved
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false, // Allow chart to fill container height
				interaction: {
					mode: 'index', // Show tooltips for all datasets at the same index
					intersect: false
				},
				plugins: {
					title: {
						display: true,
						text: 'WPM and Accuracy Over Chunks'
					},
					tooltip: {
						callbacks: {
							label: function (context) {
								let label = context.dataset.label || '';
								if (label) {
									label += ': ';
								}
								if (context.parsed.y !== null) {
									// Add '%' for accuracy dataset
									if (context.dataset.label === 'Accuracy (%)') {
										label += context.parsed.y.toFixed(1) + '%';
									} else {
										label += context.parsed.y;
									}
								}
								return label;
							}
						}
					}
				},
				scales: {
					x: {
						title: {
							display: true,
							text: 'Chunk'
						}
					},
					yWpm: {
						// Define the WPM Y-axis
						type: 'linear',
						display: true,
						position: 'left',
						title: {
							display: true,
							text: 'Words Per Minute (WPM)'
						},
						// Optional: suggest min/max or let Chart.js decide
						// suggestedMin: 0,
						grid: {
							drawOnChartArea: false // Optional: only draw grid for accuracy axis
						}
					},
					yAccuracy: {
						// Define the Accuracy Y-axis
						type: 'linear',
						display: true,
						position: 'right',
						min: 0, // Accuracy starts at 0
						max: 100, // Accuracy ends at 100
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
				}
			}
		};

		// Create the new chart instance
		lineChartInstance = new Chart(ctx, chartConfig);

		// Cleanup function for the effect
		return () => {
			if (lineChartInstance) {
				lineChartInstance.destroy();
				lineChartInstance = null;
				// console.log('Stats chart destroyed'); // For debugging
			}
		};
	}); // No explicit dependencies needed for $effect with $state
</script>

<div class="h-[30vh] w-full bg-white p-4">
	{#if !canvasEl}
		<p>Loading chart...</p>
	{/if}
	<canvas bind:this={canvasEl}></canvas>
</div>

<style>
	/* Optional: Add some basic styling */
	div {
		position: relative; /* Needed for chart responsiveness */
		height: 40vh; /* Example height, adjust as needed */
		width: 100%;
	}
	canvas {
		display: block; /* Prevents extra space below canvas */
	}
</style>
