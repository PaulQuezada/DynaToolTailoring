<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Context } from '../interfaces';
	import AttributesModal from './AttributesModal.svelte';
	import DimensionsModal from './DimensionsModal.svelte';
    

	export let with_title = true;
	let showAttributeModal = false;
	let showDimensionsModal = false;
	export let successContext = false;
	let context: Context = {
		dimensions: [
			{
				name: 'Project',
				attributes: [
					{ name: 'Project size', options: ['Large', 'Medium', 'Small'] },
					{ name: 'Project type', options: ['New', 'Old'] }
				]
			},
			{
				name: 'Team',
				attributes: [
					{ name: 'Technology knowledge', options: ['High', 'Average', 'Low'] },
					{ name: 'Domain knowledge', options: ['High', 'Average', 'Low'] }
				]
			}
		]
	};
	const removeField = (dimension_idx: number, attr_ix: number) => {
		context.dimensions[dimension_idx].attributes = context.dimensions[
			dimension_idx
		].attributes.filter((_, i) => i !== attr_ix);
	};

</script>

<div class="flex flex-row">
	{#if with_title}
		<h1 class="text-2xl font-semibold relative left-5 basis-3/4 text-white">Context</h1>
	{/if}
	<div class="relative basis-1/4 self-end grid justify-items-end -bottom-3 right-5">
		<button
			on:click={() => (showDimensionsModal = true)}
			class="bg-amber-100 rounded-sm px-2 text-center border-x-2 border-t-2 border-amber-400 hover:bg-amber-200 hover:border-amber-500"
		>
			Add dimension
		</button>
	</div>
	<div class="relative basis-1/4 self-end grid justify-items-end -bottom-3 right-5">
		<button
			on:click={() => (showAttributeModal = true)}
			class="bg-amber-100 rounded-sm px-2 text-center border-x-2 border-t-2 border-amber-400 hover:bg-amber-200 hover:border-amber-500"
		>
			Add attribute
		</button>
	</div>
</div>
<form
	method="POST"
	action="?/context"
	use:enhance={() => {
		return async ({ update, result }) => {
			update({ reset: false });
			if (result.type === 'success') {
				successContext = true;
			}
		};
	}}
	class="grid grid-cols-2 gap-x-16 gap-y-8 mt-3 px-5 py-5 bg-pastel-brown-1 border-blue-darkish border-2 rounded-md"
>
	{#each context.dimensions as dimension, i}
		{#if dimension.attributes.length > 0}
			<div class="bg-blue-darkish bg-opacity-30 p-4 rounded-md">
				<h2 class="font-bold text-lg mb-2">{dimension.name}</h2>
				{#each dimension.attributes as attribute, index}
					<div class="grid grid-rows-2 mt-4">
						<div class="flex items-center justify-between">
							<label for={`${dimension.name}.${attribute.name}`} class="flex-grow">
								{attribute.name}
							</label>
							<button
								on:click|preventDefault={() => removeField(i, index)}
								class="bg-rose-200 rounded-x-lg rounded-t-lg px-2 hover:bg-rose-300 border-t-2 border-x-2 border-rose-300 hover:border-rose-400"
							>
								Remove
							</button>
						</div>
						<select
							id={`${dimension.name}.${attribute.name}`}
							name={`${dimension.name}.${attribute.name}`}
							class="text-center bg-pastel-green border rounded-b-sm rounded-l-sm rounded-r-sm"
						>
							{#each attribute.options as option}
								<option value={option}> {option} </option>
							{/each}
						</select>
					</div>
				{/each}
			</div>
		{/if}
	{/each}
	<input class="hidden" name="fields" value={JSON.stringify(context)} />
	<button
		class="col-span-2 text-center bg-blue-300 border-2 border-blue-400 hover:bg-blue-400 hover:border-blue-500 rounded"
		type="submit"
	>
		Generate model
	</button>
</form>

<AttributesModal bind:toggle={showAttributeModal} bind:context />
<DimensionsModal bind:toggle={showDimensionsModal} bind:context />
