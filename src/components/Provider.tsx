import React from "react";
import { useEffect } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import AppTheme from "../shared-theme/AppTheme";
import type { ChartData } from "../services/CoinGeekoAPI";
import { populateCryptoChartData } from "../services/CoinGeekoAPI";
import StatCard from "./StatCard";
import Grid from "@mui/material/Grid";

export default function Provider(props: { disableCustomTheme?: boolean }) {
	const [coinsData, setCoinsData] = React.useState<ChartData[]>([]);
	// Ensure populateCryptoChartData is only called once by using an empty dependency array in useEffect.
	useEffect(() => {
		const fetchData = async () => {
			const data = await populateCryptoChartData();
			setCoinsData(data);
		};
		fetchData();
	}, []);

	return (
		<div className="App">
			<AppTheme {...props}>
				<CssBaseline enableColorScheme />
				{coinsData.map((card, index) => (
					<Grid
						key={index}
						sx={{
							mb: 2,
						}}
					>
						<StatCard {...card} />
					</Grid>
				))}
			</AppTheme>
		</div>
	);
}
