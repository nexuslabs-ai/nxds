'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/button/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/command/command';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/dialog/dialog';
import { Kbd } from '@/components/kbd/kbd';

import { SEARCH_INDEX } from '../_lib/search-index';
import { IconSearch } from '../_lib/switchable-icons';

/**
 * ⌘K search over every docs page. Built from Dialog parts, not CommandDialog,
 * so closing it returns focus to the trigger.
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
                    onSelect={() => router.push(item.href)}
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
