<script lang="ts">
	import Modal from '../context/Modal.svelte';
	import Process from './Process.svelte';

	export let toggle = false;
</script>

<Modal bind:toggle title="Process">
	<div class="bg-pastel-brown-1 opacity-100 sm:scale-100 rounded-sm h-full w-full">
		<Process />
	</div>
</Modal>
