import tailwind from "bun-plugin-tailwind";
import path from "node:path";
import { mkdir } from "node:fs/promises";

if (process.platform !== "win32") {
	throw new Error("Build the Windows installer on Windows so Bun can create the native executable.");
}

const output = path.resolve("dist/windows/HabitsOrganizer.exe");
await mkdir(path.dirname(output), { recursive: true });

const result = await Bun.build({
	entrypoints: ["./src/index.ts"],
	plugins: [tailwind],
	minify: true,
	target: "bun",
	define: {
		"process.env.NODE_ENV": JSON.stringify("production"),
	},
	compile: {
		target: "bun-windows-x64",
		outfile: output,
	},
});

if (!result.success) {
	for (const log of result.logs) console.error(log);
	throw new Error("Windows executable build failed.");
}

console.log(`Windows application built: ${output}`);
