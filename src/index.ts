import { serve } from "bun";
import index from "./index.html";
import path from "node:path";
import { mkdir } from "node:fs/promises";
import type { Habit } from "../habits.ts";
import { routeInteraction } from "../interaction_router.ts";
import { filterHabitLogs, getAllHabitStatistics, validateHabitLogFilters } from "./lib/habit_api";
import { materializeExpiredReviews } from "./lib/review_manager";

const allowedOrigins = new Set((Bun.env.API_ALLOWED_ORIGINS ?? "")
	.split(",").map((origin) => origin.trim()).filter(Boolean));

function corsHeaders(request: Request): Headers {
	const headers = new Headers({
		"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type",
		"Access-Control-Max-Age": "86400",
	});
	const origin = request.headers.get("origin");
	if (origin && (allowedOrigins.has(origin) || allowedOrigins.has("*"))) {
		headers.set("Access-Control-Allow-Origin", allowedOrigins.has("*") ? "*" : origin);
		headers.append("Vary", "Origin");
	}
	return headers;
}

function apiJson(request: Request, body: unknown, status = 200, extraHeaders?: HeadersInit): Response {
	const headers = corsHeaders(request);
	headers.set("Content-Type", "application/json; charset=utf-8");
	headers.set("Cache-Control", "no-store");
	new Headers(extraHeaders).forEach((value, name) => headers.append(name, value));
	return new Response(JSON.stringify(body), { status, headers });
}

function options(request: Request): Response {
	return new Response(null, { status: 204, headers: corsHeaders(request) });
}

// Installed builds store user data in AppData so upgrades do not overwrite it.
const dataFile = Bun.env.HABITS_ORGANIZER_DATA_DIR
	? path.join(Bun.env.HABITS_ORGANIZER_DATA_DIR, "habits-data.json")
	: path.join(process.cwd(), "habits-data.json");
const reviewCheckpointFile = path.join(path.dirname(dataFile), "habits-data.review-checkpoint.json");

// The in-memory list mirrors habits-data.json, retaining the existing UI workflow.
let habits: Habit[] = [];

async function loadHabits() {
	try {
		const file = Bun.file(dataFile);
		if (!(await file.exists())) {
			habits = [];
			return;
		}
		const buffer = await file.arrayBuffer();
		let content = new TextDecoder("utf-8").decode(buffer);
		content = content.replace(/,(\s*[}\]])/g, "$1");
		const data: unknown = JSON.parse(content);
		if (!data || typeof data !== "object" || !Array.isArray((data as { habits?: unknown }).habits)) {
			throw new Error("habits-data.json must contain a habits array");
		}
		habits = (data as { habits: Habit[] }).habits;
		console.log("✅ Habits loaded from habits-data.json");
	} catch (error) {
		console.error("❌ Error loading:", error);
		throw error;
	}
}

async function saveHabits(nextHabits: Habit[]) {
	await mkdir(path.dirname(dataFile), { recursive: true });
	await Bun.write(dataFile, JSON.stringify({ habits: nextHabits }, null, 2));
	console.log("💾 Habits saved");
}

function readLogFilters(request: Request, habitName?: string) {
	const params = new URL(request.url).searchParams;
	const result = validateHabitLogFilters(params);
	if (result.error) return { error: result.error };
	return { filters: { ...result.filters, habitName: habitName ?? params.get("habit") ?? undefined } };
}

