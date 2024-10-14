<script lang="ts">
	import Modal from './Modal.svelte';
	import { createForm } from 'felte';
	import type { Context } from './interfaces';

	export let toggle = false;
	export let context: Context;

	const { form } = createForm({
		onSubmit: (values) => {
			if (!context.dimensions.some((dimension) => dimension.name === values.name)) {
				context.dimensions.push({ name: values.name, attributes: [] });
			}
			context = context;
			toggle = false;
		}
	});
</script>

<Modal bind:toggle title="Add dimension">
	<form use:form>
		<div class="w-96 opacity-100 sm:scale-100 flex flex-col px-4 py-5 rounded-sm">
			<label for="name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
				Name
			</label>
			<input
				id="name"
				name="name"
				type="text"
				class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
				required
			/>
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
