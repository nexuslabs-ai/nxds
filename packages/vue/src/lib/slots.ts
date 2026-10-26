import { Comment, Fragment, Text, type VNode } from 'vue';

/** The nodes a slot renders, without comments and whitespace-only text. */
export function renderedNodes(nodes: VNode[] | undefined) {
  return (nodes ?? []).filter(
    (node) =>
      node.type !== Comment &&
      !(node.type === Text && !String(node.children).trim())
  );
}

/** {@link renderedNodes} with each `v-for` or `<template>` fragment unwrapped into its children. */
export function flattenedNodes(nodes: VNode[] | undefined): VNode[] {
  return renderedNodes(nodes).flatMap((node) =>
    node.type === Fragment && Array.isArray(node.children)
      ? flattenedNodes(node.children as VNode[])
      : [node]
  );
}
