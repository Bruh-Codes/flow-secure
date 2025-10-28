import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FlowProvider } from "@onflow/react-sdk";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import flowJson from "../flow.json";
import { Toaster } from "sonner";
import { ThemeProvider } from "./components/theme-provider";

const App = () => {
	return (
		<FlowProvider
			config={{
				accessNodeUrl: "https://access-testnet.onflow.org",
				flowNetwork: "testnet",
				appDetailTitle: "My Flow App",
				appDetailIcon: "https://example.com/icon.png",
				appDetailDescription: "A decentralized app on Flow",
				appDetailUrl: "https://myapp.com",
			}}
			flowJson={flowJson}
		>
			<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
				<TooltipProvider>
					<Toaster />
					<BrowserRouter>
						<Routes>
							<Route path="/" element={<Index />} />
							{/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
							<Route path="*" element={<NotFound />} />
						</Routes>
					</BrowserRouter>
				</TooltipProvider>
			</ThemeProvider>
		</FlowProvider>
	);
};

export default App;
