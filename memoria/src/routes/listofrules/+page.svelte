<script lang="ts">
    // Importaciones de módulos
    import "../../app.css";
    import { goto } from "$app/navigation";
    import { themeStore } from "../../stores";
    import "../types";
    import { onMount } from "svelte";
    import { writable, type Writable } from "svelte/store";
    import { fileUploadBpmn} from "../../functions/importdata";

    // Variables
    let searchQuery = "";
    let actividades: Writable<activity[]> = writable([]);
    let nombre_actividades = writable<String[]>([]);
    let showModal = false;
    let showModalCrear = false;
    let showModalEditar = false;
    let idactividad_eliminar: number;
    let idactividad_editar: number;
    let nombre_actividad_crear: String;
    let subnombre_actividad_crear: String;
    let subnombre_actividad_editar: String;

    // cuando montamos la pagina recolectamos los datos y los guardamos en el store
    onMount(async () => {
        // Verificamos si taskNames existe en el localStorage
        var taskLocalStorage = localStorage.getItem("taskNames")!;
        console.log(taskLocalStorage);
        if (taskLocalStorage != null) {
            const jsonTask = JSON.parse(taskLocalStorage);
            console.log(jsonTask);
            // Ahora igualamos taskNames con jsonTask
            actividades.set(jsonTask);
            // Extraemos solo los nombres de las actividades(sin que se repitan)
            saveNamesActivities();
        } else {
            console.log("No hay actividades");
            await loadDataBPMN();
        }
    });

    // Función para manejar la carga de archivos BPMN
    async function loadDataBPMN() {
        // Extraemos los datos el archivo BPMN
        const xmlBpmn:string = localStorage.getItem("xmlBpmn")!;
        var task = await fileUploadBpmn(xmlBpmn);
        // Los convertimos a un objeto JSON para manejarlos de mejor forma, dandole un id a cada actividad, subnombre y reglas (que por ahora estan vacias)
        var id: number = 0;
        var taskConverted: activity[] = task.map((task: any) => {
            return {
                id: id++,
                name: task,
                subname: "Task: " + task,
                rules: [],
            };
        });
        // Guardar las actividades convertidas
        actividades.set(taskConverted);
        // Almacenar en el localStorage
        localStorage.setItem("taskNames", JSON.stringify(taskConverted));
        // Extraemos solo los nombres de las actividades(sin que se repitan), esto es para agrupar las reglas de las actividades
        const uniqueTaskNames = taskConverted.filter(
            (value: any, index: any, self: any) =>
                self.indexOf(value) === index,
        );
        nombre_actividades.set(uniqueTaskNames.map(task => task.name));
        console.log(uniqueTaskNames);
    }

    // Función para guardar los nombres de las actividades
    function saveNamesActivities() {
        const actividades_json = JSON.parse(localStorage.getItem("taskNames")!);
        // Extraemos solo los nombres de las actividades(sin que se repitan)
        const uniqueTaskNames = actividades_json
            .map((task: { name: any }) => task.name)
            .filter(
                (value: any, index: any, self: any) =>
                    self.indexOf(value) === index,
            );
        nombre_actividades.set(uniqueTaskNames);
        console.log(uniqueTaskNames);
    }

    // Filtrar actividades
    $: filteredActivities = $nombre_actividades.filter((activity) =>
        activity.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    function clearRulesById(taskId: number): void {
        var tasks = JSON.parse(localStorage.getItem("taskNames")!);
        tasks.forEach((task: any) => {
            if (task.id === taskId) {
                task.rules = [];
                task.replaceActivity = undefined;
                task.deleted = undefined;
                task.replaced = undefined;
            }
        });
        localStorage.setItem("taskNames", JSON.stringify(tasks));
        actividades.set(tasks);
    }

    function createRuleActivity() {
        var tasks = JSON.parse(localStorage.getItem("taskNames")!);
        // Objetenemos el ultimo id de las actividades
        var lastId = tasks[tasks.length - 1].id;
        // Creamos la regla
        var newRule = {
            id: lastId + 1,
            name: nombre_actividad_crear,
            subname: subnombre_actividad_crear,
            rules: [],
        };
        tasks.push(newRule);
        localStorage.setItem("taskNames", JSON.stringify(tasks));
        actividades.set(tasks);
    }

    function editRuleActivity() {
        var tasks = JSON.parse(localStorage.getItem("taskNames")!);
        tasks.forEach((task: any) => {
            if (task.id === idactividad_editar) {
                task.subname = subnombre_actividad_editar;
            }
        });
        localStorage.setItem("taskNames", JSON.stringify(tasks));
        actividades.set(tasks);
    }
</script>

<div class="flex flex-col h-full w-full">
    <h1
        class="flex mt-3 mb-2 mx-auto text-4xl font-bold {$themeStore ===
        'Light'
            ? 'text-[#454753]'
            : 'text-[#e7ebf1]'}"
    >
        <strong class="text-[#7442c0]">Stage 2: &nbsp;</strong> Defining rules
    </h1>
    <div
        class="mx-auto w-2/3 mt-10 flex flex-col rounded-lg shadow-lg {$themeStore ===
        'Light'
            ? 'bg-[#ffffff] border-[#f0eaf9] shadow-[0_0_30px_#f0eaf9]'
            : 'bg-[#14111c] border-[#31214c] shadow-[0_0_30px_#31214c]'} transition duration-300"
    >
        <!-- Buscador -->
        <input
            type="text"
            bind:value={searchQuery}
            placeholder="     Search by activity..."
            class="text-[#6f40b8] mx-auto mt-5 h-[50px] w-3/4 rounded-tl-lg rounded-tr-lg border {$themeStore ===
            'Light'
                ? 'border-[#875fc7] bg-[#ffffff]'
                : 'border-[#462a72] bg-[#14111b]'}"
        />
        <!-- Tabla donde estaran las actividades -->
        <div
            class="w-3/4 h-[400px] mb-5 overflow-y-auto mx-auto rounded-bl-lg rounded-br-lg border-r border-l border-b {$themeStore ===
            'Light'
                ? 'border-[#875fc7] bg-[#ffffff]'
                : 'border-[#462a72] bg-[#14111b]'}"
        >
            <div
                class="mx-10 rounded-md flex flex-col font-bold p-2 text-[#7546c1]"
            >
                <div class="flex flex-row justify-between">
                    <div class="flex mx-10">
                        <span class="material-symbols-outlined">
                            deployed_code
                        </span>
                        <h1 class="my-auto">Activity</h1>
                    </div>
                    <div class="flex mx-10">
                        <span class="material-symbols-outlined"> gavel </span>
                        <h1 class="my-auto">Rule</h1>
                    </div>
                </div>
                <div
                    class="w-full mx-auto mt-2 h-[2px] my-auto bg-[#7546c1]"
                ></div>
            </div>
            <div class="text-center">
                {#each filteredActivities as nombre_actividad}
                    <!-- Tabla donde estaran las actividades listadas por nombre -->
                    <div class="flex justify-between mt-3">
                        <h1
                            class="mx-10 font-bold text-lg {$themeStore ===
                            'Light'
                                ? 'text-[#855dc7]'
                                : 'text-[#6d44ba]'}"
                        >
                            {nombre_actividad}
                        </h1>
                        <button
                            class="border rounded-md p-2 mx-10 text-sm {$themeStore ===
                            'Light'
                                ? 'border-[#855dc7] bg-[#f1e9f9] text-[#855dc7]'
                                : 'border-[#6d44ba] bg-[#231833] text-[#6d44ba]'}"
                            on:click={() => {
                                nombre_actividad_crear = nombre_actividad;
                                showModalCrear = true;
                            }}
                        >
                            Add Rule
                        </button>
                    </div>
                    {#each $actividades as activity (activity.id)}
                        {#if activity.name == nombre_actividad}
                            <div class="flex">
                                <!-- Timeline -->
                                <div class="flex-col">
                                    <div
                                        class="w-[2px] ml-12 h-[25px] bg-[#7546c1]"
                                    ></div>
                                    <div
                                        class="w-[12px] ml-[2.7rem] h-[12px] rounded-xl bg-[#7546c1]"
                                    ></div>
                                    <div
                                        class="w-[2px] ml-12 h-[25px] bg-[#7546c1]"
                                    ></div>
                                </div>
                                <!-- Las reglas que estan para esa actividad -->
                                <div
                                    class="mt-[18px] ml-2 flex-col h-full w-full"
                                >
                                    <div class="flex flex-row justify-between">
                                        <div class="text-[#7546c1]">
                                            <div class="flex">
                                                {#if activity.rules.length > 0}
                                                    <span
                                                        class="mr-2 my-auto material-symbols-outlined"
                                                    >
                                                        check_circle
                                                    </span>
                                                    <h1 class="my-auto">
                                                        {activity.subname}
                                                    </h1>
                                                    <button
                                                        class="border rounded-md mx-2 text-xs {$themeStore ===
                                                        'Light'
                                                            ? 'border-[#855dc7] bg-[#f1e9f9] text-[#855dc7]'
                                                            : 'border-[#6d44ba] bg-[#231833] text-[#6d44ba]'}"
                                                        on:click={() => {
                                                            idactividad_editar =
                                                                activity.id;
                                                            showModalEditar = true;
                                                        }}
                                                    >
                                                        <span
                                                            class="mx-auto my-auto material-symbols-outlined"
                                                        >
                                                            edit
                                                        </span>
                                                    </button>
                                                {:else}
                                                    <span
                                                        class="mr-2 my-auto material-symbols-outlined"
                                                    >
                                                        pending
                                                    </span>
                                                    <h1 class="my-auto">
                                                        {activity.subname}
                                                    </h1>
                                                    <button
                                                        class="border rounded-md mx-2 text-xs {$themeStore ===
                                                        'Light'
                                                            ? 'border-[#855dc7] bg-[#f1e9f9] text-[#855dc7]'
                                                            : 'border-[#6d44ba] bg-[#231833] text-[#6d44ba]'}"
                                                        on:click={() => {
                                                            idactividad_editar =
                                                                activity.id;
                                                            showModalEditar = true;
                                                        }}
                                                    >
                                                        <span
                                                            class="mx-auto my-auto material-symbols-outlined"
                                                        >
                                                            edit
                                                        </span>
                                                    </button>
                                                {/if}
                                            </div>
                                        </div>
                                        <div class="flex w-[300px]">
                                            {#if activity.rules.length > 0}
                                                <!-- Si la actividad tiene reglas, se muestra el boton de editar reglas -->
                                                <button
                                                    class="my-auto mx-auto mr-2 w-1/3 h-[40px] border rounded-md {$themeStore ===
                                                    'Light'
                                                        ? 'border-[#855dc7] bg-[#f1e9f9] text-[#855dc7]'
                                                        : 'border-[#6d44ba] bg-[#231833] text-[#6d44ba]'}"
                                                    on:click={() => {
                                                        localStorage.setItem(
                                                            "activitySelect",
                                                            JSON.stringify(
                                                                activity,
                                                            ),
                                                        );
                                                        goto("/createrules");
                                                    }}
                                                >
                                                    <div
                                                        class="flex mx-10 text-sm"
                                                    >
                                                        <h1 class="mx-auto">
                                                            Edit
                                                        </h1>
                                                    </div>
                                                </button>
                                                <!-- Tambien el boton de eliminar -->
                                                <button
                                                    class="my-auto mx-auto w-1/3 h-[40px] border rounded-md {$themeStore ===
                                                    'Light'
                                                        ? 'border-[#855dc7] bg-[#f1e9f9] text-[#855dc7]'
                                                        : 'border-[#6d44ba] bg-[#231833] text-[#6d44ba]'}"
                                                    on:click={() => {
                                                        idactividad_eliminar =
                                                            activity.id;
                                                        showModal = true;
                                                    }}
                                                >
                                                    <div
                                                        class="flex mx-10 text-sm"
                                                    >
                                                        <h1 class="mx-auto">
                                                            Delete
                                                        </h1>
                                                    </div>
                                                </button>
                                            {:else}
                                                <button
                                                    class="border w-4/5 h-[40px] mx-auto rounded-md text-sm {$themeStore ===
                                                    'Light'
                                                        ? 'border-[#855dc7] bg-[#f1e9f9] text-[#855dc7]'
                                                        : 'border-[#6d44ba] bg-[#231833] text-[#6d44ba]'}"
                                                    on:click={() => {
                                                        localStorage.setItem(
                                                            "activitySelect",
                                                            JSON.stringify(
                                                                activity,
                                                            ),
                                                        );
                                                        goto("/createrules");
                                                    }}
                                                >
                                                    <div class="flex mx-10">
                                                        <h1
                                                            class="my-auto mx-auto"
                                                        >
                                                            Create rule
                                                        </h1>
                                                    </div>
                                                </button>
                                            {/if}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        {/if}
                    {/each}
                {/each}
            </div>
        </div>
        <!-- Botones para seguir avanzando o no -->
        <div class="flex justify-between mx-10 mb-4">
            <button
                class="border font-bold rounded-md p-2 hover:shadow-2xl transition duration-300 {$themeStore ===
                'Light'
                    ? 'border-[#855dc7] bg-[#f1e9f9] text-[#855dc7]'
                    : 'border-[#6d44ba] bg-[#231833] text-[#6d44ba]'}"
            >
                <div class="flex my-auto">
                    <span class="material-symbols-outlined text-lg mr-1"
                        >arrow_back_ios</span
                    >
                    <h1 class="my-auto text-sm mx-2">Back Stage</h1>
                </div>
            </button>
            <button
                class="border font-bold rounded-md p-2 hover:shadow-2xl transition duration-300 {$themeStore ===
                'Light'
                    ? 'border-[#855dc7] bg-[#f1e9f9] text-[#855dc7]'
                    : 'border-[#6d44ba] bg-[#231833] text-[#6d44ba]'}"
                on:click={() => {
                    goto("/savefiles");
                }}
            >
                <div class="flex my-auto">
                    <h1 class="my-auto text-sm mx-2">Next Stage</h1>
                    <span class="material-symbols-outlined text-lg ml-1"
                        >arrow_forward_ios</span
                    >
                </div>
            </button>
        </div>
    </div>
