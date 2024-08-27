import "../routes/types";
import {createCompleteModel} from "./exportdata";
import {loadAtributtes, parseRules} from "./importdata";

export function baseATL() {
    // Función para obtener las reglas de transformación a través del modelo completo
    const taskActivities = obtainTransformationRules();
    // Buscamos las reglas opcionales(las que se eliminan o no) y las reglas de reemplazo
    const optionalRules = obtainOptionalRules(taskActivities); // Filtramos solo las reglas opcionales(se eliminan o no)
    const replaceRules = obtainReplaceRules(taskActivities);  // Filtramos solo las reglas de reemplazo
    // Generamos el contenido del archivo
    const atlContent: string = `
module BPMNTailoringRules;
-- @path MM=/TestPaulTesis/BPMN20.ecore
-- @path MM2=/TestPaulTesis/CMM.ecore
-- @path MM1=/TestPaulTesis/BPMN20.ecore

create OUT : MM1 from IN : MM, IN1 : MM2;

-- To obtain the context elements

helper def: getContextAttributeConfiguration (nameAttribute: String) :
	                 MM2!ContextAttributeConfiguration = MM2!ContextAttributeConfiguration.allInstances()->asSequence()->select(a | a.myContextElement.name =nameAttribute )->first();
helper def: getValue(nameAttribute: String):
	                 String = thisModule.getContextAttributeConfiguration(nameAttribute).myContextAttributeValue.value;

helper def:getTaskDefinition(taskDefinitionName:String): MM!TaskDefinition =
			  MM!TaskDefinition.allInstances()->asSequence()->select(t|t.name = taskDefinitionName)->first();

-- To obtain the next WorkBreakDownElement

helper def:nextElement(a:MM!WorkBreakDownElement): MM!WorkBreakDownElement = MM!WorkBreakDownElement.allInstances()->select(t|t=a.next)->first();
helper def:next(a:MM!WorkBreakDownElement): MM!WorkBreakDownElement = if(thisModule.optionalRule(thisModule.nextElement(a).name)) then a else thisModule.next(thisModule.nextElement(a)) endif;

helper def: selectTaskRule(tu:MM!TaskUse): MM!TaskDefinition = tu.linkTask; 

-- To make changes in the tasks



helper def: optionalRuleParticipant(name:String): Boolean =
if(Sequence{'Scrum master'}.includes(name)) then
(    	if ('Scrum master' = name) then
			thisModule.ruleOptParticipant1()
		else
			true
		endif
)
else
	true
endif;

${generateOptionalRule(optionalRules)}

${generateReplaceRule(replaceRules)}

${generateOptFunction(optionalRules)}

${generateRepFunction(replaceRules)}

rule Definitions {
from	d:MM!Definitions
to		dd:MM1!Definitions(
        --exporter <- d.exporter,
		exporterVersion <- d.exporterVersion,
		--expressionLanguage<- d.expressionLanguage,
		name <- d.name,
		targetNamespace <- d.targetNamespace,
		typeLanguage <- d.typeLanguage,
		id <- d.id,
		rootElements <- d.rootElements,		
		diagrams <- d.diagrams
		--extensionDefinitions <- d.extensionDefinitions
        )
}

rule Collaboration {
from	d:MM!Collaboration
to		dd:MM1!Collaboration(
		--artifacts <- d.artifacts,
		--choreographyRef <- d.choreographyRef,
		--conversationAssociations <- d.conversationAssociations,
		isClosed <- d.isClosed,
		--messageFlows <- d. messageFlows,
		name <- d.name,
		participants <- d.participants,
		id <-d.id
        )
}

rule Participant {
from	d:MM!Participant(
		 thisModule.optionalRuleParticipant(d.name)	
)
to		dd:MM1!Participant(
        name <- d.name,
		--participantMultiplicity <- d.participantMultiplicity,
		--processRef <- d.processRef,
		id <- d.id
        )
}

rule Process {
from	d:MM!Process
to		dd:MM1!Process(
		isClosed <- d.isClosed,
		isExecutable <- d.isExecutable,
		processType <- d.processType,
		id <- d.id,
		name <- d.name,
		flowElements <- d.flowElements,
		documentation <- d.documentation
        )
}

rule Documentation {
from	d:MM!Documentation
to		dd:MM1!Documentation(
		text <- d.text
        )
}
	
rule Task {
from	d:MM!Task(
		 thisModule.optionalRule(d.name)	
)
to		dd:MM1!Task(
		name <- d.name
        )
}
`;
    return atlContent;
}

