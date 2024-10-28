<script lang="ts">
	import { enhance } from "$app/forms";
	import { onMount } from "svelte";
	import { themeStore } from "../../stores";
	import { writable } from "svelte/store";
	import BpmnVisualizerView from "./BpmnVisualizer.svelte";
	export let successProcess = false;
	let xml: string;
	let droppingFile = writable(false); // Si se está soltando un archivo dentro del dropzone
	let dropFile = writable(false); // Su el archivo se soltó dentro del dropzone
	let showProcess = false;

	onMount(() => {
		// File manipulation
		const processDOM: HTMLElement | null =
			document.getElementById("process");
		processDOM?.addEventListener("change", handleFileSelect, false);
		function handleFileSelect(evt: Event) {
			evt.stopPropagation();
			evt.preventDefault();

			const input = evt.target as HTMLInputElement;
			const file = input.files?.[0];
			const reader = new FileReader();
			reader.onload = () => {
				if (typeof reader.result === "string") {
					xml = reader.result;
				}
			};
			if (file) {
				reader.readAsText(file);
			}
		}
		return () => {
			processDOM?.removeEventListener("change", handleFileSelect, false);
		};
	});
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<form
	method="POST"
	action="?/process"
	enctype="multipart/form-data"
	use:enhance={() => {
		return async ({ update, result }) => {
			update({ reset: false });
			if (result.type === "success") {
				successProcess = true;
			}
		};
	}}
>
	<!-- Donde se visualiza el archivo BPMN -->
	{#if successProcess && xml}
		<div class="flex w-2/3 mx-auto mt-2">
			<button
				class="w-1/3 border-2 py-1 border-[#dcc8f3] bg-[#ffffff] rounded text-[#45226d] transform transition-transform duration-150 ease-in-out hover:scale-[1.03]"
				on:click={() => {
					showProcess = !showProcess;
				}}
			>
				<div class="flex">
					{#if !showProcess}
						<span
							class="mx-2 text-[#742dc3] my-auto material-symbols-outlined"
						>
							account_tree
						</span>
						<h1 class="my-auto ml-1">View process</h1>
					{:else}
						<span
							class="mx-2 text-[#742dc3] material-symbols-outlined"
						>
							upload_file
						</span>
						<h1 class="my-auto ml-1">View file</h1>
					{/if}
				</div>
			</button>
		</div>
	{/if}
	<div
		class="relative z-99 flex justify-center mt-3 w-2/3 h-[250px] mx-auto rounded-xl {$themeStore ===
		'Light'
			? 'border-[#855dc7] bg-[#f1e9f9] text-[#855dc7]'
			: 'border-[#6d44ba] bg-[#231833] text-[#6d44ba]'} border-2 border-dashed transform transition-transform duration-150 ease-in-out hover:scale-[1.01]"
		on:dragover={(e) => {
			e.preventDefault();
			$droppingFile = true;
		}}
		on:dragleave={(e) => {
			e.preventDefault();
			$droppingFile = false;
		}}
		on:durationchange={(e) => {
			e.preventDefault();
			$droppingFile = false;
		}}
	>
		<!-- Visualizador del proceso -->
		{#if showProcess}
			<div
				class={`absolute flex z-50 text-center w-full h-full rounded-xl ${
					$themeStore === "Light"
						? "border-[#855dc7] bg-[#f1e9f9] text-[#855dc7]"
						: "border-[#6d44ba] bg-[#231833] text-[#6d44ba]"
				}`}
			>
				<div class="z-50 w-full h-full">
					<BpmnVisualizerView {xml} />
				</div>
			</div>
		{/if}
		<!-- Input oculto para cargar el archivo -->
		<input
			type="file"
			id="process"
			name="process"
			required
			accept=".bpmn, .xml, xmi"
			class="absolute h-full w-full bg-red border opacity-0 cursor-pointer top-0 left-0 z-10"
			on:change={async (e) => {
				$dropFile = true;
			}}
		/>
		<div
			class="absolute mt-10 p-10 flex flex-col text-center items-center mx-auto {$droppingFile
				? 'animate-pulse'
				: ''}"
		>
			{#if $dropFile}
				<svg
					height="48px"
					width="48px"
					viewBox="0 0 24 24"
					fill={$themeStore === "Light" ? "#7f5fc0" : "#6746b4"}
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M13.5 3H12H8C6.34315 3 5 4.34315 5 6V18C5 19.6569 6.34315 21 8 21H10M13.5 3L19 8.625M13.5 3V7.625C13.5 8.17728 13.9477 8.625 14.5 8.625H19M19 8.625V12.8125"
						stroke="#000000"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
					<path
						d="M13 19L15 21L20 16"
						stroke="#000000"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
				<h1
					class="font-black {$themeStore === 'Light'
						? 'text-[#7f5fc0]'
						: 'text-[#6746b4]'} 
                        "
				>
					BPMN Imported!
				</h1>
			{:else}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					height="48px"
					viewBox="0 -960 960 960"
					width="48px"
					fill={$themeStore === "Light" ? "#7f5fc0" : "#6746b4"}
				>
					<path
						d="M280-280h400v-60H280v60Zm197-126 158-157-42-42-85 84v-199h-60v199l-85-84-42 42 156 157Zm3 326q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 31.5-156t86-127Q252-817 325-848.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 82-31.5 155T763-197.5q-54 54.5-127 86T480-80Zm0-60q142 0 241-99.5T820-480q0-142-99-241t-241-99q-141 0-240.5 99T140-480q0 141 99.5 240.5T480-140Zm0-340Z"
					/>
				</svg>
				<h1
					class="font-black {$themeStore === 'Light'
						? 'text-[#7f5fc0]'
						: 'text-[#6746b4]'} 
                            "
				>
					Drag your file here
				</h1>
			{/if}
		</div>
	</div>
	<button
		class="flex mt-1 mb-2 text-center w-2/3 mx-auto disabled:opacity-50 bg-[#7f5fc0] text-white font-bold py-2 px-4 rounded-full"
		type="submit"
		disabled={!$dropFile}
	>
		<h1 class="mx-auto">Upload BPMN</h1>
	</button>
</form>
