function removeXMIHeader(xmlString: string): string {
    return xmlString.replace(/<\?xml.*\?>\s*/, ""); // Elimina la declaración XML y cualquier espacio adicional al inicio
}

function createModelRule(reglas: any[]): string {
    return reglas
        .map((regla) => {
            // Cada regla es una ContentRule y se verifica si tiene subreglas para decidir su contenido
            const detallesRegla =
                regla.rules && regla.rules.length > 0
                    ? regla.rules
                        .map(
                            (subRegla: {
                                rules: string | any[];
                                id: any;
                                name: any;
                                type: any;
                                attribute: any;
                                value: any;
                                logical_operator: any;
                            }) => {
                                if (
                                    subRegla.rules &&
                                    subRegla.rules.length > 0
                                ) {
                                    // Si tiene subreglas, es una ComplexRule y se manejan sus subreglas recursivamente
                                    return `<ComplexRule xsi:type="ComplexRule" id="${subRegla.id}">
                ${createModelSubrule(subRegla.rules)}
            </ComplexRule>`;
                                } else {
                                    // Si no tiene subreglas, es una Rule simple
                                    return `<Rule xsi:type="Rule" id="${subRegla.id}" type="${subRegla.type}" attribute="${subRegla.attribute || subRegla.logical_operator}" value="${subRegla.value || "No value"}"></Rule>`;
                                }
                            },
                        )
                        .join("")
                    : "";
            const deletedAttribute =
                regla.deleted !== undefined
                    ? ` deleted="${regla.deleted}"`
                    : "";
            const replaceActivityAttribute =
                regla.replaceActivity !== undefined
                    ? ` replace="${regla.replaceActivity}"`
                    : "";
            return `<ContentRule xsi:type="ContentRule" id="${regla.id}" name="${regla.name}"${deletedAttribute}${replaceActivityAttribute} subname="${regla.subname}">
        ${detallesRegla}
    </ContentRule>`;
        })
        .join("");
}

function createModelSubrule(subReglas: any[] | string): string {
    if (Array.isArray(subReglas)) {
        return subReglas
            .map((subRegla) => {
                if (subRegla.rules && subRegla.rules.length > 0) {
                    // ComplexRule puede tener más reglas dentro
                    return `<ComplexRule xsi:type="ComplexRule" id="${subRegla.id}" >
                ${createModelSubrule(subRegla.rules)}
            </ComplexRule>`;
                } else {
                    // Simple Rule sin subreglas
                    return `<Rule xsi:type="Rule" id="${subRegla.id}"  type="${subRegla.type}" attribute="${subRegla.attribute || subRegla.logical_operator}" value="${subRegla.value || "No value"}"></Rule>`;
                }
            })
            .join("");
    } else {
        // Handle the case when subReglas is a string
        return subReglas;
    }
}

export function createCompleteModel() {
    let contextoXML = localStorage.getItem("xmlContext")!;
    let actividadesBPMN = localStorage.getItem("xmlBpmn")!;
    const reglas = JSON.parse(localStorage.getItem("taskNames")!);

    contextoXML = removeXMIHeader(contextoXML);
    actividadesBPMN = removeXMIHeader(actividadesBPMN);

    const documentoXML = `<?xml version="1.0" encoding="UTF-8"?>
<IntegratedModel xmlns:xmi="http://www.omg.org/XMI" xmlns:spcm="http://contextmetamodel/1.0" xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL-XMI" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
<ContextModel>
    ${contextoXML}
</ContextModel>
<BPMNModel>
    ${actividadesBPMN}
</BPMNModel>
<RulesModel>
    ${createModelRule(reglas)}
</RulesModel>
</IntegratedModel>`;

    console.log(documentoXML);
    localStorage.setItem("xmiModelRules", documentoXML);
    return documentoXML;
}

export function downloadXMIFile() {
    const contenidoXMI = createCompleteModel();
    const blob = new Blob([contenidoXMI], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "modelo-integrado.xmi";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}