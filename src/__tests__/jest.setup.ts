// This runs before the test environment is set up
// Suppress dotenv console logs globally
const originalLog = console.log;
console.log = (...args: any[]) => {
	const message = String(args[0] || '');
	// Filter out dotenv messages
	if (message.includes('dotenv') || message.includes('injecting env')) {
		return;
	}
	originalLog.apply(console, args);
};
