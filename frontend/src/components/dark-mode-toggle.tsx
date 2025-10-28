// function DarkModeToggle({ onToggle }) {
// 	return (

// 	);
// }

// export default DarkModeToggle;

import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";

export function ModeToggle() {
	const { setTheme, theme } = useTheme();

	const isDark = theme == "dark";

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					onClick={() => setTheme(isDark ? "light" : "dark")}
					className="rounded-lg bg-gray-200 dark:bg-gray-700"
				>
					{!isDark ? "🌙" : "☀️"}
				</Button>
			</DropdownMenuTrigger>
		</DropdownMenu>
	);
}
