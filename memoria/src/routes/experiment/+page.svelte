<script lang="ts">
    // Importación de la función de carga
    import { fileUpload } from "../../functions/importdata";

    // Variables
    let bpmnData = "";

    // Función para manejar la carga de archivos
    async function uploadFile(event: Event) {
        const xmi: string = await fileUpload(event);
        bpmnData = transformXMIToBPMN(xmi);
    }

    function transformXMIToBPMN(xmi: string): string {
        // Crear un parser para el archivo XMI
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmi, "application/xml");

        // Crear un documento nuevo BPMN
        const bpmnDoc = document.implementation.createDocument("", "", null);

        // Crear el elemento raíz para BPMN
        const bpmnDefinitions = bpmnDoc.createElement("bpmn:definitions");
        bpmnDefinitions.setAttribute(
            "xmlns:xsi",
            "http://www.w3.org/2001/XMLSchema-instance",
        );
        bpmnDefinitions.setAttribute(
            "xmlns:bpmn",
            "http://www.omg.org/spec/BPMN/20100524/MODEL",
        );
        bpmnDefinitions.setAttribute(
            "xmlns:bpmndi",
            "http://www.omg.org/spec/BPMN/20100524/DI",
        );
        bpmnDefinitions.setAttribute(
            "xmlns:dc",
            "http://www.omg.org/spec/DD/20100524/DC",
        );
        bpmnDefinitions.setAttribute(
            "xmlns:di",
            "http://www.omg.org/spec/DD/20100524/DI",
        );
        bpmnDefinitions.setAttribute("id", "Definitions_0lfo92g");
        bpmnDefinitions.setAttribute(
            "targetNamespace",
            "http://bpmn.io/schema/bpmn",
        );

        // Crear el proceso BPMN
        const processElement = xmlDoc.querySelector("rootElements");
        const bpmnProcess = bpmnDoc.createElement("bpmn:process");
        bpmnProcess.setAttribute(
            "id",
            processElement.getAttribute("name") || "Process_1honodd",
        );
        bpmnProcess.setAttribute("isExecutable", "false");

        // Variables para la distribución de posiciones en el diagrama
        let x = 150,
            y = 100,
            offsetX = 100,
            offsetY = 100;

        // Crear la parte gráfica (BPMNDiagram)
        const bpmnDiagram = bpmnDoc.createElement("bpmndi:BPMNDiagram");
        bpmnDiagram.setAttribute("id", "BPMNDiagram_1");

        const bpmnPlane = bpmnDoc.createElement("bpmndi:BPMNPlane");
        bpmnPlane.setAttribute("id", "BPMNPlane_1");
        bpmnPlane.setAttribute(
            "bpmnElement",
            processElement.getAttribute("name") || "Process_1honodd",
        );

        // Mapear elementos a shapes y edges
        const elementMap = {}; // Para almacenar las posiciones de los elementos
        const flowElements = processElement.querySelectorAll("flowElements");

        flowElements.forEach((flowElement) => {
            const type = flowElement.getAttribute("xsi:type");
            let bpmnFlowElement, bpmnShape;

            switch (type) {
                case "bpmn2:StartEvent":
                    // Crear el proceso BPMN
                    bpmnFlowElement = bpmnDoc.createElement("bpmn:startEvent");
                    bpmnFlowElement.setAttribute(
                        "id",
                        flowElement.getAttribute("id") || "",
                    );
                    bpmnFlowElement.setAttribute(
                        "name",
                        flowElement.getAttribute("name") || "",
                    );

                    const outgoing = flowElement.querySelector("outgoing");
                    if (outgoing) {
                        const bpmnOutgoing =
                            bpmnDoc.createElement("bpmn:outgoing");
                        bpmnOutgoing.textContent = outgoing.textContent;
                        bpmnFlowElement.appendChild(bpmnOutgoing);
                    }

                    bpmnProcess.appendChild(bpmnFlowElement);

                    // Generar el BPMNShape
                    bpmnShape = bpmnDoc.createElement("bpmndi:BPMNShape");
                    bpmnShape.setAttribute(
                        "id",
                        `_${flowElement.getAttribute("id")}_di`,
                    );
                    bpmnShape.setAttribute(
                        "bpmnElement",
                        flowElement.getAttribute("id") || "",
                    );
                    elementMap[flowElement.getAttribute("id")] = { x, y }; // Guardar posición

                    const boundsStart = bpmnDoc.createElement("dc:Bounds");
                    boundsStart.setAttribute("x", x.toString());
                    boundsStart.setAttribute("y", y.toString());
                    boundsStart.setAttribute("width", "36");
                    boundsStart.setAttribute("height", "36");
                    bpmnShape.appendChild(boundsStart);

                    bpmnPlane.appendChild(bpmnShape);
                    x += offsetX; // Mover posición horizontal
                    break;

                case "bpmn2:Task":
                    // Crear el proceso BPMN
                    bpmnFlowElement = bpmnDoc.createElement("bpmn:task");
                    bpmnFlowElement.setAttribute(
                        "id",
                        flowElement.getAttribute("id") || "",
                    );
                    bpmnFlowElement.setAttribute(
                        "name",
                        flowElement.getAttribute("name") || "",
                    );

                    const incomingTask = flowElement.querySelector("incoming");
                    if (incomingTask) {
                        const bpmnIncoming =
                            bpmnDoc.createElement("bpmn:incoming");
                        bpmnIncoming.textContent = incomingTask.textContent;
                        bpmnFlowElement.appendChild(bpmnIncoming);
                    }

                    const outgoingTask = flowElement.querySelector("outgoing");
                    if (outgoingTask) {
                        const bpmnOutgoing =
                            bpmnDoc.createElement("bpmn:outgoing");
                        bpmnOutgoing.textContent = outgoingTask.textContent;
                        bpmnFlowElement.appendChild(bpmnOutgoing);
                    }

                    bpmnProcess.appendChild(bpmnFlowElement);

                    // Generar el BPMNShape
                    bpmnShape = bpmnDoc.createElement("bpmndi:BPMNShape");
                    bpmnShape.setAttribute(
                        "id",
                        `_${flowElement.getAttribute("id")}_di`,
                    );
                    bpmnShape.setAttribute(
                        "bpmnElement",
                        flowElement.getAttribute("id") || "",
                    );
                    elementMap[flowElement.getAttribute("id")] = { x, y }; // Guardar posición

                    const boundsTask = bpmnDoc.createElement("dc:Bounds");
                    boundsTask.setAttribute("x", x.toString());
                    boundsTask.setAttribute("y", y.toString());
                    boundsTask.setAttribute("width", "100");
                    boundsTask.setAttribute("height", "80");
                    bpmnShape.appendChild(boundsTask);

                    bpmnPlane.appendChild(bpmnShape);
                    x += offsetX; // Mover posición horizontal
                    break;

                case "bpmn2:ExclusiveGateway":
                    // Crear el proceso BPMN
                    bpmnFlowElement = bpmnDoc.createElement(
                        "bpmn:exclusiveGateway",
                    );
                    bpmnFlowElement.setAttribute(
                        "id",
                        flowElement.getAttribute("id") || "",
                    );
                    bpmnFlowElement.setAttribute(
                        "name",
                        flowElement.getAttribute("name") || "",
                    );

                    const incomingGateway =
                        flowElement.querySelector("incoming");
                    if (incomingGateway) {
                        const bpmnIncoming =
                            bpmnDoc.createElement("bpmn:incoming");
                        bpmnIncoming.textContent = incomingGateway.textContent;
                        bpmnFlowElement.appendChild(bpmnIncoming);
                    }

                    const outgoingGateway =
                        flowElement.querySelectorAll("outgoing");
                    outgoingGateway.forEach((outgoing) => {
                        const bpmnOutgoing =
                            bpmnDoc.createElement("bpmn:outgoing");
                        bpmnOutgoing.textContent = outgoing.textContent;
                        bpmnFlowElement.appendChild(bpmnOutgoing);
                    });

                    bpmnProcess.appendChild(bpmnFlowElement);

                    // Generar el BPMNShape
                    bpmnShape = bpmnDoc.createElement("bpmndi:BPMNShape");
                    bpmnShape.setAttribute(
                        "id",
                        `_${flowElement.getAttribute("id")}_di`,
                    );
                    bpmnShape.setAttribute(
                        "bpmnElement",
                        flowElement.getAttribute("id") || "",
                    );
                    elementMap[flowElement.getAttribute("id")] = { x, y }; // Guardar posición

                    const boundsGateway = bpmnDoc.createElement("dc:Bounds");
                    boundsGateway.setAttribute("x", x.toString());
                    boundsGateway.setAttribute("y", y.toString());
                    boundsGateway.setAttribute("width", "50");
                    boundsGateway.setAttribute("height", "50");
                    bpmnShape.appendChild(boundsGateway);

                    bpmnPlane.appendChild(bpmnShape);
                    x += offsetX; // Mover posición horizontal
                    break;

                case "bpmn2:IntermediateThrowEvent":
                    // Crear el proceso BPMN
                    bpmnFlowElement = bpmnDoc.createElement(
                        "bpmn:intermediateThrowEvent",
                    );
                    bpmnFlowElement.setAttribute(
                        "id",
                        flowElement.getAttribute("id") || "",
                    );
                    bpmnFlowElement.setAttribute(
                        "name",
                        flowElement.getAttribute("name") || "",
                    );

                    const incomingEvent = flowElement.querySelector("incoming");
                    if (incomingEvent) {
                        const bpmnIncoming =
                            bpmnDoc.createElement("bpmn:incoming");
                        bpmnIncoming.textContent = incomingEvent.textContent;
                        bpmnFlowElement.appendChild(bpmnIncoming);
                    }

                    bpmnProcess.appendChild(bpmnFlowElement);

                    // Generar el BPMNShape
                    bpmnShape = bpmnDoc.createElement("bpmndi:BPMNShape");
                    bpmnShape.setAttribute(
                        "id",
                        `_${flowElement.getAttribute("id")}_di`,
                    );
                    bpmnShape.setAttribute(
                        "bpmnElement",
                        flowElement.getAttribute("id") || "",
                    );
                    elementMap[flowElement.getAttribute("id")] = { x, y }; // Guardar posición

                    const boundsEvent = bpmnDoc.createElement("dc:Bounds");
                    boundsEvent.setAttribute("x", x.toString());
                    boundsEvent.setAttribute("y", y.toString());
                    boundsEvent.setAttribute("width", "36");
                    boundsEvent.setAttribute("height", "36");
                    bpmnShape.appendChild(boundsEvent);

                    bpmnPlane.appendChild(bpmnShape);
                    x += offsetX; // Mover posición horizontal
                    break;

                case "bpmn2:SequenceFlow":
                    // Crear el proceso BPMN
                    bpmnFlowElement =
                        bpmnDoc.createElement("bpmn:sequenceFlow");
                    bpmnFlowElement.setAttribute(
                        "id",
                        flowElement.getAttribute("id") || "",
                    );
                    bpmnFlowElement.setAttribute(
                        "sourceRef",
                        flowElement.getAttribute("sourceRef") || "",
                    );
                    bpmnFlowElement.setAttribute(
                        "targetRef",
                        flowElement.getAttribute("targetRef") || "",
                    );

                    bpmnProcess.appendChild(bpmnFlowElement);

                    // Generar el BPMNEdge
                    const edge = bpmnDoc.createElement("bpmndi:BPMNEdge");
                    edge.setAttribute(
                        "id",
                        `_${flowElement.getAttribute("id")}_di`,
                    );
                    edge.setAttribute(
                        "bpmnElement",
                        flowElement.getAttribute("id") || "",
                    );

                    const sourcePos =
                        elementMap[flowElement.getAttribute("sourceRef")];
                    const targetPos =
                        elementMap[flowElement.getAttribute("targetRef")];

                    if (sourcePos && targetPos) {
                        const waypoint1 = bpmnDoc.createElement("di:waypoint");
                        waypoint1.setAttribute("x", sourcePos.x.toString());
                        waypoint1.setAttribute("y", sourcePos.y.toString());

                        const waypoint2 = bpmnDoc.createElement("di:waypoint");
                        waypoint2.setAttribute("x", targetPos.x.toString());
                        waypoint2.setAttribute("y", targetPos.y.toString());

                        edge.appendChild(waypoint1);
                        edge.appendChild(waypoint2);
                    }

                    bpmnPlane.appendChild(edge);
                    break;
            }
        });

        bpmnDiagram.appendChild(bpmnPlane);
        bpmnDefinitions.appendChild(bpmnProcess);
        bpmnDefinitions.appendChild(bpmnDiagram);
        bpmnDoc.appendChild(bpmnDefinitions);

        // Convertir el documento a string con la cabecera XML
        const serializer = new XMLSerializer();
        const bpmnString = serializer.serializeToString(bpmnDoc);
        return `<?xml version="1.0" encoding="UTF-8"?>\n${bpmnString}`;
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
