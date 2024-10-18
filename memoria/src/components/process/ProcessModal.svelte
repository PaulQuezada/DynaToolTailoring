<script lang="ts">
	import Modal from '../context/Modal.svelte';
	import Process from './Process.svelte';

	export let toggle = false;
	export let successProcess = false;
</script>

<Modal bind:toggle title="Process">
	<div class="bg-pastel-brown-1 opacity-100 sm:scale-100 rounded-sm h-full w-[400px]">
		<Process bind:successProcess/>
	</div>
</Modal>
