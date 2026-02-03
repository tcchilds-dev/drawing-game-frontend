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
        submit: "btn btn-soft btn-success join-item",
        leave: "btn btn-wide align-bottom",
        create: "btn btn-soft btn-warning",
        join: "btn btn-soft btn-success",
        start: "btn btn-soft btn-success",
        upvote: "btn btn-success",
        word: "btn btn-primary",
        clear: "btn btn-soft",
        undo: "btn btn-soft",
    };

    let { variant, children, ...rest }: Props = $props();
</script>

<button class={variantClasses[variant]} {...rest}>
    {@render children()}
</button>
