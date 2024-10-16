<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
  
	let container: HTMLElement | null = null; // Inicializamos container como null
	let viewer: any;
  
	export let xml = '';
  
	// Cargar el viewer al montar el componente
	onMount(async () => {
	  const { default: BpmnViewer } = await import('bpmn-js/lib/NavigatedViewer');
	  
	  if (container) {
		viewer = new BpmnViewer({
		  container: container,
		  keyboard: {
			bindTo: document
		  }
		});
	  } else {
		console.error('Container is not defined');
	  }
  
	  // Esperar a que el contenedor tenga un tamaño válido
	  const waitForContainer = async () => {
		return new Promise<void>((resolve) => {
		  const interval = setInterval(() => {
			if (container && container.clientWidth > 0 && container.clientHeight > 0) {
			  clearInterval(interval);
			  resolve();
			}
		  }, 100);
		});
	  };
  
	  await waitForContainer();
  
	  if (xml) {
		try {
		  await viewer.importXML(xml);
		  const canvas = viewer.get('canvas');
		  canvas.zoom('fit-viewport');
		} catch (error) {
		  console.error('Error al importar el BPMN:', error);
		}
	  }
	});
  
	// Limpiar cuando se desmonte el componente
	onDestroy(() => {
	  if (viewer) {
		viewer.destroy();
	  }
	});
  
	// Reimportar el diagrama cuando cambie el XML
	$: if (viewer && xml) {
	  viewer.importXML(xml).then(() => {
		const canvas = viewer.get('canvas');
		canvas.zoom('fit-viewport');
	  }).catch((error: any) => {
		console.error('Error al importar el BPMN:', error);
	  });
	}
  </script>
  
  <div class="svelte-bpmn-container" style="height: 100%; width: 100%;" bind:this={container} />
  