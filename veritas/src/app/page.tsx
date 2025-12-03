"use client";

import Image from "next/image";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { useState } from "react";

// --------------------
// Firebase Config
// --------------------
const firebaseConfig = {
	apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
	authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default function Home() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [user, setUser] = useState<any>(null);
	const [error, setError] = useState("");

	// --------------------
	// Firebase auth actions
	// --------------------
	async function login() {
		try {
			setError("");
			const result = await signInWithEmailAndPassword(auth, email, password);
			setUser(result.user);
		} catch (err: any) {
			setError(err.message);
		}
	}

	async function register() {
		try {
			setError("");
			const result = await createUserWithEmailAndPassword(auth, email, password);
			setUser(result.user);
		} catch (err: any) {
			setError(err.message);
		}
	}

	async function logout() {
		await signOut(auth);
		setUser(null);
	}

	// --------------------
	// UI
	// --------------------
	return (
		<div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">

			{/* Main */}
			<main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
				<Image className="dark:invert" src="/next.svg" alt="Next.js logo" width={180} height={38} priority />

				{/* Auth Block */}
				<div className="flex flex-col gap-4 w-full max-w-sm">

					<input
						type="email"
						placeholder="Email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="border p-2 rounded w-full"
					/>

					<input
						type="password"
						placeholder="Senha"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="border p-2 rounded w-full"
					/>

					{error && <p className="text-red-500 text-sm">{error}</p>}

					{user ? (
						<>
							<p className="text-green-600 text-sm">Logado como {user.email}</p>
							<button onClick={logout} className="bg-gray-900 text-white py-2 rounded">Sair</button>
						</>
					) : (
						<>
							<button onClick={login} className="bg-blue-600 text-white py-2 rounded">Entrar</button>
							<button onClick={register} className="bg-green-600 text-white py-2 rounded">Registrar</button>
						</>
					)}
				</div>

				{/* Original content preserved */}
				<ol className="font-mono list-inside list-decimal text-sm/6 text-center sm:text-left">
					<li className="mb-2 tracking-[-.01em]">
						Get started by editing{" "}
						<code className="bg-black/[.05] dark:bg-white/[.06] font-mono font-semibold px-1 py-0.5 rounded">
							src/app/page.tsx
						</code>
						.
					</li>
					<li className="tracking-[-.01em]">Save and see your changes instantly.</li>
				</ol>

			</main>

			{/* Footer */}
			<footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
				<a
					className="flex items-center gap-2 hover:underline hover:underline-offset-4"
					href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
					target="_blank"
					rel="noopener noreferrer"
				>
					<Image aria-hidden src="/file.svg" alt="File icon" width={16} height={16} />
					Learn
				</a>
				<a
					className="flex items-center gap-2 hover:underline hover:underline-offset-4"
					href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
					target="_blank"
					rel="noopener noreferrer"
				>
					<Image aria-hidden src="/globe.svg" alt="Globe icon" width={16} height={16} />
					Go to nextjs.org →
				</a>
			</footer>

		</div>
	);
}