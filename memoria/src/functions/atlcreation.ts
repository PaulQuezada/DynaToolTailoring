import "../routes/types";
function baseATL() {
    const optionalRules = obtainOptionalRules();
    console.log("Optional rules: ", optionalRules);
    const replaceRules = obtainReplaceRules();
    console.log("Replace rules: ", replaceRules);

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

function obtainOptionalRules(): activity[] {
    const taskActivities = JSON.parse(localStorage.getItem("taskNames")!);
    let optionalRules: activity[] = [];
    taskActivities.forEach((activity: activity) => {
        if (activity.deleted != undefined) {
            optionalRules.push(activity);
        }
    });
    return optionalRules;
}

function obtainReplaceRules(): activity[] {
    const taskActivities = JSON.parse(localStorage.getItem("taskNames")!);
    let replaceRules: activity[] = [];
    taskActivities.forEach((activity: activity) => {
        if (activity.replaced) {
            replaceRules.push(activity);
        }
    });
    return replaceRules;
}

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

function findElementsByName(elements: activity[], name: string): activity[] {
    return elements.filter((element: activity) => element.name === name);
}

function generateOptionalRule(elements: activity[]): string {
    if (elements.length === 0) {
        return "";
    }
    const nameActivity: string[] = filterOnlyNames(elements);
    if (nameActivity.length === 1) {
        // Caso especial para un solo elemento
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
            //rule += `if ('${element}' = name) then\n\t\tthisModule.ruleOpt${index + 1}()`;
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


function generateReplaceRule(elements: activity[]): string {
    if (elements.length === 0) {
        return "";
    }
    const nameActivity: string[] = filterOnlyNames(elements);
    if (nameActivity.length === 1) {
        // Caso especial para un solo elemento
        const element = nameActivity[0];
        return `helper def: replaceRules(name:String): Boolean =\nif(Sequence{'${element}'}.includes(name)) then\n\t(if ('${element}' = name) then\n\t\tthisModule.ruleRep1()\n\telse\n\t\ttrue\n\tendif)\nelse\n\ttrue\nendif;`;
    }

    // Manejo para más de un elemento
    let rule = `helper def: replaceRules(name:String): Boolean =\nif(Sequence{${nameActivity.map(e => `'${e}'`).join(',')}}.includes(name)) then\n(`;

    nameActivity.forEach((element: string, index) => {
        if (index === 0) {
            rule += `if ('${element}' = name) then\n\t\tthisModule.ruleRep${index + 1}()`;
        } else {
            rule += `\n\telse\n\t\t(if ('${element}' = name) then\n\t\t\tthisModule.ruleRep${index + 1}()`;
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

function generateOptFunction(elements: activity[]): string {
    if (elements.length === 0) {
        return "";
    }
    let ruleOptFunction = "";
    var ruleConditions = "";
    elements.forEach((element, index) => {
        ruleConditions = element.rules.map(parseRule).join(" ");
        if (index === 0) {
            ruleOptFunction = `helper def:ruleOpt${index + 1}():Boolean=if (${ruleConditions})`;
            if(!element.deleted){
                ruleOptFunction += ` then true else false endif;`;
            }else{
                ruleOptFunction += ` then false else true endif;`;
            }
        } else {
            ruleOptFunction += `\nhelper def:ruleOpt${index + 1}():Boolean=if (${ruleConditions})`;
            if(!element.deleted){
                ruleOptFunction += ` then true else false endif;`;
            }else{
                ruleOptFunction += ` then false else true endif;`;
            }
        }

    });
    return ruleOptFunction;
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
