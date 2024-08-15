<script lang="ts">
    // Importamos las librerias necesarias
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { writable, get } from "svelte/store";
    import "../types";
    import { themeStore } from "../../stores";
    import {
        fileUploadBpmn,
        fileUploadContext,
    } from "../../functions/importdata";
    import * as functionRulecreation from "../../functions/rulecreation";

    // Variables
    let selectedAction = "";
    let selectedAction1 = "Delete Action";
    let selectedAction2 = "";
    let actions = ["Delete Action", "Replace Action"];
    let deleteaction = ["Not delete this activity", "Delete this activity"];
    let replaceaction: any[] = [];
    let showModal = false;
    let showModalNivel1 = false;
    let showModalNivel2 = false;
    let showModalNivel3 = false;
    let showModalCrear = false;
    let showModalEliminar = false;
    let rule_selected: Rule, subrule_selected: Rule;
    let activities: activity[] = [];
    let divElement: HTMLElement;
    let yOffset = 0;

    let xmlContext: string = "";
    let xmlBpmn: string = "";
    let attributesContext: any[] = [];

    let activity: activity = {
        id: 0,
        name: "Default Activity - No activity selected",
        subname: "",
        rules: [],
    };

    let rules = writable<Rule[]>([]);

    function toggleModalNivel1() {
        showModal = !showModal;
        showModalNivel1 = !showModalNivel1;
    }
    function toggleModalNivel2() {
        showModal = !showModal;
        showModalNivel2 = !showModalNivel2;
    }
    function toggleModalNivel3() {
        showModal = !showModal;
        showModalNivel3 = !showModalNivel3;
    }
    function toggleModalCrear() {
        showModal = !showModal;
        showModalCrear = !showModalCrear;
    }
    function toggleModalEliminar() {
        showModal = !showModal;
        showModalEliminar = !showModalEliminar;
    }

    function addSimpleRule(parentComplexRuleId?: string, id?: string) {
        const result = functionRulecreation.addSimpleRule(
            rules,
            attributesContext,
            parentComplexRuleId,
            id,
        );
        rules = result;
    }

    function addComplexRule(parentComplexRuleId?: string) {
        const result = functionRulecreation.addComplexRule(
            rules,
            parentComplexRuleId,
        );
        rules = result;
    }

    function deleteRuleById(ruleId: string) {
        const result = functionRulecreation.deleteRuleById(rules, ruleId);
        rules = result;
    }

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

    // Recolectaremos los datos contenidos en el localstorage
    onMount(() => {
        // Inicializamos los datos
        initializeData();
        // Efecto parallax
        const handleScroll = () => {
            const scrollPosition = divElement.scrollTop; // Cambiamos a usar scrollTop del div
            yOffset = scrollPosition * 0.5; // Ajusta el valor para controlar la velocidad del efecto parallax
            divElement.style.backgroundPosition = `center ${yOffset}px`;
        };
        divElement.addEventListener("scroll", handleScroll);
        return () => {
            divElement.removeEventListener("scroll", handleScroll);
        };
    });

    // Función donde se incializan los datos, esto es cuando se carga la pagina y se obtienen los datos del localstorage
    async function initializeData() {
        // Aqui recolectamos los datos del localstorage
        xmlContext = localStorage.getItem("xmlContext")!;
        xmlBpmn = localStorage.getItem("xmlBpmn")!;
        handleFileUploadContext();
        await loadDataBPMN();
        // Obtenemos la actividad seleccionada
        var activitySelect = localStorage.getItem("activitySelect")!;
        if (activitySelect != null) {
            activity = JSON.parse(activitySelect);
            if (activity.rules != null) {
                rules.set(activity.rules);
                console.log(activity);
                if (activity.deleted != null) {
                    console.log("deleted");
                    selectedAction1 = "Delete Action";
                    selectedAction2 = activity.deleted
                        ? "Delete this activity"
                        : "Not delete this activity";
                } else if (activity.replaced) {
                    console.log("replaced");
                    selectedAction1 = "Replace Action";
                    selectedAction2 = activity.replaceActivity!;
                } else {
                    console.log("ERROR: No action");
                }
            }
        }
    }

    // Función para manejar la carga de archivos contexto organizacional
    async function handleFileUploadContext() {
        xmlContext = localStorage.getItem("xmlContext")!;
        attributesContext = await fileUploadContext(xmlContext);
    }

    // Función para manejar la carga de archivos BPMN
    async function loadDataBPMN() {
        // Extraemos los datos el archivo BPMN
        xmlBpmn = localStorage.getItem("xmlBpmn")!;
        var task = await fileUploadBpmn(xmlBpmn);
        // Los convertimos a un objeto JSON para manejarlos de mejor forma, dandole un id a cada actividad, subnombre y reglas (que por ahora estan vacias)
        var id: number = 0;
        var taskNameConverted: activity[] = task.map((task: any) => {
            var i = 0;
            return {
                id: i++,
                name: task,
                subname: "Default Subname",
                rules: [],
            };
        });
        // Guardar las actividades convertidas
        activities = taskNameConverted;
        // guardo solo los nombres del taskName
        replaceaction = activities.map((task) => task.name);
    }

    // Función para guardar los cambios del atributo en las reglas
    function attributeRuleSelected(event: Event, rule_selected: SimpleRule) {
        let attributeSelect = (event.target as HTMLSelectElement).value;
        // Buscamos la regla seleccionada y modificamos el valor del atributo
        rules.update((rs) => {
            let rule = findRuleById(rs, rule_selected.id);
            if (rule && rule.type == "Simple") {
                rule.attribute = attributeSelect;
                rule.value = "";
                const attribute = attributesContext.find(
                    (attr) => attr.Attribute == attributeSelect,
                );
                rule.values = attribute ? attribute.values : [];
                console.log("Cambia el atributo de la regla");
                console.log(rule);
            } else {
                console.log("No se encontro la regla");
            }
            return rs;
        });
    }

    // Función para guardar los cambios del valor en las reglas
    function valueRuleSelected(event: Event, rule_selected: SimpleRule) {
        let valueSelect = (event.target as HTMLSelectElement).value;
        // Buscamos la regla seleccionada y modificamos el valor del atributo
        rules.update((rs) => {
            const rule = findRuleById(rs, rule_selected.id);
            if (rule && rule.type == "Simple") {
                rule.value = valueSelect;
            } else {
                console.log("No se encontro la regla");
            }
            return rs;
        });
    }

    // Función para guardar los cambios del conector en las reglas
    function conectorRuleSelected(event: Event, rule_selected: ConnectorRule) {
        let conectorSelect = (event.target as HTMLSelectElement).value;
        // Buscamos la regla seleccionada y modificamos el valor del atributo
        rules.update((rs) => {
            const rule = findRuleById(rs, rule_selected.id);
            if (rule && rule.type == "Conector") {
                rule.logical_operator = conectorSelect;
            }
            return rs;
        });
    }

    // Función para guardar los cambios de todas las reglas en el localStorage
    function addRulesLocalStorage() {
        // Obtenemos las actividades que estan en el localStorage
        var task = localStorage.getItem("taskNames")!;
        // Si taskNames no es nulo, lo convertimos a JSON y lo guardamos
        if (activities != null) {
            var jsonTask = JSON.parse(task);
        }
        // Ahora buscamos en jsonTask el objeto de la actividad seleccionada y le agregamos las reglas
        jsonTask.forEach((task: activity) => {
            if (task.id === activity.id) {
                task.rules = get(rules);
                if (
                    selectedAction1 === "Delete Action" &&
                    selectedAction2 === "Not delete this activity"
                ) {
                    task.deleted = false;
                    task.replaceActivity = undefined;
                    task.replaced = undefined;
                } else if (
                    selectedAction1 === "Delete Action" &&
                    selectedAction2 === "Delete this activity"
                ) {
                    task.deleted = true;
                    task.replaceActivity = undefined;
                    task.replaced = undefined;
                } else if (selectedAction1 === "Replace Action") {
                    task.replaced = true;
                    task.replaceActivity = selectedAction2;
                    task.deleted = undefined;
                }
            }
        });
        // Guardamos el objeto con las reglas en el localStorage
        localStorage.setItem("taskNames", JSON.stringify(jsonTask));
    }

    // Limpiar todas las reglas realizadas
    function clearAllRules() {
        const result = functionRulecreation.clearAllRules(activities);
        activities = result;
    }