</div>

<!-- Modal para eliminar las reglas de una actividad -->
{#if showModal}
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
                Are you sure you want to delete everything from this activity?
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
                        clearRulesById(idactividad_eliminar);
                        showModal = false;
                    }}>Delete</button
                >
            </div>
        </div>
    </div>
{/if}

<!-- Modal para agregar una regla a una actividad -->
{#if showModalCrear}
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
                class="text-2xl text-center font-bold mb-4 {$themeStore ===
                'Light'
                    ? 'text-[#14111b]'
                    : 'text-[#b498df]'}"
            >
                Create a rule for an activity
            </h1>
            <input
                bind:value={subnombre_actividad_crear}
                class="text-[#6f40b8] mx-auto mb-5 h-[50px] w-full rounded-lg border {$themeStore ===
                'Light'
                    ? 'border-[#875fc7] bg-[#ffffff]'
                    : 'border-[#462a72] bg-[#14111b]'}"
                type="text"
                placeholder="  Enter rule name"
            />
            <div class="flex justify-end">
                <button
                    class=" rounded-md px-4 py-2 mr-2 bg-red-500 text-white transition duration-300"
                    on:click={() => (showModalCrear = false)}>Cancel</button
                >
                <button
                    class="border rounded-md px-4 py-2{$themeStore === 'Light'
                        ? 'bg-[#4474f5] text-[#ffffff]'
                        : 'border border-[#8973ae] text-[#8973ae] bg-[#251835]'} transition duration-300"
                    on:click={() => {
                        createRuleActivity();
                        subnombre_actividad_crear = "";
                        showModalCrear = false;
                    }}>Crear regla</button
                >
            </div>
        </div>
    </div>
{/if}

