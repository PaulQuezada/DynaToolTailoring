<script lang="ts">
    import { onMount } from "svelte";
    import { XMLParser } from "fast-xml-parser";

    // Variables
    var x_axis: number = 150;
    var y_axis: number = 82;
    const vertical_step = 100; // Distancia vertical para los gateways
    const horizontal_step = 200; // Distancia horizontal entre nodos

    // Creando la instancia del parser
    const parserOptions = {
        ignoreAttributes: false,
        attributeNamePrefix: "",
        allowBooleanAttributes: true,
        parseNodeValue: true,
        parseAttributeValue: true,
    };
    const parser = new XMLParser(parserOptions);

    let positions: { height: number; width: number; x: number; y: number }[] =
        [];

    let xmiModel: string = `
      <?xml version="1.0" encoding="UTF-8"?>
      <bpmn2:Definitions xmi:version="2.0" xmlns:xmi="http://www.omg.org/XMI" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL-XMI" name="BPMN Process Model">
        <rootElements xsi:type="bpmn2:Process" name="Process_1honodd">
          <flowElements xsi:type="bpmn2:StartEvent" id="StartEvent_03a0xqk" name="Begin">
            <outgoing>Flow_1u4a10w</outgoing>
          </flowElements>
          <flowElements xsi:type="bpmn2:Task" id="Activity_1xmxa41" name="Create code">
            <incoming>Flow_1u4a10w</incoming>
            <outgoing>Flow_0znwb87</outgoing>
          </flowElements>
          <flowElements xsi:type="bpmn2:ExclusiveGateway" id="Gateway_0nx1ynk" name="Backlog stories needed?">
            <incoming>Flow_0znwb87</incoming>
            <outgoing>Flow_1yc8bvs</outgoing>
            <outgoing>Flow_0atw7x2</outgoing>
          </flowElements>
          <flowElements xsi:type="bpmn2:Task" id="Activity_1cpn3jo" name="Estimate tasks">
            <incoming>Flow_1yc8bvs</incoming>
          </flowElements>
          <flowElements xsi:type="bpmn2:IntermediateThrowEvent" id="Event_0z7njfz" name="End">
            <incoming>Flow_0atw7x2</incoming>
          </flowElements>
          <flowElements xsi:type="bpmn2:SequenceFlow" id="Flow_1u4a10w" sourceRef="StartEvent_03a0xqk" targetRef="Activity_1xmxa41"/>
          <flowElements xsi:type="bpmn2:SequenceFlow" id="Flow_0znwb87" sourceRef="Activity_1xmxa41" targetRef="Gateway_0nx1ynk"/>
          <flowElements xsi:type="bpmn2:SequenceFlow" id="Flow_1uoa82d" name="No" sourceRef="Gateway_0nx1ynk" targetRef="Event_0z7njfz"/>
          <flowElements xsi:type="bpmn2:SequenceFlow" id="Flow_0yz67ha" name="Yes" sourceRef="Gateway_0nx1ynk" targetRef="Activity_1cpn3jo"/>
        </rootElements>
      </bpmn2:Definitions>
    `;

    let bpmnModel: string = "";

    function convertXmiToBpmn(xmi: string) {
        const result = parser.parse(xmi);
        console.log("Resultado parseado:", result);

        const rootElements = result?.["bpmn2:Definitions"]?.rootElements;
        if (!rootElements) {
            console.error("No se encontraron rootElements en el XMI.");
            return;
        }

        const processId = rootElements["name"];
        const flowElements = rootElements?.flowElements || [];

        const flowElementsBPMN = flowElements.map((element: any) => {
            switch (element["xsi:type"]) {
                case "bpmn2:StartEvent":
                    return `<bpmn:startEvent id="${element.id}" name="${element.name}">
                          <bpmn:outgoing>${element.outgoing}</bpmn:outgoing>
                        </bpmn:startEvent>`;
                case "bpmn2:Task":
                    return `<bpmn:task id="${element.id}" name="${element.name}">
                          <bpmn:incoming>${element.incoming}</bpmn:incoming>
                          <bpmn:outgoing>${element.outgoing}</bpmn:outgoing>
                        </bpmn:task>`;
                case "bpmn2:ExclusiveGateway":
                    return `<bpmn:exclusiveGateway id="${element.id}" name="${element.name}">
                          <bpmn:incoming>${element.incoming}</bpmn:incoming>
                          ${element.outgoing.map((out: string) => `<bpmn:outgoing>${out}</bpmn:outgoing>`).join("\n")}
                        </bpmn:exclusiveGateway>`;
                case "bpmn2:IntermediateThrowEvent":
                    return `<bpmn:intermediateThrowEvent id="${element.id}" name="${element.name}">
                          <bpmn:incoming>${element.incoming}</bpmn:incoming>
                        </bpmn:intermediateThrowEvent>`;
                case "bpmn2:SequenceFlow":
                    return `<bpmn:sequenceFlow id="${element.id}" sourceRef="${element.sourceRef}" name="${element.name == undefined ? "" : element.name}" targetRef="${element.targetRef}" />`;
                default:
                    return "";
            }
        });

        // Alinear en el eje y para gateways y secuencias de tareas
        const bpmnShapes = flowElements.map((element: any) => {
            switch (element["xsi:type"]) {
                case "bpmn2:StartEvent":
                    x_axis += horizontal_step;
                    positions.push({
                        height: 36,
                        width: 36,
                        x: x_axis,
                        y: y_axis,
                    });
                    return `<bpmndi:BPMNShape id="Shape_${element.id}" bpmnElement="${element.id}">
                          <dc:Bounds x="${x_axis}" y="${y_axis}" width="36" height="36" />
                        </bpmndi:BPMNShape>`;
                case "bpmn2:Task":
                    x_axis += horizontal_step;
                    positions.push({
                        height: 80,
                        width: 100,
                        x: x_axis,
                        y: y_axis,
                    });
                    return `<bpmndi:BPMNShape id="Shape_${element.id}" bpmnElement="${element.id}">
                          <dc:Bounds x="${x_axis}" y="${y_axis}" width="100" height="80" />
                        </bpmndi:BPMNShape>`;
                case "bpmn2:ExclusiveGateway":
                    x_axis += horizontal_step;
                    y_axis += vertical_step; // Desplaza el gateway en el eje y
                    positions.push({
                        height: 50,
                        width: 50,
                        x: x_axis,
                        y: y_axis,
                    });
                    return `<bpmndi:BPMNShape id="Shape_${element.id}" bpmnElement="${element.id}">
                          <dc:Bounds x="${x_axis}" y="${y_axis}" width="50" height="50" />
                        </bpmndi:BPMNShape>`;
                case "bpmn2:IntermediateThrowEvent":
                    x_axis += horizontal_step;
                    y_axis -= vertical_step; // Vuelve al nivel anterior en el eje y
                    positions.push({
                        height: 36,
                        width: 36,
                        x: x_axis,
                        y: y_axis,
                    });
                    return `<bpmndi:BPMNShape id="Shape_${element.id}" bpmnElement="${element.id}">
                          <dc:Bounds x="${x_axis}" y="${y_axis}" width="36" height="36" />
                        </bpmndi:BPMNShape>`;
                default:
                    return "";
            }
        });

        const bpmnEdges = flowElements
            .filter(
                (element: any) => element["xsi:type"] === "bpmn2:SequenceFlow",
            )
            .map((element: any) => {
                const sourcePosition = positions.find(
                    (pos) => pos.x === element.x,
                );
                const targetPosition = positions.find(
                    (pos) => pos.x === element.x,
                );

                console.log("Source:", sourcePosition);
                console.log("Target:", targetPosition);
                if (sourcePosition && targetPosition) {
                    // Ajustar el waypoint para que salga del centro del elemento de origen y vaya al centro del elemento destino
                    const sourceX = sourcePosition.x + sourcePosition.width / 2;
                    const sourceY =
                        sourcePosition.y + sourcePosition.height / 2;
                    const targetX = targetPosition.x + targetPosition.width / 2;
                    const targetY =
                        targetPosition.y + targetPosition.height / 2;

                    return `
                        <bpmndi:BPMNEdge id="Edge_${element.id}" bpmnElement="${element.id}">
                            <di:waypoint x="${sourceX}" y="${sourceY}" />
                            <di:waypoint x="${targetX}" y="${targetY}" />
                        </bpmndi:BPMNEdge>`;
                }
                return "";
            });
        bpmnModel = `<?xml version="1.0" encoding="UTF-8"?>
      <bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                        xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                        xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
                        xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
                        xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
                        id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
        <bpmn:process id="${processId}" isExecutable="false">
          ${flowElementsBPMN.join("\n")}
        </bpmn:process>
        <bpmndi:BPMNDiagram id="BPMNDiagram_1">
          <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="${processId}">
            ${bpmnShapes.join("\n")}
            ${bpmnEdges.join("\n")}
          </bpmndi:BPMNPlane>
        </bpmndi:BPMNDiagram>
      </bpmn:definitions>
    `;

        console.log(bpmnModel);
    }

    onMount(() => {
        convertXmiToBpmn(xmiModel);
    });
</script>

<div class="w-full h-full flex flex-col">
    <button
        class="w-3/4 mx-auto border rounded mt-5"
        on:click={() => {
            navigator.clipboard.writeText(bpmnModel);
        }}>Copy</button
    >
    <div
        class=" h-[500px] w-5/6 rounded border p-1 overflow-y-auto mt-10 mx-auto"
    >
        <pre>{bpmnModel}</pre>
    </div>
</div>
