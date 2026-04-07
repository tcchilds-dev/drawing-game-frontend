<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLButtonAttributes } from "svelte/elements";

    type Variant =
        | "submit"
        | "leave"
        | "create"
        | "join"
        | "start"
        | "upvote"
        | "word"
        | "clear"
        | "undo";

    interface Props extends HTMLButtonAttributes {
        variant: Variant;
        children: Snippet;
    }

    const variantClasses: Record<Variant, string> = {
        submit: "btn btn-success join-item",
        leave: "btn btn-error w-full",
        create: "btn btn-warning",
        join: "btn btn-success",
        start: "btn btn-success",
        upvote: "btn btn-success",
        word: "btn btn-primary !text-white",
        clear: "btn btn-neutral",
        undo: "btn btn-neutral",
    };

    let { variant, children, ...rest }: Props = $props();
</script>

<button class={variantClasses[variant]} {...rest}>
    {@render children()}
</button>
