import { Colors } from "@/constants/Colors";
import { useColorScheme } from "./useColorScheme";

type ThemeProps = {
	light?: string;
	dark?: string;
};

export function useThemeColor(
	props: ThemeProps,
	colorName:
		| (keyof typeof Colors.light & keyof typeof Colors.dark)
		| "primary"
		| "secondary",
) {
	const theme = useColorScheme() ?? "light";
	const colorFromProps = props[theme];

	if (colorFromProps) {
		return colorFromProps;
	}

	const colorSet = Colors[theme as "light" | "dark"] as any;
	return colorSet[colorName] ?? colorSet.text;
}