const openApiDocument = {
	openapi: "3.1.0",
	info: { title: "Habits Organizer API", version: "1.0.0", description: "API de lecture des habitudes, réalisations et statistiques." },
	paths: {
		"/api/habitsorganizer": { get: { summary: "Lire toutes les habitudes", responses: { "200": { description: "Tableau des habitudes avec toutes leurs données et réalisations." } } } },
		"/api/habitsorganizer/export": { get: { summary: "Exporter toutes les données", responses: { "200": { description: "Objet au format du fichier habits-data.json." } } } },
		"/api/habitsorganizer/{name}": { get: { summary: "Lire une habitude", parameters: [{ name: "name", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Données complètes de l’habitude." }, "404": { description: "Habitude introuvable." } } } },
		"/api/habitsorganizer/logs": { get: { summary: "Lire les réalisations", parameters: ["habit", "from", "to", "status", "limit", "offset"].map((name) => ({ name, in: "query", required: false, schema: { type: "string" } })), responses: { "200": { description: "Réalisations filtrées avec pagination." } } } },
		"/api/habitsorganizer/{name}/logs": { get: { summary: "Lire les réalisations d’une habitude", parameters: [{ name: "name", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Réalisations de l’habitude." }, "404": { description: "Habitude introuvable." } } } },
		"/api/habitsorganizer/stats": { get: { summary: "Lire les statistiques globales et par habitude", responses: { "200": { description: "Statistiques calculées à partir des données chargées." } } } },
		"/api/health": { get: { summary: "État du service", responses: { "200": { description: "Service disponible." } } } },
	},
};

await loadHabits();

let mutationQueue: Promise<void> = Promise.resolve();
let lastReviewProcessedAt = new Date();

async function loadReviewCheckpoint(): Promise<Date> {
	try {
		const file = Bun.file(reviewCheckpointFile);
		if (!(await file.exists())) return new Date();
		const parsed: unknown = await file.json();
		if (parsed && typeof parsed === "object" && "lastProcessedAt" in parsed) {
			const date = new Date(String(parsed.lastProcessedAt));
			if (!Number.isNaN(date.getTime())) return date;
		}
	} catch (error) {
		console.error("⚠️ Could not read the review checkpoint; starting a new one.", error);
	}
	return new Date();
}

async function runReviewSweep() {
	const now = new Date();
	const update = async () => {
		await mkdir(path.dirname(reviewCheckpointFile), { recursive: true });
		const nextHabits = materializeExpiredReviews(habits, lastReviewProcessedAt, now);
		if (nextHabits !== habits) {
			await saveHabits(nextHabits);
			habits = nextHabits;
		}
		await Bun.write(reviewCheckpointFile, JSON.stringify({ lastProcessedAt: now.toISOString() }, null, 2));
		lastReviewProcessedAt = now;
	};
	const pending = mutationQueue.then(update, update);
	mutationQueue = pending.then(() => undefined, () => undefined);
	await pending;
}

function scheduleReviewSweep() {
	const now = new Date();
	const nextRun = new Date(now);
	nextRun.setHours(20, 0, 0, 0);
	if (nextRun <= now) nextRun.setDate(nextRun.getDate() + 1);
	setTimeout(() => {
		void runReviewSweep().catch((error) => console.error("❌ Review sweep failed:", error)).finally(scheduleReviewSweep);
	}, nextRun.getTime() - now.getTime());
}

lastReviewProcessedAt = await loadReviewCheckpoint();
await runReviewSweep().catch((error) => console.error("❌ Initial review sweep failed:", error));

const server = serve({
	port: 3001,
	hostname: "0.0.0.0",
	routes: {
		"/api/habitsorganizer": {
			GET(req) { return apiJson(req, habits); },
			OPTIONS: options,
			async POST(req) {
				try {
					if (!req.headers.get("content-type")?.includes("application/json")) {
						return apiJson(req, { error: "Content-Type must be application/json" }, 400);
					}
					const body = await req.json();
					const update = async () => {
						const nextHabits = await routeInteraction(habits, body);
						await saveHabits(nextHabits);
						habits = nextHabits;
						return apiJson(req, habits);
					};
					const pending = mutationQueue.then(update, update);
					mutationQueue = pending.then(() => undefined, () => undefined);
					return await pending;
				} catch (error) {
					console.error("❌ POST /api/habitsorganizer error:", error);
					const message = error instanceof Error ? error.message : "Server error";
					const status = message === "Invalid habit request" || message.startsWith("Habit not found")
						|| message.startsWith("Invalid repetition") || message.startsWith("Une habitude") ? 400 : 500;
					return apiJson(req, { error: message }, status);
				}
			},
		},
		"/api/habitsorganizer/export": {
			GET(req) { return apiJson(req, { habits }); },
			OPTIONS: options,
		},
		"/api/habitsorganizer/stats": {
			GET(req) { return apiJson(req, getAllHabitStatistics(habits)); },
			OPTIONS: options,
		},
		"/api/habitsorganizer/logs": {
			GET(req) {
				const parsed = readLogFilters(req);
				if (parsed.error) return apiJson(req, { error: parsed.error }, 400);
				return apiJson(req, filterHabitLogs(habits, parsed.filters!));
			},
			OPTIONS: options,
		},
		"/api/habitsorganizer/:name/logs": {
			GET(req) {
				const name = req.params.name;
				const habit = habits.find((item) => item.name === name);
				if (!habit) return apiJson(req, { error: "Habit not found" }, 404);
				const parsed = readLogFilters(req, name);
				if (parsed.error) return apiJson(req, { error: parsed.error }, 400);
				return apiJson(req, filterHabitLogs([habit], parsed.filters!));
			},
			OPTIONS: options,
		},
		"/api/habitsorganizer/:name": {
			GET(req) {
				const matches = habits.filter((habit) => habit.name === req.params.name);
				if (matches.length !== 1) return apiJson(req, { error: "Habit not found or name is ambiguous" }, matches.length ? 409 : 404);
				return apiJson(req, matches[0]);
			},
			OPTIONS: options,
		},
		"/api/health": {
			GET(req) { return apiJson(req, { status: "ok" }); },
			OPTIONS: options,
		},
		"/api/openapi.json": {
			GET(req) { return apiJson(req, openApiDocument); },
			OPTIONS: options,
		},
		"/api/*": (req) => apiJson(req, { error: "API route not found" }, 404),
		// Let Bun serve the imported HTML bundle directly. Returning this bundle
		// from a custom request handler is not a Response and triggers Bun's
		// "fetch(req) did not return a response" fallback page.
		"/*": index,
	},
});

console.log(`🚀 Server running at http://0.0.0.0:${server.port}`);
scheduleReviewSweep();
