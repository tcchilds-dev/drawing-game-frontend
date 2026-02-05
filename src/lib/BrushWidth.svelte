<script lang="ts">
    interface Props {
        size?: number;
    }

    let { size = $bindable(8) }: Props = $props();

    const sizes = [
        { label: "XS", value: 4 },
        { label: "S", value: 8 },
        { label: "M", value: 16 },
        { label: "L", value: 24 },
        { label: "XL", value: 32 },
    ];
</script>

<select class="select select-sm w-28" bind:value={size}>
    {#each sizes as s}
        <option value={s.value}>{s.label} ({s.value}px)</option>
    {/each}
</select>
