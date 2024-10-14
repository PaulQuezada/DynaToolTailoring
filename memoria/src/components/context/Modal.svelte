<script lang="ts">
	export let toggle: boolean;
	export let title: string;
</script>

{#if toggle}
	<div
		class="fixed overflow-y-auto inset-0 z-50 pointer-events-none isolate"
		role="dialog"
		aria-modal="true"
	>
		<div
			class="absolute inset-0 bg-gray-500 bg-opacity-60 pointer-events-auto"
			on:click={() => {
				toggle = false;
			}}
			aria-hidden="true"
		/>
		<div
			class="w-full flex justify-center overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 items-center md:inset-0 h-[calc(100%-1rem)] max-h-full"
		>
			<div class="pointer-events-auto relative w-auto max-w-4xl max-h-full">
				<div
					class="relative bg-pastel-brown-1 rounded-lg shadow dark:bg-gray-700 max-w-3/5 max-h-4/5 overflow-auto p-4"
				>
					<div class="relative flex items-center justify-center p-3 rounded-t dark:border-gray-600">
						<h3 class="text-xl font-semibold text-gray-900 dark:text-white">
							{title}
						</h3>
						<button
							type="button"
							class="absolute right-0 top-0 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
							on:click={() => {
								toggle = false;
							}}
						>
							<svg
								class="w-3 h-3"
								aria-hidden="true"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 14 14"
							>
								<path
									stroke="currentColor"
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
								/>
							</svg>
							<span class="sr-only">Close modal</span>
						</button>
					</div>
					<div>
						<slot />
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
