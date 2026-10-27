'use client';

/**
 * @nxds/react ships without the "use client" directive at the bundle
 * level, so Next's RSC compiler refuses direct imports from server
 * components. This barrel re-exports the surface as a single client
 * module, so server pages render nxds components as client islands.
 */
export {
  Badge,
  Button,
  Checkbox,
  CodeBlock,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockLine,
  EmptyState,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateHeader,
  EmptyStateTitle,
  Input,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableRowHeader,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@nxds/react';
