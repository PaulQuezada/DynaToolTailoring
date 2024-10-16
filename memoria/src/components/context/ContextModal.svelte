<script lang="ts">
	import Modal from './Modal.svelte';
	import Context from './Context.svelte';

	export let toggle = false;
</script>

<Modal bind:toggle title="Context">
	<div class="bg-pastel-brown-1 opacity-100 sm:scale-100 rounded-sm h-full">
		<Context with_title={false} />
	</div>
</Modal>