// Función para rescatar la información del modelo de reglas de transformación
function obtainTransformationRules(): activity[] {
    // Variable en donde se almacenarán las reglas de transformación encontradas en el modelo
    let activities: activity[] = [];

    // Crear el modelo completo y parsearlo a un formato procesable
    const xmlTailoringModel = createCompleteModel();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlTailoringModel, "text/xml");

   // Extraer los datos del modelos reglas que están en el modelo completo generado
    const rulesModel = xmlDoc.querySelector("RulesModel");
    const contentRules = rulesModel ? rulesModel.querySelectorAll("ContentRule")! : [];
    console.log("RulesModelNode: ", rulesModel);
    console.log("RulesModelNode: ", contentRules);

    // Obtenemos los atributos y valores que se encuentran en el modelo importado incialmente
    const attributesAndValues = loadAtributtes()[0];
    const onlyAttributes = loadAtributtes()[1];

    // Recorremos el modelo de reglas para obtener la información de cada regla y almacenarla en la variable activities
    contentRules.forEach((contentRule, index) => {
        console.log(contentRule);
        const activity: activity = {
            id: index,
            name: contentRule.getAttribute("name") || "",
            subname: contentRule.getAttribute("subname") || "",
            rules: parseRules(contentRule, onlyAttributes, attributesAndValues),
            deleted: contentRule.getAttribute("deleted") === "true" ? true : contentRule.getAttribute("deleted") === "false" ? false : undefined,
            replaced: contentRule.getAttribute("replace") ? true : undefined,
            replaceActivity: contentRule.getAttribute("replace") || undefined,
        };
        activities.push(activity);
    });

    return activities;
}


// Función para obtener las reglas opcionales
function obtainOptionalRules(taskActivities: activity[]): activity[] {
    let optionalRules: activity[] = [];
    taskActivities.forEach((activity: activity) => {
        if (activity.deleted != undefined) {
            optionalRules.push(activity);
        }
    });
    return optionalRules;
}

// Función para obtener las reglas reemplazo
function obtainReplaceRules(taskActivities: activity[]): activity[] {
    let replaceRules: activity[] = [];
    taskActivities.forEach((activity: activity) => {
        if (activity.replaced) {
            replaceRules.push(activity);
        }
    });
    return replaceRules;
}

// Función para filtrar solo los nombres de las actividades sin repetir
function filterOnlyNames(elements: activity[]): string[] {
    // Filtrar solo los nombres de las actividades sin repetir
    const names: string[] = [];
    elements.forEach((element: activity) => {
        if (!names.includes(element.name)) {
            names.push(element.name);
        }
    });
    return names;
}

// Función para encontrar una actividad por nombre
function findElementsByName(elements: activity[], name: string): activity[] {
    return elements.filter((element: activity) => element.name === name);
}

// Función para generar la función "GENERAL" de reglas opcionales
function generateOptionalRule(elements: activity[]): string {
    if (elements.length === 0) {
        return "";
    }
    const nameActivity: string[] = filterOnlyNames(elements);
    // Caso especial para un solo elemento
    if (nameActivity.length === 1) {
        const element = nameActivity[0];
        let singlerule = `helper def: optionalRule(name:String): Boolean =\nif(Sequence{'${element}'}.includes(name)) then\n\t(if ('${element}' = name) then`;
        const activities = findElementsByName(elements, element);
        let index = 0;
        activities.forEach(() => {
            singlerule += `\n\t\tthisModule.ruleOpt${index + 1}()`;
            if(index < activities.length - 1) {
                singlerule += `\tor`;
            }
            index++;
        });
        singlerule += `\n\telse\n\t\ttrue\n\tendif)\nelse\n\ttrue\nendif;`;
        return singlerule;
    }

    // Manejo para más de un elemento
    let rule = `helper def: optionalRule(name:String): Boolean =\nif(Sequence{${nameActivity.map(e => `'${e}'`).join(',')}}.includes(name)) then\n(`;
    let activities: activity[] = [];
    let index: number = 0;
    nameActivity.forEach((element: string) => {
        if (index === 0) {
            rule += `if ('${element}' = name) then`;
            activities = findElementsByName(elements, element);
            console.log("Activities: ", activities);
            activities.forEach(() => {
                rule += `\n\t\tthisModule.ruleOpt${index + 1}()`;
                if(index < activities.length - 1) {
                    rule += `\tor`;
                }
                index++;
            });
        }else {
            rule += `\n\telse\n\t\t(if ('${element}' = name) then`;
            activities = findElementsByName(elements, element);
            activities.forEach(() => {
                rule += `\n\t\t\tthisModule.ruleOpt${index + 1}()`;
                if(index < activities.length - 1) {
                    rule += `\tor`;
                }
                index++;
            });
        }
    });

    // Cerrar el último if con else true, y añadir el paréntesis de cierre
    rule += `\n\t\t\telse\n\t\t\t\ttrue\n\t\t\tendif)`;

    // Cerrar los bloques intermedios si hay más de dos elementos
    for (let i = 0; i < nameActivity.length - 2; i++) {
        rule += `\n\t\tendif)`;
    }

    rule += `\nendif)\nelse\n\ttrue\nendif;`;

    return rule;
}

