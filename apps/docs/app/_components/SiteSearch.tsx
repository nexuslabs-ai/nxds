'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { PAGE_MANIFEST } from '../_lib/manifest';
import { PLAYGROUND_VIEWS } from '../_lib/playground-views';
import { IconSearch } from '../_lib/switchable-icons';

import {
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  Kbd,
} from './nxds';

// The Playground routes and every page in the generated manifest (the same
// source the nav and routes read), so search stays in sync as pages are added.
const SEARCH_INDEX = [
  { title: 'Playground', items: PLAYGROUND_VIEWS },
  ...PAGE_MANIFEST.map((section) => ({
    title: section.title,
    items: section.pages.map((page) => ({
      label: page.label,
      href: page.route,
    })),
  })),
];

/**
 * ⌘K search over every page. Built from Dialog parts, not CommandDialog, so
 * closing it returns focus to the trigger.
 */
export function SiteSearch() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'k' || !(event.metaKey || event.ctrlKey)) return;
      event.preventDefault();
      setOpen((current) => !current);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  function navigate(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-label="Search docs"
          className="nx:max-md:w-8 nx:max-md:px-0"
        >
          <IconSearch aria-hidden="true" />
          <span className="nx:hidden nx:md:inline">Search docs</span>
          <Kbd className="nx:hidden nx:md:inline-flex">⌘K</Kbd>
        </Button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="nx:overflow-hidden nx:p-0"
      >
        <DialogTitle className="nx:sr-only">Search the docs</DialogTitle>
        <DialogDescription className="nx:sr-only">
          Jump to any page by name
        </DialogDescription>
        <Command label="Search the docs">
          <CommandInput placeholder="Search the docs…" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {SEARCH_INDEX.map((group) => (
              <CommandGroup key={group.title} heading={group.title}>
                {group.items.map((item) => (
                  <CommandItem
                    key={item.href}
                    value={`${group.title} ${item.label}`}
                    onSelect={() => navigate(item.href)}
                  >
                    {item.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
