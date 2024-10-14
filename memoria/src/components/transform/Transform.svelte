<script lang="ts">
    import { themeStore } from "../../stores";
    import "../../functions/datamanager";
    import { enhance } from "$app/forms";
    import {
        setDataContext,
        setDataProcess,
    } from "../../functions/datamanager";
    import LoaderView from "../../routes/loader.svelte";
    export let successTransform = false;
    let loading = false;

    function saveDataCreated(xmiContext: any, xmiProcess: any) {
        setDataContext(xmiContext);
        setDataProcess(xmiProcess);
    }
</script>

{#if loading}
    <LoaderView />
{/if}
<form
    method="POST"
    action="?/submit"
    use:enhance={() => {
        loading = true;
        return async ({ update, result }) => {
            update({ reset: false });
            if (result.type === "success" && result.data) {
                saveDataCreated(result.data.context, result.data.process);
                successTransform = true;
            } else {
                console.error(
                    "No se pudieron extraer los datos del resultado.",
                    result,
                );
            }
            loading = false;
        };
    }}
>
    <button
        class="font-bold border rounded-md p-2 hover:shadow-2xl transition duration-300 {$themeStore ===
        'Light'
            ? 'border-[#855dc7] bg-[#f1e9f9] text-[#855dc7]'
            : 'border-[#6d44ba] bg-[#231833] text-[#6d44ba]'}"
    >
        <div class="flex my-auto">
            <h1 class="my-auto text-sm mx-2">Next Stage</h1>
            <span class="material-symbols-outlined text-lg ml-1">
                arrow_forward_ios
            </span>
        </div>
    </button>
</form>
