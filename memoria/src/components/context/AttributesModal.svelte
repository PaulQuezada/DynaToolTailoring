<script lang="ts">
	import Modal from './Modal.svelte';
	import { createForm } from 'felte';
	import type { Context } from './interfaces';

	export let toggle = false;
	export let context: Context;
	let options = [''];

	function addInput() {
		options = [...options, ''];
	}

	function removeInput() {
		if (options.length > 1) {
			options = options.slice(0, -1);
		}
	}

	const { form } = createForm({
		onSubmit: (values) => {
			const validOptions = options.filter((option) => option.trim() !== '');

			const dimension = context.dimensions.find((dimension) => dimension.name === values.dimension);
			if (dimension) {
				dimension.attributes.push({ name: values.name, options: validOptions });
			}
			context = context;
			toggle = false;
			resetForm();
		}
	});

	function resetForm() {
		options = [''];
	}
</script>

<Modal bind:toggle title="Add attribute">
	<form use:form>
		<div class="w-96 opacity-100 sm:scale-100 flex flex-col px-4 py-5 rounded-sm">
			<label for="dimension" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
				Select a dimension
			</label>
			<select
				id="dimension"
				name="dimension"
				class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
			>
				{#each context.dimensions as dimension}
					<option value={dimension.name}> {dimension.name} </option>
				{/each}
			</select>
			<label for="name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white mt-4">
				Attribute name
			</label>
			<input
				id="name"
				name="name"
				type="text"
				class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
				required
			/>
			<h1 class="block mb-2 text-sm font-medium text-gray-900 dark:text-white mt-4">
				Attribute values
			</h1>
			<div class="flex flex-col gap-y-2">
				<div class="flex items-center">
					<input
						id="options_0"
						name="options_0"
						type="text"
						bind:value={options[0]}
						class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
					/>
					<div class="button-group ml-2 flex">
						<button
							on:click|preventDefault={addInput}
							type="button"
							class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="white"
								class="w-4 h-4"
							>
								<path
									fill-rule="evenodd"
									d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z"
									clip-rule="evenodd"
								/>
							</svg>
							<span class="sr-only">Add Option</span>
						</button>
						<button />
						<button
							on:click|preventDefault={removeInput}
							disabled={options.length === 1}
							type="button"
							class="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center me-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="white"
								class="w-4 h-4"
							>
								<path
									fill-rule="evenodd"
									d="M3.75 12a.75.75 0 01.75-.75h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75z"
									clip-rule="evenodd"
								/>
							</svg>
							<span class="sr-only">Remove Option</span>
						</button>
					</div>
				</div>
				{#each options as option, index (index)}
					{#if index !== 0}
						<input
							id={`options_${index}`}
							name={`options_${index}`}
							type="text"
							bind:value={options[index]}
							class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
						/>
					{/if}
				{/each}
			</div>

			<div class="grid grid-cols-12">
				<button
					type="submit"
					class="col-start-5 col-span-4 text-green-700 hover:text-white border border-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-green-500 dark:text-green-500 dark:hover:text-white dark:hover:bg-green-600 dark:focus:ring-green-800 mt-4"
				>
					Add
				</button>
			</div>
		</div>
	</form>
</Modal>
