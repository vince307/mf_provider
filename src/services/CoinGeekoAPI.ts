interface CoinGeckoAPIConfig {
	apiUrl: string;
	apiKey: string;
}
export interface CoinGeckoPriceResponse {
	[coinId: string]: {
		usd: string | number;
		usd_market_cap: string | number;
		usd_24h_vol: string | number;
		usd_24h_change: string | number;
		last_updated_at: string | number;
	};
}

export interface CoinGeckoHistoricalPriceResponse {
	prices: [] | [number, number][];
	market_caps: [] | [number, number][];
	total_volumes: [] | [number, number][];
}

export interface ChartData {
	title: string;
	value: string;
	interval: string;
	trend: "up" | "down" | "neutral";
	data: number[];
}

const apiUrl =
	(import.meta.env.PUBLIC_COINGECKO_URL as CoinGeckoAPIConfig["apiUrl"]) ||
	"https://api.coingecko.com/api/v3";
const apiKey =
	(import.meta.env.PUBLIC_COINGECKO_API_KEY as CoinGeckoAPIConfig["apiKey"]) ||
	"";

if (!apiUrl || !apiKey) {
	throw new Error(
		"COINGECKO_URL and COINGECKO_API_KEY must be defined in the environment variables.",
	);
}
/**
 * Reduces an array of 720 prices (30 days, 30min interval) to 30 median values.
 * Accepts an array of 720 numbers and returns an array of 30 medians (one per day).
 * @param prices Array of 720 price points.
 * @returns Array of 30 median prices.
 */
function reduceToMedians(prices: number[]): number[] {
	if (!Array.isArray(prices) || prices.length !== 720) {
		throw new Error("Input must be an array of 720 prices.");
	}
	const medians: number[] = [];
	for (let i = 0; i < 720; i += 24) {
		const chunk = prices.slice(i, i + 24).sort((a, b) => a - b);
		const mid = Math.floor(chunk.length / 2);
		const median =
			chunk.length % 2 === 0 ? (chunk[mid - 1] + chunk[mid]) / 2 : chunk[mid];
		medians.push(median);
	}
	return medians;
}

/**
 * Fetches the current prices of specified cryptocurrencies from the CoinGecko API.
 * This function constructs the API URL with the provided coin IDs and fetches the prices in USD.
 * It returns a record mapping coin IDs to their prices in USD.
 */
export const fetchCoinPrices = async (
	coinId: string,
): Promise<CoinGeckoPriceResponse> => {
	try {
		console.log("fetchCoinPrices", coinId);
		if (!coinId) {
			throw new Error("No coin IDs provided for fetching prices.");
		}
		if (!apiUrl || !apiKey) {
			throw new Error("API URL or API Key is not defined.");
		}
		// Construct the API URL with the provided coin IDs
		const url = new URL(`${apiUrl}/simple/price`);
		url.searchParams.append("ids", coinId);
		url.searchParams.append("vs_currencies", "usd");
		url.searchParams.append("include_market_cap", "true");
		url.searchParams.append("include_24hr_vol", "true");
		url.searchParams.append("include_24hr_change", "true");
		url.searchParams.append("include_last_updated_at", "true");
		url.searchParams.append("precision", "2");

		const response = await fetch(url, {
			headers: {
				accept: "application/json",
				"x-cg-demo-api-key": apiKey, // Use the API key from environment variables
			},
		});

		if (!response.ok) {
			throw new Error(`Error fetching data: ${response.statusText}`);
		}

		const data = await response.json();
		return data as CoinGeckoPriceResponse;
	} catch (error) {
		console.error("Failed to fetch coin prices:", error);
		return {};
	}
};

/**
 * Fetches historical price data for a specific cryptocurrency from the CoinGecko API.
 * This function constructs the API URL with the provided coin ID and fetches the historical prices.
 * It returns an array of prices reduced to medians for the last 30 days.
 */
export const fetchCoinHistoricalData = async (
	coinId: string,
): Promise<number[]> => {
	try {
		console.log("fetchCoinHistoricalData", coinId);
		if (!coinId) {
			throw new Error("Coin ID must be provided for fetching historical data.");
		}
		if (!apiUrl || !apiKey) {
			throw new Error("API URL or API Key is not defined.");
		}
		const to = Math.floor(Date.now() / 1000); // Current time in seconds
		const from = to - 30 * 24 * 60 * 60; // 30 days in seconds
		// Construct the API URL for historical data
		const url = new URL(`${apiUrl}/coins/${coinId}/market_chart/range`);
		url.searchParams.append("vs_currency", "usd");
		url.searchParams.append("from", from.toString());
		url.searchParams.append("to", to.toString());
		url.searchParams.append("precision", "2");

		const response = await fetch(url, {
			headers: {
				accept: "application/json",
				"x-cg-demo-api-key": apiKey,
			},
		});

		if (!response.ok) {
			throw new Error(`Error fetching historical data: ${response.statusText}`);
		}

		const data = await response.json();
		const pricesArray = Array.isArray(data.prices)
			? data.prices.map((price: [number, number]) => price[1])
			: [];
		return reduceToMedians(pricesArray); // Extract and reduce prices
	} catch (error) {
		console.error(`Failed to fetch historical data for ${coinId}:`, error);
		return [];
	}
};

/**
 * Populates chart data for cryptocurrencies by fetching their historical prices and current prices.
 * It returns an array of ChartData objects containing title, value, interval, trend, and data.
 */
export const populateCryptoChartData = async (): Promise<ChartData[]> => {
	try {
		const coinIds = ["bitcoin", "ethereum", "solana"]; // Example coin IDs
		/**
		 * Prepare functions that return promises instead of calling them immediately.
		 * This way, the promises are created and executed only when Promise.all is called.
		 */
		const historicalDataPromises = coinIds.map(
			(coinId) => () => fetchCoinHistoricalData(coinId),
		);
		const cryptoCoinsDataPromises = coinIds.map(
			(coinId) => () => fetchCoinPrices(coinId),
		);

		// Call all promises at once
		const historicalData = await Promise.all(
			historicalDataPromises.map((fn) => fn()),
		);
		const cryptoCoinsData = await Promise.all(
			cryptoCoinsDataPromises.map((fn) => fn()),
		);

		const data = coinIds.map(
			(coinId, idx) =>
				({
					title: coinId.charAt(0).toUpperCase() + coinId.slice(1),
					value: cryptoCoinsData[idx]?.[coinId]?.usd?.toString() || "0",
					interval: "Last 30 days",
					trend:
						historicalData[idx][0] <
						historicalData[idx][historicalData[idx].length - 1]
							? "up"
							: historicalData[idx][0] >
									historicalData[idx][historicalData[idx].length - 1]
								? "down"
								: "neutral",
					data: Array.isArray(historicalData[idx]) ? historicalData[idx] : [],
				}) as ChartData,
		);
		return data;
	} catch (error) {
		console.error("Failed to populate crypto chart data:", error);
		return [];
	}
};
