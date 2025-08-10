import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginModuleFederation } from "@module-federation/rsbuild-plugin";
import moduleFederationConfig from "./module-federation.config";

export default defineConfig({
	plugins: [pluginReact(), pluginModuleFederation(moduleFederationConfig)],
	html: {
		title: "WorldLedger",
		favicon: "./src/assets/worlledger.png",
	},
	server: {
		port: 3001,
		headers: {
			"Access-Control-Allow-Origin": "*",
		},
	},
	output: {
		distPath: {
			root: "dist",
		},
		assetPrefix: "https://mf-provider.vercel.app",
	},
});
