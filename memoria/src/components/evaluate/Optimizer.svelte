<script lang="ts">
	import _ from 'lodash';
	import { enhance } from '$app/forms';

	interface Option {
		id: string;
		name: string;
	}

	let optimizeValues: Option[] = [
		{ id: 'devTime', name: 'Development time' },
		{ id: 'value', name: 'Customer value' }
	];

	let optimizeTypes: Option[] = [
		{ id: 'max', name: 'Maximize' },
		{ id: 'min', name: 'Minimize' }
	];

	let action: { aggregated_value?: string; value?: string } = {};
	let success = false;
</script>

<div class="flex flex-col w-full mt-4 h-full">
	<h1 class="text-2xl font-semibold relative left-5 basis-1/8 w-6/12 text-white">
		Attribute to optimize
	</h1>
	<form
		class="grid grid-cols-2 mt-3 px-5 py-4 bg-pastel-brown-1 border-blue-darkish border-2 rounded-md w-full h-max"
		method="POST"
		action="?/evaluate"
		id="optimize_form"
		use:enhance={() => {
			return async ({ update, result }) => {
				update({ reset: false });
				if (result.type === 'success') {
					success = true;
					const name = _.find(optimizeValues, { id: result?.data?.aggregated_value })?.name;
					action = { aggregated_value: name, value: result?.data?.result };
				}
			};
		}}
	>
		<div class="grid grid-rows-2 grid-cols-6 col-span-1">
			<div class="text-xl font-medium row-span-1 col-start-2 col-span-4">Aggregated value</div>
			<select
				id="aggregated_value"
				name="aggregated_value"
				class="text-center bg-pastel-green row-span-1 col-start-2 col-span-4 pb-2 rounded mt-0.5 border-2 border-cyan-500 pt-0.5"
			>
				{#each optimizeValues as option}
					<option value={option.id}>{option.name}</option>
				{/each}
			</select>
		</div>
		<div class="grid grid-rows-2 grid-cols-6 col-span-1">
			<div class="text-xl font-medium row-span-1 col-start-2 col-span-4">Optimization type</div>
			<select
				id="optimization_type"
				name="optimization_type"
				class="text-center bg-pastel-green row-span-1 col-start-2 col-span-4 pb-2 rounded mt-0.5 border-2 border-cyan-500 pt-0.5"
			>
				{#each optimizeTypes as option}
					<option value={option.id}>{option.name}</option>
				{/each}
			</select>
		</div>
		<div class="grid grid-cols-12 col-span-2 pt-6">
			<button
				type="submit"
				class="col-start-5 col-span-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
			>
				Evaluate
			</button>
		</div>
	</form>
	{#if success}
		<h1 class="text-4xl font-bold relative left-5 basis-1/8 w-6/12 mt-4 text-white">Result</h1>
		<div
			class="grid grid-cols-2 mt-3 px-5 py-4 bg-pastel-brown-1 border-blue-darkish border-2 rounded-md w-full h-max"
		>
			<div class="grid grid-cols-6 col-span-1">
				<div
					class="text-center text-xl bg-blue-darkish col-start-2 col-span-4 pb-2 rounded mt-0.5 border-2 border-indigo-500 pt-0.5"
				>
					{action.aggregated_value}
				</div>
			</div>
			<div class="grid grid-cols-6 col-span-1">
				<div
					class="text-center text-xl bg-blue-darkish col-start-2 col-span-4 pb-2 rounded mt-0.5 border-2 border-indigo-500 pt-0.5"
				>
					{action.value}
				</div>
			</div>
		</div>
	{/if}
</div>
