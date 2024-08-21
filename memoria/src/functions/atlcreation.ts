function baseATL() {
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

${generateOptionalRule(['Prepucio', 'Puntuar_Historia_en_el_Sprint', 'pablo weco', 'paul el ma vio', 'weco1','weco2','alvaro'])}

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

function generateOptionalRule(elements: string[]): string {
    let rule = `helper def: optionalRule(name:String): Boolean =\nif(Sequence{${elements.map(e => `'${e}'`).join(',')}}.includes(name)) then\n(`;

    elements.forEach((element, index) => {
        if (index === 0) {
            rule += `if ('${element}' = name) then\n\t\tthisModule.ruleOpt${index + 1}()`;
        } else {
            rule += `\n\telse\n\t\t(if ('${element}' = name) then\n\t\t\tthisModule.ruleOpt${index + 1}()`;
        }
    });

    // Cerrar el último if con else true, y añadir el paréntesis de cierre
    rule += `\n\t\t\telse\n\t\t\t\ttrue\n\t\t\tendif)`;

    // Cerrar los bloques intermedios
    for (let i = 0; i < elements.length - 2; i++) {
        rule += `\n\t\tendif)`;
    }

    rule += `\nendif)\nelse\n\ttrue\nendif;`;

    return rule;
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
