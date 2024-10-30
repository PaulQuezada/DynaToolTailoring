<script lang="ts">
	import Modal from '../context/Modal.svelte';
	import { createForm } from 'felte';
	import { goto } from '$app/navigation';

	export let toggle = false;
	const { errors, form } = createForm({
		onSubmit: async ({ name }) => {
			const parsedName = btoa(name); // Encode the name to base64
			localStorage.setItem('projectName', parsedName);
			await goto(`/contextandprocess?projectName=${parsedName}`);
		},
		validate: (values) => {
			const errors: { name?: string } = {};
			if (!values.name || !/^[a-zA-Z0-9+/]+$/.test(values.name)) {
				errors.name = 'Name must only contain letters, numbers or "+" "/" characters';
			}
			return errors;
		}
	});
</script>

<Modal bind:toggle title="Project name">
	<form use:form class="max-w-sm mx-auto px-5">
		<input
			type="text"
			id="name"
			name="name"
			class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
			required
		/>
		<div class="h-[1px] w-[350px]" />
		{#if $errors?.name}
			<div
				class="flex items-center p-4 mb-4 text-sm text-yellow-800 rounded-lg bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300"
				role="alert"
			>
				<svg
					class="flex-shrink-0 inline w-4 h-4 me-3"
					aria-hidden="true"
					xmlns="http://www.w3.org/2000/svg"
					fill="currentColor"
					viewBox="0 0 20 20"
				>
					<path
						d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"
					/>
				</svg>
				<span class="sr-only">Info</span>
				<div>
					{$errors.name}
				</div>
			</div>
		{/if}
		<div class="grid grid-cols-12">
			<button
				type="submit"
				class="col-start-5 col-span-4 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 mt-4"
			>
				Create
			</button>
		</div>
	</form>
</Modal>
