import fs from 'fs'; // Import Node.js file system module
import path from 'path'; // Import Node.js path module
import { fileURLToPath } from 'url'; // Helper to get directory path in ES modules
import { json, error as svelteError } from '@sveltejs/kit';

// --- Load Word List (Runs Once on Server Start) ---

let wordList: string[] = []; // Variable to hold the loaded words

try {
	// 1. Determine the directory of the current file (__dirname equivalent for ES Modules)
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = path.dirname(__filename);

	// 2. Construct the full path to your JSON file
	//    (Assumes typing_words.json is in the SAME directory as this +server.ts file)
	const filePath = path.join(__dirname, 'typing_words.json');

	// 3. Read the file content synchronously (fine for server startup)
	console.log(`Attempting to read word list from: ${filePath}`);
	const fileContent = fs.readFileSync(filePath, 'utf-8');

	// 4. Parse the JSON data into the wordList array
	wordList = JSON.parse(fileContent);

	console.log(`Successfully loaded ${wordList.length} words.`);
} catch (error) {
	// Log the error if reading/parsing fails
	console.error('Error loading word list:', error);
	// Handle the error appropriately:
	// - You could provide a default fallback list:
	//   wordList = ["error", "loading", "list", "default", "words"];
	// - Or allow the endpoint to return an error state later.
	// For now, wordList will remain empty if loading fails.
}

// --- API Endpoint Handler ---

export async function POST({ request }) {
	console.log('AM i here?');
	// Check if the word list loaded correctly
	if (!wordList || wordList.length === 0 || wordList[0] === 'error') {
		// Check for fallback
		console.error('Word list not available for sampling.');
		// Use SvelteKit's error helper for proper error responses
		throw svelteError(500, 'Word list is unavailable on the server.');
	}

	let requestData;
	try {
		// Parse the JSON body from the request
		requestData = await request.json();
	} catch (e) {
		console.error('Failed to parse request JSON body:', e);
		throw svelteError(400, 'Invalid JSON data in request body.');
	}
	console.log(requestData);

	// Extract data from the parsed body (provide defaults)
	const errorRates = requestData.errorRates || {}; // Expect an object, default to empty
	const numWordsToSample = typeof requestData.count === 'number' ? requestData.count : 10; // Default number of words
	const baseWeight = typeof requestData.baseWeight === 'number' ? requestData.baseWeight : 1.0;
	const errorScalingFactor = typeof requestData.scale === 'number' ? requestData.scale : 10.0; // Example scale

	// Validate errorRates structure (basic check)
	if (typeof errorRates !== 'object' || Array.isArray(errorRates)) {
		throw svelteError(400, 'Invalid format for errorRates, expected an object.');
	}

	// Perform the sampling using the loaded word list and received error rates
	const sampledWords = sampleWordsByErrorRate(
		wordList,
		errorRates,
		numWordsToSample,
		baseWeight,
		errorScalingFactor
	);

	// Return the sampled words as a JSON response
	return json({ words: sampledWords });
}

function weightedRandomSample(population: string[], weights: number[], k: number) {
	if (population.length !== weights.length) {
		throw new Error('Population and weights must have the same length.');
	}
	const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
	if (totalWeight <= 0) {
		console.warn('Total weight is zero or negative. Attempting uniform sampling.');
		if (population.length > 0) {
			const results = [];
			for (let i = 0; i < k; i++) {
				results.push(population[Math.floor(Math.random() * population.length)]);
			}
			return results;
		} else {
			return [];
		}
	}
	const cumulativeWeights = [];
	let cumulativeSum = 0;
	for (const weight of weights) {
		cumulativeSum += weight;
		cumulativeWeights.push(cumulativeSum);
	}
	const results = [];
	for (let i = 0; i < k; i++) {
		const randomNum = Math.random() * totalWeight;
		const index = cumulativeWeights.findIndex((cw) => cw >= randomNum);
		results.push(population[index === -1 ? population.length - 1 : index]);
	}
	return results;
}

function sampleWordsByErrorRate(
	wordList: string[],
	errorRates: Record<string, number>,
	numWordsToSample: number,
	baseWeight = 1.0,
	errorScalingFactor = 1.0
) {
	// --- Input Validation ---
	if (!wordList || wordList.length === 0 || numWordsToSample <= 0) {
		return [];
	}
	if (baseWeight < 0) {
		throw new Error('baseWeight must be non-negative.');
	}
	if (typeof errorRates !== 'object' || errorRates === null) {
		console.warn('errorRates should be an object. Treating as empty.');
		errorRates = {};
	}

	// --- Prepare Data ---
	const normalizedErrorRates: Record<string, number> = {};
	for (const char in errorRates) {
		if (
			Object.hasOwnProperty.call(errorRates, char) &&
			typeof errorRates[char] === 'number' &&
			errorRates[char] > 0
		) {
			normalizedErrorRates[char.toLowerCase()] = errorRates[char];
		}
	}
	const weights = [];
	const validWords = [];
	// --- Calculate Weights ---
	for (const word of wordList) {
		if (typeof word !== 'string') {
			console.warn(`Skipping non-string item in wordList: ${word}`);
			continue;
		}
		const lowerWord = word.toLowerCase();
		let errorBonus = 0;
		for (let i = 0; i < lowerWord.length; i++) {
			const char = lowerWord[i];
			errorBonus += normalizedErrorRates[char] || 0.0;
		}
		let weight = baseWeight + errorScalingFactor * errorBonus;
		if (weight < 0) {
			weight = 0;
		}
		weights.push(weight);
		validWords.push(word);
	}
	// --- Perform Sampling ---
	if (validWords.length === 0) {
		return [];
	}
	try {
		return weightedRandomSample(validWords, weights, numWordsToSample);
	} catch (error) {
		console.error('Error during weighted sampling:', error);
		console.warn('Falling back to uniform sampling due to error.');
		const results = [];
		if (validWords.length > 0) {
			for (let i = 0; i < numWordsToSample; i++) {
				results.push(validWords[Math.floor(Math.random() * validWords.length)]);
			}
		}
		return results;
	}
}