// Función para generar la función "GENERAL" de reglas de reemplazo
function generateReplaceRule(elements: activity[]): string {
    if (elements.length === 0) {
        return "";
    }
    const nameActivity: string[] = filterOnlyNames(elements);
    // Caso especial para un solo elemento
    if (nameActivity.length === 1) {
        const element = nameActivity[0];
        let singlerule = `helper def: replaceRules(name:String): Boolean =\nif(Sequence{'${element}'}.includes(name)) then\n\t(if ('${element}' = name) then`;
        const activities = findElementsByName(elements, element);
        let index = 0;
        activities.forEach(() => {
            singlerule += `\n\t\tthisModule.ruleRep${index + 1}()`;
            if(index < activities.length - 1) {
                singlerule += `\tor`;
            }
            index++;
        });
        singlerule += `\n\telse\n\t\ttrue\n\tendif)\nelse\n\ttrue\nendif;`;
        return singlerule;
    }

    // Manejo para más de un elemento
    let rule = `helper def: replaceRules(name:String): Boolean =\nif(Sequence{${nameActivity.map(e => `'${e}'`).join(',')}}.includes(name)) then\n(`;
    let activities: activity[] = [];
    let index: number = 0;
    nameActivity.forEach((element: string) => {
        if (index === 0) {
            rule += `if ('${element}' = name) then`;
            activities = findElementsByName(elements, element);
            console.log("Activities: ", activities);
            activities.forEach(() => {
                rule += `\n\t\tthisModule.ruleRep${index + 1}()`;
                if(index < activities.length - 1) {
                    rule += `\tor`;
                }
                index++;
            });
        }else {
            rule += `\n\telse\n\t\t(if ('${element}' = name) then`;
            activities = findElementsByName(elements, element);
            activities.forEach(() => {
                rule += `\n\t\t\tthisModule.ruleRep${index + 1}()`;
                if(index < activities.length - 1) {
                    rule += `\tor`;
                }
                index++;
            });
        }
    });

    // Cerrar el último if con else true, y añadir el paréntesis de cierre
    rule += `\n\t\t\telse\n\t\t\t\ttrue\n\t\t\tendif)`;

    // Cerrar los bloques intermedios si hay más de dos elementos
    for (let i = 0; i < nameActivity.length - 2; i++) {
        rule += `\n\t\tendif)`;
    }

    rule += `\nendif)\nelse\n\ttrue\nendif;`;

    return rule;
}

// Función para generar la reglas que dictaminan si una actividad es eliminada o no (En base a las reglas de transformación)
function generateOptFunction(elements: activity[]): string {
    if (elements.length === 0) {
        return "";
    }
    let ruleOptFunction = "";
    var ruleConditions = "";
    const nameActivity: string[] = filterOnlyNames(elements);
    var index = 0;
    nameActivity.forEach((element) => {
        const activities = findElementsByName(elements, element);
        activities.forEach((activity) => {
            ruleConditions = activity.rules.map(parseRule).join(" ");
            if (index === 0) {
                ruleOptFunction = `helper def:ruleOpt${index + 1}():Boolean=if (${ruleConditions})`;
                if(!activity.deleted){
                    ruleOptFunction += ` then true else false endif;`;
                }else{
                    ruleOptFunction += ` then false else true endif;`;
                }
            } else {
                ruleOptFunction += `\nhelper def:ruleOpt${index + 1}():Boolean=if (${ruleConditions})`;
                if(!activity.deleted){
                    ruleOptFunction += ` then true else false endif;`;
                }else{
                    ruleOptFunction += ` then false else true endif;`;
                }
            }
            index++;
        });
    });
    return ruleOptFunction;
}

// Función para generar la reglas que dictaminan si una actividad es reemplazada (En base a las reglas de transformación)
function generateRepFunction(elements: activity[]): string {
    if (elements.length === 0) {
        return "";
    }
    let ruleRepFunction = "";
    var ruleConditions = "";
    const nameActivity: string[] = filterOnlyNames(elements);
    var index = 0;
    nameActivity.forEach((element) => {
        const activities = findElementsByName(elements, element);
        activities.forEach((activity) => {
            ruleConditions = activity.rules.map(parseRule).join(" ");
            if (index === 0) {
                ruleRepFunction = `helper def:ruleRep${index + 1}():Boolean=if (${ruleConditions})`;
                if(activity.replaced){
                    ruleRepFunction += ` then REEMPLAZO else NOREEMPLAZO endif;`;
                }
            } else {
                ruleRepFunction += `\nhelper def:ruleRep${index + 1}():Boolean=if (${ruleConditions})`;
                if(activity.replaced){
                    ruleRepFunction += ` then REEMPLAZO else NOREEMPLAZO endif;`;
                }
            }
            index++;
        });
    });
    return ruleRepFunction;
}

// Función para parsear las reglas a ATL
function parseRule(rule: any): string {
    if (rule.type === "Simple") {
        return `thisModule.getValue('${rule.attribute}') = '${rule.value}'`;
    } else if (rule.type === "Conector") {
        return rule.logical_operator.toLowerCase();
    } else if (rule.type === "Complex") {
        const complexRules = rule.rules.map(parseRule).join(" ");
        return `(${complexRules})`;
    } else {
        throw new Error("Tipo de regla no reconocido");
    }
}

export function downloadATL() {
    const atlCode = baseATL();
    const blob = new Blob([atlCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "BPMNTailoringRules.atl";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
