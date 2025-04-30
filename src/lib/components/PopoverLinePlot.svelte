<script lang="ts">
	import Chart from 'chart.js/auto';
	import type { Chart as ChartType, Point } from 'chart.js/auto';

	// Your testData
	let testData = {
		chunks: [
			{ a: { total: 10, correct: 5 } }, // Index 0 -> 50%
			{ a: { total: 10, correct: 15 } }, // Index 1 -> 150%
			{ a: { total: 10, correct: 51 } }, // Index 2 -> 510%
			{ a: { total: 50, correct: 5 } } // Index 3 -> 10%
		]
	};

	$effect(() => {
		// 1. Prepare the data for the scatter plot ({x: index, y: accuracy %})
		const scatterData: Point[] = testData.chunks.map((chunk, index) => {
			const total = chunk.a.total;
			const correct = chunk.a.correct;
			const accuracy = total === 0 ? 0 : (correct / total) * 100;
			return {
				x: index, // Use the chunk index as the x-coordinate
				y: accuracy // Use the calculated accuracy percentage as the y-coordinate
			};
		});

		// 2. Get canvas and context
		const canvasEl = document.getElementById('myAccuracyScatterChart') as HTMLCanvasElement | null;
		if (!canvasEl) {
			console.error('Accuracy Scatter Chart Error: Canvas element not found!');
			return;
		}
		const ctx = canvasEl.getContext('2d');
		if (!ctx) {
			console.error('Accuracy Scatter Chart Error: Could not get 2D context!');
			return;
		}

		// Variable to hold the chart instance
		let scatterChartInstance: ChartType | null = null;

		// 3. Create the new scatter chart
		scatterChartInstance = new Chart(ctx, {
			type: 'scatter',
			data: {
				datasets: [
					{
						label: 'Accuracy per Position (%)',
						data: scatterData,
						backgroundColor: 'rgb(255, 99, 132)',
						pointRadius: 6,
						pointHoverRadius: 8
					}
				]
			},
			options: {
				scales: {
					x: {
						type: 'linear',
						position: 'bottom',
						title: {
							display: false // X-axis title remains hidden
						},
						ticks: {
							display: false // Set display to false to hide X-axis tick labels
							// stepSize: 1 // stepSize is irrelevant if display is false
						},
						// Keep min/max for positioning points relative to the invisible ticks
						min: -0.5,
						max: testData.chunks.length - 0.5
					},
					y: {
						type: 'linear',
						beginAtZero: true,
						title: {
							display: true,
							text: 'Accuracy (%)'
						},
						ticks: {
							display: true, // Ensure Y-axis ticks are still displayed
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
						callbacks: {
							label: function (context) {
								let label = `Position: ${context.parsed.x}`;
								if (context.parsed.y !== null) {
									label += `, Accuracy: ${context.parsed.y.toFixed(2)}%`;
								}
								return label;
							}
						}
					}
				}
			}
		});

		// 4. Return cleanup function
		return () => {
			if (scatterChartInstance) {
				scatterChartInstance.destroy();
				scatterChartInstance = null;
			}
		};
	});
</script>

<div class="h-screen w-full bg-white p-4">
	<canvas id="myAccuracyScatterChart"></canvas>
</div>
