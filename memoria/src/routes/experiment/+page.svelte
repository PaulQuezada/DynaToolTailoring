<script lang="ts">
    // Importación de la función de carga
    import { fileUpload } from "../../functions/importdata";

    // Variables
    let bpmnData = "";

    // Función para manejar la carga de archivos
    async function uploadFile(event: Event) {
        const xmi: string = await fileUpload(event);
        bpmnData = transformXMItoBPMN(xmi);
    }

    // Función para transformar XMI a BPMN con validación
    function transformXMItoBPMN(xmi: string): string {
        // Definir las etiquetas a transformar
        const replacements = [
            { from: /bpmn2:Definitions/g, to: "bpmn:definitions" },
            { from: /xsi:type="bpmn2:Process"/g, to: "bpmn:process" },
            { from: /xsi:type="bpmn2:StartEvent"/g, to: "bpmn:startEvent" },
            { from: /xsi:type="bpmn2:Task"/g, to: "bpmn:task" },
            {
                from: /xsi:type="bpmn2:ExclusiveGateway"/g,
                to: "bpmn:exclusiveGateway",
            },
            {
                from: /xsi:type="bpmn2:IntermediateThrowEvent"/g,
                to: "bpmn:intermediateThrowEvent",
            },
            { from: /xsi:type="bpmn2:SequenceFlow"/g, to: "bpmn:sequenceFlow" },
            { from: /xsi:type="bpmn2:EndEvent"/g, to: "bpmn:endEvent" },
        ];

        // Hacer las sustituciones de las etiquetas
        let bpmn = xmi;
        
        replacements.forEach((replacement) => {
            bpmn = bpmn.replace(replacement.from, replacement.to);
        });
        
        
        console.log(bpmn);

        // Validar si hay errores con las etiquetas o atributos faltantes
        if (bpmn.includes("flowElements") || bpmn.includes("xmi:version")) {
            console.error(
                "El archivo XMI contiene etiquetas o atributos no reconocidos",
            );
            return "";
        }

        // Agregar atributos XML a la definición del BPMN
        bpmn = bpmn.replace(
            /<bpmn:definitions/,
            `<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_0lfo92g" targetNamespace="http://bpmn.io/schema/bpmn" exporter="bpmn-js (https://demo.bpmn.io)" exporterVersion="17.7.1">`,
        );

        // Agregar atributos adicionales a la definición del proceso
        bpmn = bpmn.replace(
            /<bpmn:process/g,
            `<bpmn:process id="Process_1honodd" isExecutable="false"`,
        );

        // Devolver el resultado final del BPMN
        return bpmn;
    }

    // Función para extraer elementos de flujo como tareas, eventos, etc.
    function extractFlowElements(bpmn: string): string[] {
        const elementTypes = [
            "startEvent",
            "task",
            "exclusiveGateway",
            "endEvent",
            "sequenceFlow",
        ];
        const elements: string[] = [];

        // Buscar todos los elementos relevantes dentro del archivo BPMN
        elementTypes.forEach((type) => {
            const regex = new RegExp(
                `<bpmn:${type}[^>]*id="([^"]+)"[^>]*>`,
                "g",
            );
            let match;
            while ((match = regex.exec(bpmn)) !== null) {
                elements.push(match[1]);
            }
        });

        return elements;
    }

    // Función para crear la sección gráfica (BPMNDiagram)
    function createBPMNDiagram(elements: string[]): string {
        let diagram = `
<bpmndi:BPMNDiagram id="BPMNDiagram_1">
  <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1honodd">`;

        // Crear shapes para cada elemento
        elements.forEach((element, index) => {
            const x = 150 + index * 100; // Ajuste simple para la posición x
            const y = 80; // Fija en y para simplicidad, podrías hacerla dinámica si lo prefieres

            diagram += `
    <bpmndi:BPMNShape id="_BPMNShape_${element}" bpmnElement="${element}">
      <dc:Bounds x="${x}" y="${y}" width="100" height="80" />
      <bpmndi:BPMNLabel>
        <dc:Bounds x="${x + 20}" y="${y + 50}" width="50" height="14" />
      </bpmndi:BPMNLabel>
    </bpmndi:BPMNShape>`;
        });

        // Cerrar el diagrama
        diagram += `
  </bpmndi:BPMNPlane>
</bpmndi:BPMNDiagram>`;

        return diagram;
    }
</script>

<!-- Vista para cargar el archivo -->
<input type="file" on:change={uploadFile} />

<!-- Vista para mostrar el resultado BPMN -->
{#if bpmnData}
    <p>Resultado BPMN:</p>
    <pre>{bpmnData}</pre>
    <button on:click={() => navigator.clipboard.writeText(bpmnData)}
        >Copiar</button
    >
{/if}
