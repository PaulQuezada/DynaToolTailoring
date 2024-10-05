import { get, type Writable } from "svelte/store";
import { getDataRulesTask, getDataSelectedActivity, setDataRulesTask } from "./datamanager";

// Función crea un id único para las reglas
function getUniqueId(): string {
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    const charactersLength = characters.length;
    for (let i = 0; i < 20; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength),
        );
    }
    return result;
}

// Función que busca una regla por su id
function findRuleById(rules: Rule[], id: string): Rule | null {
    for (let rule of rules) {
        if (rule.id === id) {
            return rule;
        }
        if (rule.type === "Complex") {
            let found = findRuleById(rule.rules, id);
            if (found) {
                return found;
            }
        }
    }
    return null;
}

// Funcion para actualizar el conjunto de reglas
/*
newRule: La nueva regla que se va ingresar
parentComplexRuleId: El id de la regla compleja padre

- Si parentComplexRuleId no es null o undefined:
    - La función busca la regla compleja que coincide con parentComplexRuleId usando la función findRuleById.
    - Si encuentra una regla compleja (que es un contenedor de otras reglas), añade newRule a su lista de sub-reglas.
- Si parentComplexRuleId es undefined o null:
    - La nueva regla newRule se agrega directamente a la lista de reglas (rules).
*/
function updateRuleInComplex(rules: Writable<Rule[]>, newRule: Rule,parentComplexRuleId: string | undefined | null): Writable<Rule[]> {
    if (parentComplexRuleId != null) {
        rules.update((rs) => {
            let parentRule = findRuleById(rs, parentComplexRuleId);
            if (parentRule && parentRule.type === "Complex") {
                parentRule.rules.push(newRule);
            }
            return rs;
        });
    } else {
        rules.update((currentRules) => [...currentRules, newRule]);
    }
    return rules;
}

export function addConnectorRule(rules: Writable<Rule[]>, parentComplexRuleId?: string): Writable<Rule[]> {
    const newRule: ConnectorRule = {
        id: getUniqueId(),
        type: "Conector",
        logical_operator: "Or",
        logicals: ["And", "Or"],
    };
    return updateRuleInComplex(rules, newRule, parentComplexRuleId);
}

export function addSimpleRule(rules: Writable<Rule[]>, attributesContext: any[], parentComplexRuleId?: string, id?: string): Writable<Rule[]> {
    if (parentComplexRuleId != null) {
        if (shouldAddConnector(rules, parentComplexRuleId)) {
            addConnectorRule(rules, parentComplexRuleId);
        }
    } else {
        if (shouldAddConnectorAtTopLevel(rules)) {
            addConnectorRule(rules);
        }
    }
    const newRule: SimpleRule = {
        id: getUniqueId(),
        type: "Simple",
        numberRule: get(rules).length + 1,
        attribute: "",
        value: "",
        attributes: attributesContext.map((attr) => attr.Attribute),
        values: [],
    };
    return updateRuleInComplex(rules, newRule, parentComplexRuleId);
}

export function addComplexRule(rules: Writable<Rule[]>, parentComplexRuleId?: string): Writable<Rule[]> {
    if (parentComplexRuleId != null) {
        if (shouldAddConnector(rules, parentComplexRuleId)) {
            addConnectorRule(rules, parentComplexRuleId);
        }
    } else {
        if (shouldAddConnectorAtTopLevel(rules)) {
            addConnectorRule(rules);
        }
    }
    const newRule: ComplexRule = {
        id: getUniqueId(),
        type: "Complex",
        numberRule: get(rules).length + 1,
        rules: [],
    };
    return updateRuleInComplex(rules, newRule, parentComplexRuleId);
}

export function deleteRuleById(rules: Writable<Rule[]>, ruleId: string): Writable<Rule[]> {
    rules.update((currentRules) => {
        return removeRule(currentRules, ruleId);
    });
    return rules;
}

function removeRule(rulesList: Rule[], ruleId: string): Rule[] {
    for (let i = 0; i < rulesList.length; i++) {
        const rule = rulesList[i];
        if (rule.id === ruleId) {
            // Check if previous rule is a connector and remove it
            if (i > 0 && rulesList[i - 1].type === "Conector") {
                rulesList.splice(i - 1, 2);
            } else if (
                i < rulesList.length - 1 &&
                rulesList[i + 1].type === "Conector"
            ) {
                rulesList.splice(i, 2);
            } else {
                rulesList.splice(i, 1);
            }
            return rulesList;
        } else if (rule.type === "Complex") {
            rule.rules = removeRule(rule.rules, ruleId);
        }
    }
    return rulesList;
}

function shouldAddConnector(rules: Writable<Rule[]>, parentComplexRuleId: string): boolean {
    const parentRule = findRuleById(get(rules), parentComplexRuleId);
    return (
        parentRule !== null &&
        parentRule.type === "Complex" &&
        parentRule.rules.length > 0 &&
        parentRule.rules.slice(-1)[0].type !== "Conector"
    );
}

function shouldAddConnectorAtTopLevel(rules: Writable<Rule[]>): boolean {
    const topLevelRules = get(rules);
    return (
        topLevelRules.length > 0 &&
        topLevelRules.slice(-1)[0].type !== "Conector"
    );
}

// Limpiar todas las reglas realizadas
export function clearAllRules(activities: activity[]): activity[] {
    var tasks = getDataRulesTask();
    var activitySelect = getDataSelectedActivity();
    tasks.forEach((task: any) => {
        if (task.id === activitySelect.id) {
            {
                task.rules = [];
                task.replaceActivity = undefined;
                task.deleted = undefined;
                task.replaced = undefined;
            }
        }
    });
    setDataRulesTask(JSON.stringify(tasks));
    activities = tasks;
    return activities;
}