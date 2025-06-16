# Component Library

## Overview

The component library is built using Radix UI primitives and styled with Tailwind CSS. It follows atomic design principles and provides a consistent, accessible, and customizable UI system.

## Core Components

### Layout Components

#### Layout
```typescript
import { Layout } from '@/components/Layout'

// Usage
<Layout>
  <YourContent />
</Layout>
```

Props:
- `children`: ReactNode
- `className?: string`

#### ProtectedRoute
```typescript
import { ProtectedRoute } from '@/components/ProtectedRoute'

// Usage
<ProtectedRoute>
  <ProtectedContent />
</ProtectedRoute>
```

Props:
- `children`: ReactNode

### Form Components

#### Input
```typescript
import { Input } from '@/components/ui/input'

// Usage
<Input
  type="text"
  placeholder="Enter text"
  value={value}
  onChange={handleChange}
/>
```

Props:
- `type`: string
- `placeholder`: string
- `value`: string
- `onChange`: (e: ChangeEvent<HTMLInputElement>) => void
- `className?: string`

#### Button
```typescript
import { Button } from '@/components/ui/button'

// Usage
<Button
  variant="primary"
  onClick={handleClick}
>
  Click Me
</Button>
```

Props:
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost'
- `size`: 'sm' | 'md' | 'lg'
- `onClick`: () => void
- `children`: ReactNode
- `className?: string`

### Data Display Components

#### Card
```typescript
import { Card } from '@/components/ui/card'

// Usage
<Card>
  <CardHeader>Title</CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>
```

Props:
- `children`: ReactNode
- `className?: string`

#### Table
```typescript
import { Table } from '@/components/ui/table'

// Usage
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Header</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Cell</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

Props:
- `children`: ReactNode
- `className?: string`

### Feedback Components

#### Toast
```typescript
import { toast } from '@/components/ui/use-toast'

// Usage
toast({
  title: "Success",
  description: "Operation completed",
  variant: "success"
})
```

Props:
- `title`: string
- `description`: string
- `variant`: 'default' | 'success' | 'error' | 'warning'
- `duration`: number

#### Alert
```typescript
import { Alert } from '@/components/ui/alert'

// Usage
<Alert variant="warning">
  <AlertTitle>Warning</AlertTitle>
  <AlertDescription>Description</AlertDescription>
</Alert>
```

Props:
- `variant`: 'default' | 'destructive'
- `children`: ReactNode
- `className?: string`

## Custom Hooks

### useAuth
```typescript
import { useAuth } from '@/hooks/useAuth'

// Usage
const { user, login, logout } = useAuth()
```

### useToast
```typescript
import { useToast } from '@/hooks/useToast'

// Usage
const { toast } = useToast()
```

## Styling

Components are styled using Tailwind CSS with a custom theme configuration. The theme can be customized in `tailwind.config.ts`.

### Theme Colors
```typescript
{
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    // ...
  },
  secondary: {
    // ...
  }
}
```

### Typography
```typescript
{
  fontFamily: {
    sans: ['Inter', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace']
  }
}
```

## Accessibility

All components follow WCAG 2.1 guidelines and include:
- ARIA labels
- Keyboard navigation
- Focus management
- Color contrast
- Screen reader support

## Best Practices

1. Use semantic HTML elements
2. Maintain consistent spacing
3. Follow the design system
4. Test for accessibility
5. Document component usage
6. Keep components focused and reusable 