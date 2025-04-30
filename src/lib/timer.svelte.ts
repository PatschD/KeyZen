export const timer = $state({
	time: 0,
	tickTime: 1000, // Interval in milliseconds (1 second)
	isPaused: false,
	hasStarted: false,
	interval: undefined as number | undefined, // Explicitly type interval ID
	lasInteraction: Date.now(),

	/**
	 * Starts the timer interval.
	 * Clears any existing interval before starting a new one.
	 */
	start() {
		// Clear existing interval if it's running
		if (this.interval) {
			clearInterval(this.interval);
		}
		this.lasInteraction = Date.now();
		// Set up the new interval using an arrow function wrapper
		// This ensures 'this.tick()' is called with the correct 'this' context.
		this.interval = setInterval(() => {
			this.tick(); // Call the tick method correctly
		}, this.tickTime);

		// Update state flags
		this.hasStarted = true;
		this.isPaused = false;
	},

	/**
	 * Increments the timer's time state.
	 * This method is now correctly called by the interval in start().
	 */
	tick() {
		const ms = Date.now() - this.lasInteraction;
		if (ms > 3000) {
			return;
		}
		this.time++;
		// You might want to add console.log(this.time) here for debugging
	},

	/**
	 * Pauses the timer by clearing the interval.
	 */
	pause() {
		if (this.interval) {
			clearInterval(this.interval);
			this.interval = undefined; // Clear the interval ID
			this.isPaused = true;
			console.log('Timer paused');
		}
	},

	/**
	 * Resets the timer state to initial values.
	 */
	reset() {
		if (this.interval) {
			clearInterval(this.interval);
		}
		this.time = 0;
		this.isPaused = false;
		this.hasStarted = false;
		this.interval = undefined;
		console.log('Timer reset');
	}
});
