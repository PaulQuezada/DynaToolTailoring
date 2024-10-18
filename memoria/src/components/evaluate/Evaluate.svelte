<script lang="ts">
	import Graph from "../graph/Graph.svelte";
	import ContextModal from "../context/ContextModal.svelte";
	import Optimizer from "./Optimizer.svelte";
	import { parseXML } from "../graph";
	import type { InfluenceGraph } from "../interfaces";
	import { onMount } from "svelte";
	import ProcessModal from "../process/ProcessModal.svelte";
	import LoaderView from "../../routes/loader.svelte";
	import { getNotificationsContext } from "svelte-notifications";
	const { addNotification } = getNotificationsContext();

	let showContextModal = false;
	let showProcessModal = false;
	let graph: InfluenceGraph;

	let loaddata = false;

	let successContext = false;
	let successProcess = false;

	onMount(async () => {
		loaddata = true;
		const response = await fetch("/graph.xmi");
		const xml = await response.text();

		parseXML(xml)
			.then((parsedGraph) => {
				graph = parsedGraph;
			})
			.catch((error) => console.error("Error parsing XML:", error));
		loaddata = false;
	});

	$: {
        if (successContext) {
            addNotification({
                text: "The context was correctly saved in the system.",
                position: "top-right",
                type: "success",
                removeAfter: 2000,
            });
        }
        if (successProcess) {
            addNotification({
                text: "The process was correctly saved in the system.",
                position: "top-right",
                type: "success",
                removeAfter: 2000,
            });
        }
    }
</script>

{#if loaddata}
	<LoaderView />
{/if}

<div class="overflow-x-hidden w-full h-full">
	<div class="grid grid-cols-9 grid-rows-5 mt-5">
		<div class="col-start-2 col-span-5 row-span-5">
			<div class="flex flex-col w-full mt-4 h-full">
				<h1
					class="text-2xl font-semibold relative left-5 basis-1/8 w-6/12 text-white"
				>
					Influence graph
				</h1>
				<div
					class="mt-3 px-5 py-5 bg-pastel-brown-1 border-blue-darkish border-2 rounded-md w-full h-[70vh]"
				>
					<Graph {graph} />
				</div>
			</div>
		</div>
		<div
			class="items-center justify-center grid grid-rows-2 col-span-2 row-span-4"
		>
			<div class="row-span-1">
				<button
					class="py-2 px-10 bg-teal-500 hover:bg-teal-600 rounded font-bold text-lg"
					on:click={() => (showContextModal = true)}
				>
					Context
				</button>
			</div>
			<div class="row-span-1">
				<button
					class="py-2 px-10 bg-teal-500 hover:bg-teal-600 rounded font-bold text-lg"
					on:click={() => (showProcessModal = true)}
				>
					Process
				</button>
			</div>
		</div>
	</div>
	<div class="grid grid-cols-9 grid-rows-5 h-[40vh] w-screen mt-4">
		<div class="col-start-2 col-span-7">
			<Optimizer />
		</div>
	</div>
</div>
<ContextModal bind:toggle={showContextModal} bind:successContext/>
<ProcessModal bind:toggle={showProcessModal} bind:successProcess/>