</script>

<div
    class="w-full h-full ${showModal ? 'filter blur-md' : ''} {$themeStore ===
    'Light'
        ? 'bg-[#f6f6f6]'
        : 'bg-[#14111b]'}  transition duration-100"
>
    <div class="flex flex-col">
        <h1
            class="pt-2 mx-10 text-2xl my-5 font-bold {$themeStore === 'Light'
                ? 'text-[#14111b]'
                : 'text-[#eaeef5]'}"
        >
            Rule for activity: {activity.name}
        </h1>
        <div class="flex flex-row">
            <!-- Pizarra donde estará la creación de reglas -->
            <div
                bind:this={divElement}
                class="mx-10 p-5 overflow-y-auto h-[570px] w-3/4 rounded-md parallax-bg {$themeStore ===
                'Light'
                    ? 'bg-[#ffffff]'
                    : 'bg-[#201f2b]'}"
            >
                {#each $rules as rule}
                    {#if rule.type === "Simple"}
                        <div
                            class="relative flex w-2/6 min-w-[200px] mx-auto rounded-lg {$themeStore ===
                            'Light'
                                ? 'bg-[#9da1f6]'
                                : 'bg-[#5c61f6]'}"
                        >
                            <button
                                class="absolute top-0 right-0 -mt-4 -mr-4 bg-[#ce4f2c] text-white rounded-full px-1"
                                on:click={() => deleteRuleById(rule.id)}
                            >
                                <span
                                    class="mx-2 my-1 text-sm material-symbols-outlined"
                                >
                                    delete
                                </span>
                            </button>
                            <div
                                class="absolute top-0 left-0 -mt-4 -ml-4 bg-[#dfe2eb] text-[#707382] rounded-full px-1"
                            >
                                <div class="flex mx-1 my-1">
                                    <span
                                        class="my-auto text-sm material-symbols-outlined"
                                    >
                                        tag
                                    </span>
                                    <p class="my-auto text-xs">
                                        {rule.numberRule}
                                    </p>
                                </div>
                            </div>
                            <div class="mx-auto">
                                <div
                                    class="flex justify-between mx-5 mt-2 text-[#e3e6fb]"
                                >
                                    <h1>Attribute</h1>
                                    <h2>Value</h2>
                                </div>
                                <div class="flex justify-between -my-5 mb-5">
                                    <select
                                        bind:value={rule.attribute}
                                        id="actions"
                                        class="mt-5 w-1/2 mx-2 h-[30px]"
                                        on:change={(e) =>
                                            attributeRuleSelected(e, rule)}
                                    >
                                        {#each rule.attributes ?? [] as action}
                                            <option value={action}
                                                >{action}</option
                                            >
                                        {/each}
                                    </select>
                                    <select
                                        bind:value={rule.value}
                                        id="actions"
                                        class="mt-5 w-1/2 mx-2 h-[30px]"
                                        on:change={(e) =>
                                            valueRuleSelected(e, rule)}
                                    >
                                        {#each rule.values ?? [] as action}
                                            <option value={action}
                                                >{action}</option
                                            >
                                        {/each}
                                    </select>
                                </div>
                            </div>
                        </div>
                    {:else if rule.type === "Complex"}
                        <div
                            class="relative flex flex-col w-4/6 min-w-[300px] mx-auto rounded-lg {$themeStore ===
                            'Light'
                                ? 'bg-[#a271f4]'
                                : 'bg-[#634697]'}"
                        >
                            <button
                                class="absolute top-0 right-0 -mt-4 -mr-4 bg-[#ce4f2c] text-white rounded-full px-1"
                                on:click={() => deleteRuleById(rule.id)}
                            >
                                <span
                                    class="mx-2 my-1 text-sm material-symbols-outlined"
                                >
                                    delete
                                </span>
                            </button>
                            <div
                                class="absolute top-0 left-0 -mt-4 -ml-4 bg-[#dfe2eb] text-[#707382] rounded-full px-1"
                            >
                                <div class="flex mx-1 my-1">
                                    <span
                                        class="my-auto text-sm material-symbols-outlined"
                                    >
                                        tag
                                    </span>
                                    <p class="my-auto text-xs">
                                        {rule.numberRule}
                                    </p>
                                </div>
                            </div>
                            <div class="my-5">
                                {#each rule.rules ?? [] as rulep1}
                                    {#if rulep1.type === "Simple"}
                                        <div
                                            class="relative flex w-3/6 min-w-[200px] h-[70px] mx-auto rounded-lg {$themeStore ===
                                            'Light'
                                                ? 'bg-[#9da1f6]'
                                                : 'bg-[#5c61f6]'}"
                                        >
                                            <button
                                                class="absolute top-0 right-0 -mt-4 -mr-4 bg-[#ce4f2c] text-white rounded-full px-1"
                                                on:click={() =>
                                                    deleteRuleById(rulep1.id)}
                                            >
                                                <span
                                                    class="mx-2 my-1 text-sm material-symbols-outlined"
                                                >
                                                    delete
                                                </span>
                                            </button>
                                            <div
                                                class="absolute top-0 left-0 -mt-4 -ml-4 bg-[#dfe2eb] text-[#707382] rounded-full px-1"
                                            >
                                                <div class="flex mx-1 my-1">
                                                    <span
                                                        class="my-auto text-sm material-symbols-outlined"
                                                    >
                                                        tag
                                                    </span>
                                                    <p class="my-auto text-xs">
                                                        {rulep1.numberRule}
                                                    </p>
                                                </div>
                                            </div>
                                            <div class="mx-auto">
                                                <div
                                                    class="flex justify-between mx-5 mt-2 text-[#e3e6fb]"
                                                >
                                                    <h1>Attribute</h1>
                                                    <h2>Value</h2>
                                                </div>
                                                <div
                                                    class="flex justify-between -my-5 mb-5"
                                                >
                                                    <select
                                                        bind:value={rulep1.attribute}
                                                        id="actions"
                                                        class="mt-5 w-1/2 mx-2 h-[30px]"
                                                        on:change={(e) =>
                                                            attributeRuleSelected(
                                                                e,
                                                                rulep1,
                                                            )}
                                                    >
                                                        {#each rulep1.attributes ?? [] as action}
                                                            <option
                                                                value={action}
                                                                >{action}</option
                                                            >
                                                        {/each}
                                                    </select>
                                                    <select
                                                        bind:value={rulep1.value}
                                                        placeholder="Value"
                                                        id="actions"
                                                        class="mt-5 w-1/2 mx-2 h-[30px]"
                                                        on:change={(e) =>
                                                            valueRuleSelected(
                                                                e,
                                                                rulep1,
                                                            )}
                                                    >
                                                        {#each rulep1.values ?? [] as action}
                                                            <option
                                                                value={action}
                                                                >{action}</option
                                                            >
                                                        {/each}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    {:else if rulep1.type === "Complex"}
                                        <div
                                            class="relative flex flex-col w-4/6 min-w-[300px] mx-auto rounded-lg {$themeStore ===
                                            'Light'
                                                ? 'bg-[#803df1]'
                                                : 'bg-[#7e50ca]'}"
                                        >
                                            <button
                                                class="absolute top-0 right-0 -mt-4 -mr-4 bg-[#ce4f2c] text-white rounded-full px-1"
                                                on:click={() =>
                                                    deleteRuleById(rulep1.id)}
                                            >
                                                <span
                                                    class="mx-2 my-1 text-sm material-symbols-outlined"
                                                >
                                                    delete
                                                </span>
                                            </button>
                                            <div
                                                class="absolute top-0 left-0 -mt-4 -ml-4 bg-[#dfe2eb] text-[#707382] rounded-full px-1"
                                            >
                                                <div class="flex mx-1 my-1">
                                                    <span
                                                        class="my-auto text-sm material-symbols-outlined"
                                                    >
                                                        tag
                                                    </span>
                                                    <p class="my-auto text-xs">
                                                        {rulep1.numberRule}
                                                    </p>
                                                </div>
                                            </div>
                                            <div class="my-5">
                                                {#each rulep1.rules ?? [] as rulep2}
                                                    {#if rulep2.type === "Simple"}
                                                        <div
                                                            class="relative flex w-3/6 min-w-[200px] h-[70px] mx-auto rounded-lg {$themeStore ===
                                                            'Light'
                                                                ? 'bg-[#9da1f6]'
                                                                : 'bg-[#5c61f6]'}"
                                                        >
                                                            <button
                                                                class="absolute top-0 right-0 -mt-4 -mr-4 bg-[#ce4f2c] text-white rounded-full px-1"
                                                                on:click={() =>
                                                                    deleteRuleById(
                                                                        rulep2.id,
                                                                    )}
                                                            >
                                                                <span
                                                                    class="mx-2 my-1 text-sm material-symbols-outlined"
                                                                >
                                                                    delete
                                                                </span>
                                                            </button>
                                                            <div
                                                                class="absolute top-0 left-0 -mt-4 -ml-4 bg-[#dfe2eb] text-[#707382] rounded-full px-1"
                                                            >
                                                                <div
                                                                    class="flex mx-1 my-1"
                                                                >
                                                                    <span
                                                                        class="my-auto text-sm material-symbols-outlined"
                                                                    >
                                                                        tag
                                                                    </span>
                                                                    <p
                                                                        class="my-auto text-xs"
                                                                    >
                                                                        {rulep2.numberRule}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div
                                                                class="mx-auto"
                                                            >
                                                                <div
                                                                    class="flex justify-between mx-5 mt-2 text-[#e3e6fb]"
                                                                >
                                                                    <h1>
                                                                        Attribute
                                                                    </h1>
                                                                    <h2>
                                                                        Value
                                                                    </h2>
                                                                </div>
                                                                <div
                                                                    class="flex justify-between -my-5 mb-5"
                                                                >
                                                                    <select
                                                                        bind:value={rulep2.attribute}
                                                                        id="actions"
                                                                        class="mt-5 w-1/2 mx-2 h-[30px]"
                                                                        on:change={(
                                                                            e,
                                                                        ) =>
                                                                            attributeRuleSelected(
                                                                                e,
                                                                                rulep2,
                                                                            )}
                                                                    >
                                                                        {#each rulep2.attributes ?? [] as action}
                                                                            <option
                                                                                value={action}
                                                                                >{action}</option
                                                                            >
                                                                        {/each}
                                                                    </select>
                                                                    <select
                                                                        bind:value={rulep2.value}
                                                                        placeholder="Value"
                                                                        id="actions"
                                                                        class="mt-5 w-1/2 mx-2 h-[30px]"
                                                                        on:change={(
                                                                            e,
                                                                        ) =>
                                                                            valueRuleSelected(
                                                                                e,
                                                                                rulep2,
                                                                            )}
                                                                    >
                                                                        {#each rulep2.values ?? [] as action}
                                                                            <option
                                                                                value={action}
                                                                                >{action}</option
                                                                            >
                                                                        {/each}
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    {:else if rulep2.type === "Conector"}
                                                        <div
                                                            class="flex w-1/3 min-w-[120px] mx-auto rounded-lg {$themeStore ===
                                                            'Light'
                                                                ? 'bg-[#e69e3a]'
                                                                : 'bg-[#bf8a42]'}"
                                                        >
                                                            <div
                                                                class="flex flex-col mx-auto"
                                                            >
                                                                <h1
                                                                    class="mt-1 text-center text-[#e3e6fb]"
                                                                >
                                                                    Logical
                                                                    Operator
                                                                </h1>
                                                                <select
                                                                    bind:value={rulep2.logical_operator}
                                                                    id="actions"
                                                                    class="my-2 w-2/3 mx-auto h-[30px]"
                                                                    on:change={(
                                                                        e,
                                                                    ) =>
                                                                        conectorRuleSelected(
                                                                            e,
                                                                            rulep2,
                                                                        )}
                                                                >
                                                                    {#each rulep2.logicals ?? [] as action}
                                                                        <option
                                                                            value={action}
                                                                            >{action}</option
                                                                        >
                                                                    {/each}
                                                                </select>
                                                            </div>
                                                        </div>
                                                    {/if}
                                                {/each}
                                                <div
                                                    class="mx-auto w-[3px] h-[20px] bg-[#68a95f]"
                                                ></div>
                                                <button
                                                    on:click={() => {
                                                        toggleModalNivel3();
                                                        rule_selected = rule;
                                                        subrule_selected =
                                                            rulep1;
                                                    }}
                                                    class="flex h-[50px] rounded-md justify-center mx-auto bg-[#68a95f] hover:bg-[#d1d3de] hover:shadow-2xl transition duration-300"
                                                >
                                                    <div class="flex my-auto">
                                                        <span
                                                            class="ml-2 text-white material-symbols-outlined"
                                                        >
                                                            add
                                                        </span>
                                                        <h1
                                                            class="mx-2 text-white"
                                                        >
                                                            Create a rule
                                                        </h1>
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    {:else}
                                        <div
                                            class="flex w-1/3 min-w-[120px] mx-auto rounded-lg {$themeStore ===
                                            'Light'
                                                ? 'bg-[#e69e3a]'
                                                : 'bg-[#bf8a42]'}"
                                        >
                                            <div class="flex flex-col mx-auto">
                                                <h1
                                                    class="mt-1 text-center text-[#e3e6fb]"
                                                >
                                                    Logical Operator
                                                </h1>
                                                <select
                                                    bind:value={rulep1.logical_operator}
                                                    id="actions"
                                                    class="my-2 w-2/3 mx-auto h-[30px]"
                                                    on:change={(e) =>
                                                        conectorRuleSelected(
                                                            e,
                                                            rulep1,
                                                        )}
                                                >
                                                    {#each rulep1.logicals ?? [] as action}
                                                        <option value={action}
                                                            >{action}</option
                                                        >
                                                    {/each}
                                                </select>
                                            </div>
                                        </div>
                                    {/if}
                                {/each}
                                <div
                                    class="mx-auto w-[3px] h-[20px] bg-[#68a95f]"
                                ></div>
                                <button
                                    on:click={() => {
                                        toggleModalNivel2();
                                        rule_selected = rule;
                                    }}
                                    class="flex h-[50px] rounded-md justify-center mx-auto bg-[#68a95f] hover:bg-[#d1d3de] hover:shadow-2xl transition duration-300"
                                >
                                    <div class="flex my-auto">
                                        <span
                                            class="ml-2 text-white material-symbols-outlined"
                                        >
                                            add
                                        </span>
                                        <h1 class="mx-2 text-white">
                                            Create a rule
                                        </h1>
                                    </div>
                                </button>
                            </div>
                        </div>
                    {:else}
                        <div
                            class="flex w-1/5 min-w-[120px] mx-auto rounded-lg {$themeStore ===
                            'Light'
                                ? 'bg-[#e69e3a]'
                                : 'bg-[#bf8a42]'}"
                        >
                            <div class="flex flex-col mx-auto">
                                <h1 class="mt-1 text-center text-[#e3e6fb]">
                                    Logical Operator
                                </h1>
                                <select
                                    bind:value={rule.logical_operator}
                                    id="actions"
                                    class="my-2 w-2/3 mx-auto h-[30px]"
                                    on:change={(e) =>
                                        conectorRuleSelected(e, rule)}
                                >
                                    {#each rule.logicals ?? [] as action}
                                        <option value={action}>{action}</option>
                                    {/each}
                                </select>
                            </div>
                        </div>
                    {/if}
                {/each}
                <div class="mx-auto w-[3px] h-[20px] bg-[#68a95f]"></div>
                <button
                    on:click={toggleModalNivel1}
                    class="flex h-[50px] rounded-md justify-center mx-auto bg-[#68a95f] hover:bg-[#d1d3de] hover:shadow-2xl transition duration-300"
                >
                    <div class="flex my-auto">
                        <span class="ml-2 text-white material-symbols-outlined">
                            add
                        </span>
                        <h1 class="mx-2 text-white">Create a rule</h1>
                    </div>
                </button>
            </div>
            <!-- Pizarra donde estará la configuración de reglas -->
            <div
                class="h-[570px] mx-10 w-1/4 rounded-md flex flex-col {$themeStore ===
                'Light'
                    ? 'bg-[#ffffff]'
                    : 'bg-[#201f2b]'}"
            >
                <h1
                    class="text-lg font-bold mt-10 mx-auto {$themeStore ===
                    'Light'
                        ? 'text-[#14111b]'
                        : 'text-[#eaeef5]'}"
                >
                    What will these rules do?
                </h1>
                <select
                    bind:value={selectedAction1}
                    id="actions"
                    class="mt-5 w-1/2 mx-auto h-[30px]"
                >
                    {#each actions as action}
                        <option value={action}>{action}</option>
                    {/each}
                </select>
                <h1 class="text-md text-[#898c95] mt-3 mx-auto">
                    Choose an action:
                </h1>
                {#if selectedAction1 === "Delete Action"}
                    <select
                        bind:value={selectedAction2}
                        id="actions"
                        class="mt-5 w-1/2 mx-auto h-[30px]"
                    >
                        {#each deleteaction as action}
                            <option value={action}>{action}</option>
                        {/each}
                    </select>
                {/if}
                {#if selectedAction1 === "Replace Action"}
                    <select
                        bind:value={selectedAction2}
                        id="actions"
                        class="mt-5 w-1/2 mx-auto h-[30px]"
                    >
                        {#each replaceaction as action}
                            <option value={action}>{action}</option>
                        {/each}
                    </select>
                {/if}
                <h1
                    class="text-lg font-bold mt-12 mx-auto {$themeStore ===
                    'Light'
                        ? 'text-[#14111b]'
                        : 'text-[#eaeef5]'}"
                >
                    Rules Actions
                </h1>
                <button
                    class="text-sm h-[50px] w-1/2 mx-auto rounded-xl mt-10 {$themeStore ===
                    'Light'
                        ? 'bg-[#4474f5] text-[#ffffff]'
                        : 'border border-[#8973ae] text-[#8973ae] bg-[#251835]'}"
                    on:click={() => {
                        showModal = true;
                        showModalCrear = true;
                    }}
                >
                    <div
                        class="flex text-center items-center justify-center my-auto"
                    >
                        <span class="material-symbols-outlined">check_box</span>
                        <h1 class="ml-5">Save rule</h1>
                    </div>
                </button>
                <button
                    class="text-sm h-[50px] w-1/2 mx-auto rounded-xl mt-5 {$themeStore ===
                    'Light'
                        ? 'bg-[#ce4f2c] text-[#ffffff]'
                        : 'border border-[#8e3b33] text-[#8e3b33] bg-[#42201b]'}"
                    on:click={() => {
                        toggleModalEliminar();
                    }}
                >
                    <div
                        class="flex text-center items-center justify-center my-auto"
                    >
                        <span class="material-symbols-outlined"
                            >cleaning_services</span
                        >
                        <h1 class="ml-5">Delete rule</h1>
                    </div>
                </button>
            </div>
        </div>
    </div>
</div>

<!-- Modal Nivel 1-->
{#if showModalNivel1}
    <div
        class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
    >
        <div
            class="relative border rounded-lg shadow-lg p-8 w-1/2 {$themeStore ===
            'Light'
                ? 'bg-[#ffffff] border-[#f0eaf9] shadow-[0_0_30px_#f0eaf9]'
                : 'bg-[#14111c] border-[#31214c] shadow-[0_0_30px_#31214c]'}"
        >
            <button
                on:click={toggleModalNivel1}
                class="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
                <svg
                    class="fill-current h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                >
                    <path
                        d="M10 8.586l4.293-4.293 1.414 1.414L11.414 10l4.293 4.293-1.414 1.414L10 11.414l-4.293 4.293-1.414-1.414L8.586 10 4.293 5.707l1.414-1.414L10 8.586z"
                    />
                </svg>
            </button>
            <div class="flex flex-col">
                <h2
                    class="mx-auto text-4xl font-bold mb-4 {$themeStore ===
                    'Light'
                        ? 'text-[#14111b]'
                        : 'text-[#b498df]'}"
                >
                    Rule Creation
                </h2>
                <p
                    class="mx-auto mt-5 text-sm {$themeStore === 'Light'
                        ? 'text-[#14111b]'
                        : 'text-[#b498df]'}"
                >
                    Select a rule type.
                </p>
                <div class="mt-5 flex">
                    <button
                        class="flex shadow-md flex-col h-[450px] mr-2 w-1/2 rounded-2xl hover:shadow-2xl border {$themeStore ===
                        'Light'
                            ? 'bg-[#efe9f8] border-[#5e3fa1] text-[#5e3fa1] hover:shadow-[0_0_2px_#7443bf]'
                            : 'bg-[#251835] border border-[#7443bf] text-[#7443bf] hover:shadow-[0_0_2px_#5e3fa1]'} transition duration-300"
                        on:click={() => {
                            addSimpleRule();
                            showModalNivel1 = false;
                            showModal = false;
                        }}
                    >
                        <h1 class="mt-2 mx-auto text-xl font-bold">
                            Condition Simple
                        </h1>

                        <h1 class="mt-10 text-sm">
                            <strong>Symbol &nbsp;</strong>This rule is
                            represented by the symbol
                        </h1>

                        <h1 class="mt-10 text-sm">
                            <strong>Graphic example &nbsp;</strong>
                        </h1>
                        <div
                            class="flex w-2/3 bg-[#9da1f6] h-[70px] mt-2 mx-auto rounded-lg"
                        >
                            <select
                                bind:value={selectedAction}
                                id="actions"
                                class="mt-5 w-1/2 mx-2 h-[30px]"
                                disabled
                            >
                                {#each actions as action}
                                    <option value={action}>{action}</option>
                                {/each}
                            </select>
                            <select
                                bind:value={selectedAction}
                                id="actions"
                                class="mt-5 w-1/2 mx-2 h-[30px]"
                                disabled
                            >
                                {#each actions as action}
                                    <option value={action}>{action}</option>
                                {/each}
                            </select>
                        </div>
                    </button>
                    <button
                        class="flex shadow-md flex-col h-[450px] mr-2 w-1/2 rounded-2xl hover:shadow-2xl {$themeStore ===
                        'Light'
                            ? 'bg-[#efe9f8] border-[#5e3fa1] text-[#5e3fa1] hover:shadow-[0_0_2px_#7443bf]'
                            : 'bg-[#251835] border border-[#7443bf] text-[#7443bf] hover:shadow-[0_0_2px_#5e3fa1]'} transition duration-300"
                        on:click={() => {
                            addComplexRule();
                            showModalNivel1 = false;
                            showModal = false;
                        }}
                    >
                        <h1 class="mt-2 mx-auto text-xl font-bold">
                            Condition Complex
                        </h1>

                        <h1 class="mt-10 text-sm">
                            <strong>Symbol &nbsp;</strong>This rule is
                            represented by the symbol
                        </h1>
                        <h1 class="mt-10 text-sm">
                            <strong>Graphic example &nbsp;</strong>
                        </h1>
                        <div
                            class="flex flex-col w-2/3 bg-[#955af2] h-[230px] mt-2 mx-auto rounded-lg"
                        >
                            <div
                                class="flex w-2/3 bg-[#9da1f6] h-[70px] mt-2 mx-auto rounded-lg"
                            >
                                <select
                                    bind:value={selectedAction}
                                    id="actions"
                                    class="mt-5 w-1/2 mx-2 h-[30px]"
                                    disabled
                                >
                                    {#each actions as action}
                                        <option value={action}>{action}</option>
                                    {/each}
                                </select>
                                <select
                                    bind:value={selectedAction}
                                    id="actions"
                                    class="mt-5 w-1/2 mx-2 h-[30px]"
                                    disabled
                                >
                                    {#each actions as action}
                                        <option value={action}>{action}</option>
                                    {/each}
                                </select>
                            </div>
                            <div
                                class="flex w-1/3 bg-[#e69e3a] h-[70px] mx-auto rounded-lg"
                            >
                                <select
                                    bind:value={selectedAction}
                                    id="actions"
                                    class="mt-5 w-2/3 mx-auto h-[30px]"
                                    disabled
                                >
                                    {#each actions as action}
                                        <option value={action}>{action}</option>
                                    {/each}
                                </select>
                            </div>
                            <div
                                class="flex w-2/3 bg-[#9da1f6] h-[70px] mx-auto rounded-lg"
                            >
                                <select
                                    bind:value={selectedAction}
                                    id="actions"
                                    class="mt-5 w-1/2 mx-2 h-[30px]"
                                    disabled
                                >
                                    {#each actions as action}
                                        <option value={action}>{action}</option>
                                    {/each}
                                </select>
                                <select
                                    bind:value={selectedAction}
                                    id="actions"
                                    class="mt-5 w-1/2 mx-2 h-[30px]"
                                    disabled
                                >
                                    {#each actions as action}
                                        <option value={action}>{action}</option>
                                    {/each}
                                </select>
                            </div>
                        </div>
                    </button>
                </div>
                <button
                    on:click={toggleModalNivel1}
                    class="mt-4 px-4 py-2 bg-[#ce4f2c] text-white rounded-lg"
                    ><div
                        class="flex text-center items-center justify-center my-auto"
                    >
                        <span class="material-symbols-outlined text-white">
                            cancel
                        </span>
                        <h1 class="ml-5 text-white">Close</h1>
                    </div></button
                >
            </div>
        </div>
    </div>
{/if}

<!-- Modal nivel 2-->
{#if showModalNivel2}
    <div
        class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
    >
        <div
            class="relative border rounded-lg shadow-lg p-8 w-1/2 {$themeStore ===
            'Light'
                ? 'bg-[#ffffff] border-[#f0eaf9] shadow-[0_0_30px_#f0eaf9]'
                : 'bg-[#14111c] border-[#31214c] shadow-[0_0_30px_#31214c]'}"
        >
            <button
                on:click={toggleModalNivel2}
                class="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
                <svg
                    class="fill-current h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                >
                    <path
                        d="M10 8.586l4.293-4.293 1.414 1.414L11.414 10l4.293 4.293-1.414 1.414L10 11.414l-4.293 4.293-1.414-1.414L8.586 10 4.293 5.707l1.414-1.414L10 8.586z"
                    />
                </svg>
            </button>
            <div class="flex flex-col">
                <h2
                    class="mx-auto text-4xl font-bold mb-4 {$themeStore ===
                    'Light'
                        ? 'text-[#14111b]'
                        : 'text-[#b498df]'}"
                >
                    Rule Creation
                </h2>
                <p
                    class="mx-auto mt-5 text-sm {$themeStore === 'Light'
                        ? 'text-[#14111b]'
                        : 'text-[#b498df]'}"
                >
                    Select a rule type.
                </p>
                <div class="mt-5 flex">
                    <button
                        class="flex shadow-md flex-col h-[450px] mr-2 w-1/2 rounded-2xl hover:shadow-2xl border {$themeStore ===
                        'Light'
                            ? 'bg-[#efe9f8] border-[#5e3fa1] text-[#5e3fa1] hover:shadow-[0_0_2px_#7443bf]'
                            : 'bg-[#251835] border border-[#7443bf] text-[#7443bf] hover:shadow-[0_0_2px_#5e3fa1]'} transition duration-300"
                        on:click={() => {
                            addSimpleRule(rule_selected.id);
                            showModal = false;
                            showModalNivel2 = false;
                        }}
                    >
                        <h1 class="mt-2 mx-auto text-xl font-bold">
                            Condition Simple
                        </h1>

                        <h1 class="mt-10 text-sm">
                            <strong>Symbol &nbsp;</strong>This rule is
                            represented by the symbol
                        </h1>

                        <h1 class="mt-10 text-sm">
                            <strong>Graphic example &nbsp;</strong>
                        </h1>
                        <div
                            class="flex w-2/3 bg-[#9da1f6] h-[70px] mt-2 mx-auto rounded-lg"
                        >
                            <select
                                bind:value={selectedAction}
                                id="actions"
                                class="mt-5 w-1/2 mx-2 h-[30px]"
                                disabled
                            >
                                {#each actions as action}
                                    <option value={action}>{action}</option>
                                {/each}
                            </select>
                            <select
                                bind:value={selectedAction}
                                id="actions"
                                class="mt-5 w-1/2 mx-2 h-[30px]"
                                disabled
                            >
                                {#each actions as action}
                                    <option value={action}>{action}</option>
                                {/each}
                            </select>
                        </div>
                    </button>
                    <button
                        class="flex shadow-md flex-col h-[450px] mr-2 w-1/2 rounded-2xl hover:shadow-2xl border {$themeStore ===
                        'Light'
                            ? 'bg-[#efe9f8] border-[#5e3fa1] text-[#5e3fa1] hover:shadow-[0_0_2px_#7443bf]'
                            : 'bg-[#251835] border border-[#7443bf] text-[#7443bf] hover:shadow-[0_0_2px_#5e3fa1]'} transition duration-300"
                        on:click={() => {
                            addComplexRule(rule_selected.id);
                            showModal = false;
                            showModalNivel2 = false;
                        }}
                    >
                        <h1 class="mt-2 mx-auto text-xl font-bold">
                            Condition Complex
                        </h1>

                        <h1 class="mt-10 text-sm">
                            <strong>Symbol &nbsp;</strong>This rule is
                            represented by the symbol
                        </h1>
                        <h1 class="mt-10 text-sm">
                            <strong>Graphic example &nbsp;</strong>
                        </h1>
                        <div
                            class="flex flex-col w-2/3 bg-[#955af2] h-[230px] mt-2 mx-auto rounded-lg"
                        >
                            <div
                                class="flex w-2/3 bg-[#9da1f6] h-[70px] mt-2 mx-auto rounded-lg"
                            >
                                <select
                                    bind:value={selectedAction}
                                    id="actions"
                                    class="mt-5 w-1/2 mx-2 h-[30px]"
                                    disabled
                                >
                                    {#each actions as action}
                                        <option value={action}>{action}</option>
                                    {/each}
                                </select>
                                <select
                                    bind:value={selectedAction}
                                    id="actions"
                                    class="mt-5 w-1/2 mx-2 h-[30px]"
                                    disabled
                                >
                                    {#each actions as action}
                                        <option value={action}>{action}</option>
                                    {/each}
                                </select>
                            </div>
                            <div
                                class="flex w-1/3 bg-[#e69e3a] h-[70px] mx-auto rounded-lg"
                            >
                                <select
                                    bind:value={selectedAction}
                                    id="actions"
                                    class="mt-5 w-2/3 mx-auto h-[30px]"
                                    disabled
                                >
                                    {#each actions as action}
                                        <option value={action}>{action}</option>
                                    {/each}
                                </select>
                            </div>
                            <div
                                class="flex w-2/3 bg-[#9da1f6] h-[70px] mx-auto rounded-lg"
                            >
                                <select
                                    bind:value={selectedAction}
                                    id="actions"
                                    class="mt-5 w-1/2 mx-2 h-[30px]"
                                    disabled
                                >
                                    {#each actions as action}
                                        <option value={action}>{action}</option>
                                    {/each}
                                </select>
                                <select
                                    bind:value={selectedAction}
                                    id="actions"
                                    class="mt-5 w-1/2 mx-2 h-[30px]"
                                    disabled
                                >
                                    {#each actions as action}
                                        <option value={action}>{action}</option>
                                    {/each}
                                </select>
                            </div>
                        </div>
                    </button>
                </div>
                <button
                    on:click={toggleModalNivel2}
                    class="mt-4 px-4 py-2 bg-[#ce4f2c] text-white rounded-lg"
                    ><div
                        class="flex text-center items-center justify-center my-auto"
                    >
                        <span class="material-symbols-outlined text-white">
                            cancel
                        </span>
                        <h1 class="ml-5 text-white">Close</h1>
                    </div></button
                >
            </div>
        </div>
    </div>
{/if}
<!-- Modal Nivel 3-->
{#if showModalNivel3}
    <div
        class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
    >
        <div
            class="relative border rounded-lg shadow-lg p-8 w-1/2 {$themeStore ===
            'Light'
                ? 'bg-[#ffffff] border-[#f0eaf9] shadow-[0_0_30px_#f0eaf9]'
                : 'bg-[#14111c] border-[#31214c] shadow-[0_0_30px_#31214c]'}"
        >
            <button
                on:click={toggleModalNivel3}
                class="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
                <svg
                    class="fill-current h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                >
                    <path
                        d="M10 8.586l4.293-4.293 1.414 1.414L11.414 10l4.293 4.293-1.414 1.414L10 11.414l-4.293 4.293-1.414-1.414L8.586 10 4.293 5.707l1.414-1.414L10 8.586z"
                    />
                </svg>
            </button>
            <div class="flex flex-col">
                <h2
                    class="mx-auto text-4xl font-bold mb-4 {$themeStore ===
                    'Light'
                        ? 'text-[#14111b]'
                        : 'text-[#b498df]'}"
                >
                    Rule Creation
                </h2>
                <p
                    class="mx-auto mt-5 text-sm {$themeStore === 'Light'
                        ? 'text-[#14111b]'
                        : 'text-[#b498df]'}"
                >
                    Select a rule type.
                </p>
                <div class="mt-5 flex mx-auto justify-center w-3/4">
                    <button
                        class="flex shadow-md flex-col h-[450px] rounded-2xl hover:shadow-2xl border {$themeStore ===
                        'Light'
                            ? 'bg-[#efe9f8] border-[#5e3fa1] text-[#5e3fa1] hover:shadow-[0_0_2px_#7443bf]'
                            : 'bg-[#251835] border border-[#7443bf] text-[#7443bf] hover:shadow-[0_0_2px_#5e3fa1]'} transition duration-300"
                        on:click={() => {
                            addSimpleRule(
                                subrule_selected.id,
                                rule_selected.id,
                            );
                            showModal = false;
                            showModalNivel3 = false;
                        }}
                    >
                        <h1 class="mt-2 mx-auto text-xl font-bold">
                            Condition Simple
                        </h1>

                        <h1 class="mt-10 text-sm">
                            <strong>Symbol &nbsp;</strong>This rule is
                            represented by the symbol
                        </h1>

                        <h1 class="mt-10 text-sm">
                            <strong>Graphic example &nbsp;</strong>
                        </h1>
                        <div
                            class="flex w-2/3 bg-[#9da1f6] h-[70px] mt-2 mx-auto rounded-lg"
                        >
                            <select
                                bind:value={selectedAction}
                                id="actions"
                                class="mt-5 w-1/2 mx-2 h-[30px]"
                                disabled
                            >
                                {#each actions as action}
                                    <option value={action}>{action}</option>
                                {/each}
                            </select>
                            <select
                                bind:value={selectedAction}
                                id="actions"
                                class="mt-5 w-1/2 mx-2 h-[30px]"
                                disabled
                            >
                                {#each actions as action}
                                    <option value={action}>{action}</option>
                                {/each}
                            </select>
                        </div>
                    </button>
                </div>
                <button
                    on:click={toggleModalNivel3}
                    class="mt-4 px-4 py-2 bg-[#ce4f2c] text-white rounded-lg"
                    ><div
                        class="flex text-center items-center justify-center my-auto"
                    >
                        <span class="material-symbols-outlined text-white">
                            cancel
                        </span>
                        <h1 class="ml-5 text-white">Close</h1>
                    </div></button
                >
            </div>
        </div>
    </div>
{/if}
<!-- Modal confirmacion para crear las reglas-->
{#if showModalCrear}
    <div
        class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
    >
        <div
            class="relative border rounded-lg shadow-lg p-8 w-1/3 {$themeStore ===
            'Light'
                ? 'bg-[#ffffff] border-[#f0eaf9] shadow-[0_0_30px_#f0eaf9]'
                : 'bg-[#14111c] border-[#31214c] shadow-[0_0_30px_#31214c]'}"
        >
            <button
                on:click={toggleModalCrear}
                class="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
                <svg
                    class="fill-current h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                >
                    <path
                        d="M10 8.586l4.293-4.293 1.414 1.414L11.414 10l4.293 4.293-1.414 1.414L10 11.414l-4.293 4.293-1.414-1.414L8.586 10 4.293 5.707l1.414-1.414L10 8.586z"
                    />
                </svg>
            </button>
            <div class="flex flex-col">
                <h2
                    class="mx-auto text-center text-4xl font-bold mb-4 {$themeStore ===
                    'Light'
                        ? 'text-[#14111b]'
                        : 'text-[#b498df]'}"
                >
                    Do you want to save the rule?
                </h2>
                <p
                    class="mx-auto text-center mt-5 text-sm {$themeStore ===
                    'Light'
                        ? 'text-[#14111b]'
                        : 'text-[#b498df]'}"
                >
                    Make sure you are not missing anything or that you have
                    chosen the wrong activity
                </p>
                <div class="mt-10 flex">
                    <button
                        class="flex shadow-md flex-col h-[50px] mx-2 w-1/2 rounded-2xl hover:shadow-2xl border {$themeStore ===
                        'Light'
                            ? 'bg-[#efe9f8] border-[#5e3fa1] text-[#5e3fa1] hover:shadow-[0_0_2px_#7443bf]'
                            : 'bg-[#251835] border border-[#7443bf] text-[#7443bf] hover:shadow-[0_0_2px_#5e3fa1]'} transition duration-300"
                        on:click={() => {
                            showModal = false;
                            showModalCrear = false;
                            addRulesLocalStorage();
                            goto("/listofrules");
                        }}
                    >
                        <div class="flex flex-row my-auto">
                            <span
                                class="my-auto mx-2 material-symbols-outlined"
                            >
                                check
                            </span>
                            <h1 class="my-auto mr-2 text-sm font-bold">
                                Yes, I want to save the rule
                            </h1>
                        </div>
                    </button>
                    <button
                        class="flex shadow-md flex-col h-[50px] mx-2 w-1/2 rounded-2xl hover:shadow-2xl border {$themeStore ===
                        'Light'
                            ? 'bg-[#efe9f8] border-[#5e3fa1] text-[#5e3fa1] hover:shadow-[0_0_2px_#7443bf]'
                            : 'bg-[#251835] border border-[#7443bf] text-[#7443bf] hover:shadow-[0_0_2px_#5e3fa1]'} transition duration-300"
                        on:click={() => {
                            showModal = false;
                            showModalCrear = false;
                        }}
                    >
                        <div class="flex flex-row my-auto">
                            <span
                                class="my-auto mx-2 material-symbols-outlined"
                            >
                                block
                            </span>
                            <h1 class="my-auto mr-2 text-sm font-bold">
                                No, I don't want to save it yet
                            </h1>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    </div>
{/if}

<!-- Modal -->
{#if showModalEliminar}
    <div
        class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
    >
        <div
            class="relative border rounded-lg shadow-lg p-8 w-1/2 {$themeStore ===
            'Light'
                ? 'bg-[#ffffff] border-[#f0eaf9] shadow-[0_0_30px_#f0eaf9]'
                : 'bg-[#14111c] border-[#31214c] shadow-[0_0_30px_#31214c]'}"
        >
            <h1
                class="text-lg font-bold mb-4 {$themeStore === 'Light'
                    ? 'text-[#14111b]'
                    : 'text-[#b498df]'}"
            >
                Are you sure you want to delete all activities?
            </h1>
            <div class="flex justify-end">
                <button
                    class="border rounded-md px-4 py-2 mr-2 {$themeStore ===
                    'Light'
                        ? 'bg-[#efe9f8] border-[#5e3fa1] text-[#5e3fa1] hover:shadow-[0_0_2px_#7443bf]'
                        : 'bg-[#251835] border border-[#7443bf] text-[#7443bf] hover:shadow-[0_0_2px_#5e3fa1]'} transition duration-300"
                    on:click={() => (showModal = false)}>Cancel</button
                >
                <button
                    class="border rounded-md px-4 py-2 bg-red-500 text-white {$themeStore ===
                    'Light'
                        ? 'bg-[#efe9f8] border-[#5e3fa1] text-[#5e3fa1] hover:shadow-[0_0_2px_#7443bf]'
                        : 'bg-[#251835] border border-[#7443bf] text-[#7443bf] hover:shadow-[0_0_2px_#5e3fa1]'} transition duration-300"
                    on:click={() => {
                        clearAllRules();
                        showModal = false;
                        showModalEliminar = false;
                        goto("/listofrules");
                    }}>Delete</button
                >
            </div>
        </div>
    </div>
{/if}

<style>
    .parallax-bg {
        background-image: radial-gradient(circle, #5b5967 1px, transparent 1px);
        background-size: 10px 10px;
        background-attachment: local;
    }
</style>