<!-- Modal para editar el nombre de una regla perteneciente a una actividad -->
{#if showModalEditar}
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
                class="text-2xl text-center font-bold mb-4 {$themeStore ===
                'Light'
                    ? 'text-[#14111b]'
                    : 'text-[#b498df]'}"
            >
                Edit rule name
            </h1>
            <input
                bind:value={subnombre_actividad_editar}
                class="text-[#6f40b8] mx-auto mb-5 h-[50px] w-full rounded-lg border {$themeStore ===
                'Light'
                    ? 'border-[#875fc7] bg-[#ffffff]'
                    : 'border-[#462a72] bg-[#14111b]'}"
                type="text"
                placeholder="  Enter rule name"
            />
            <div class="flex justify-end">
                <button
                    class=" rounded-md px-4 py-2 mr-2 bg-red-500 text-white transition duration-300"
                    on:click={() => (showModalEditar = false)}>Cancel</button
                >
                <button
                    class="border rounded-md px-4 py-2{$themeStore === 'Light'
                        ? 'bg-[#4474f5] text-[#ffffff]'
                        : 'border border-[#8973ae] text-[#8973ae] bg-[#251835]'} transition duration-300"
                    on:click={() => {
                        editRuleActivity();
                        subnombre_actividad_crear = "";
                        showModalEditar = false;
                    }}>Editar nombre</button
                >
            </div>
        </div>
    </div>
{/if}
