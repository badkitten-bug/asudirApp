/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * Updated for Identity Verification MVP with blue theme.
 */

const primaryColor = "#1E78C6";
const secondaryColor = "#EEF8F7";
const tintColorDark = "#fff";

export const Colors = {
	light: {
		text: "#11181C",
		background: "#fff",
		tint: primaryColor,
		icon: "#687076",
		tabIconDefault: "#687076",
		tabIconSelected: primaryColor,
		primary: primaryColor,
		secondary: secondaryColor,
	},
	dark: {
		text: "#ECEDEE",
		background: "#151718",
		tint: tintColorDark,
		icon: "#9BA1A6",
		tabIconDefault: "#9BA1A6",
		tabIconSelected: tintColorDark,
		primary: primaryColor,
		secondary: secondaryColor,
	},
};
