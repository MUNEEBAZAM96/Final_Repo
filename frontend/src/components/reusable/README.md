# 🎨 Reusable React Components Library

A collection of production-ready, reusable React components perfect for hackathons and rapid prototyping.

## 📦 Components

- **Navbar** - Responsive navigation bar with active state indicators
- **Header** - Top header bar with user info and actions
- **Card** - Flexible card component with multiple variants
- **Button** - Versatile button component with multiple styles and states

---

## 🚀 Quick Start

### Installation

All components are already included in this project. Simply import them:

```tsx
import { Navbar, Header, Card, Button } from './components/reusable'
```

Or import individually:

```tsx
import Navbar from './components/reusable/Navbar'
import Header from './components/reusable/Header'
import Card from './components/reusable/Card'
import Button from './components/reusable/Button'
```

---

## 📖 Component Documentation

### 1. Navbar Component

A responsive navigation bar with active state indicators and multiple variants.

#### Basic Usage

```tsx
import { Navbar } from './components/reusable'

function App() {
  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ]

  return (
    <Navbar
      items={navItems}
      logo="MyApp"
      logoPath="/"
    />
  )
}
```

#### With Icons

```tsx
import { Navbar } from './components/reusable'
import { HomeIcon, UserIcon, SettingsIcon } from '@heroicons/react/24/outline'

const navItems = [
  { label: 'Home', path: '/', icon: <HomeIcon /> },
  { label: 'Profile', path: '/profile', icon: <UserIcon /> },
  { label: 'Settings', path: '/settings', icon: <SettingsIcon /> },
]

<Navbar items={navItems} logo="MyApp" />
```

#### Variants

```tsx
// Default (with background and shadow)
<Navbar items={navItems} variant="default" />

// Minimal (transparent background)
<Navbar items={navItems} variant="minimal" />

// Centered (centered navigation items)
<Navbar items={navItems} variant="centered" />
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `NavbarItem[]` | **required** | Array of navigation items |
| `logo` | `ReactNode \| string` | - | Logo component or text |
| `logoPath` | `string` | `'/'` | Path for logo link |
| `variant` | `'default' \| 'minimal' \| 'centered'` | `'default'` | Visual variant |
| `showActiveIndicator` | `boolean` | `true` | Show active state indicator |
| `className` | `string` | `''` | Additional CSS classes |

#### NavbarItem Interface

```tsx
interface NavbarItem {
  label: string      // Display text
  path: string      // Route path
  icon?: ReactNode  // Optional icon component
}
```

---

### 2. Header Component

A top header bar with title, subtitle, user info, and action buttons.

#### Basic Usage

```tsx
import { Header } from './components/reusable'

<Header
  title="Dashboard"
  subtitle="Welcome back, John!"
/>
```

#### With User Info

```tsx
<Header
  title="My Profile"
  subtitle="Manage your account settings"
  avatar="/path/to/avatar.jpg"
  userInfo={{
    name: "John Doe",
    email: "john@example.com"
  }}
  onLogout={() => console.log('Logout')}
/>
```

#### With Custom Actions

```tsx
<Header
  title="Projects"
  subtitle="Manage your projects"
  actions={
    <>
      <Button variant="outline">Filter</Button>
      <Button variant="primary">New Project</Button>
    </>
  }
/>
```

#### Variants

```tsx
// Default (standard padding)
<Header title="Dashboard" variant="default" />

// Compact (reduced padding)
<Header title="Dashboard" variant="compact" />

// Detailed (larger title and subtitle)
<Header title="Dashboard" variant="detailed" />
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | **required** | Main title |
| `subtitle` | `string` | - | Subtitle text |
| `actions` | `ReactNode` | - | Custom action buttons |
| `avatar` | `string` | - | User avatar image URL |
| `userInfo` | `{ name: string, email?: string }` | - | User information |
| `onLogout` | `() => void` | - | Logout handler |
| `variant` | `'default' \| 'compact' \| 'detailed'` | `'default'` | Visual variant |
| `className` | `string` | `''` | Additional CSS classes |

---

### 3. Card Component

A flexible card component with header, body, footer, and image support.

#### Basic Usage

```tsx
import { Card } from './components/reusable'

<Card title="Card Title">
  <p>Card content goes here</p>
</Card>
```

#### With Image

```tsx
<Card
  title="Beautiful Image"
  subtitle="This is a subtitle"
  image="/path/to/image.jpg"
  imageAlt="Description"
>
  <p>Card content with image</p>
</Card>
```

#### With Footer

```tsx
<Card
  title="Product Card"
  footer={
    <>
      <Button variant="outline">Cancel</Button>
      <Button variant="primary">Buy Now</Button>
    </>
  }
>
  <p>Product description</p>
</Card>
```

#### Variants

```tsx
// Default (subtle shadow)
<Card title="Card" variant="default">Content</Card>

// Elevated (strong shadow)
<Card title="Card" variant="elevated">Content</Card>

// Outlined (border only)
<Card title="Card" variant="outlined">Content</Card>

// Flat (minimal styling)
<Card title="Card" variant="flat">Content</Card>
```

#### Interactive Cards

```tsx
// Hoverable (lifts on hover)
<Card title="Card" hoverable>Content</Card>

// Clickable (with onClick handler)
<Card title="Card" onClick={() => alert('Clicked!')}>Content</Card>

// Loading state
<Card title="Card" loading>Content</Card>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | - | Card title |
| `subtitle` | `string` | - | Card subtitle |
| `children` | `ReactNode` | **required** | Card content |
| `footer` | `ReactNode` | - | Footer content (buttons, etc.) |
| `image` | `string` | - | Image URL |
| `imageAlt` | `string` | - | Image alt text |
| `onClick` | `() => void` | - | Click handler |
| `variant` | `'default' \| 'elevated' \| 'outlined' \| 'flat'` | `'default'` | Visual variant |
| `hoverable` | `boolean` | `false` | Enable hover effect |
| `loading` | `boolean` | `false` | Show loading spinner |
| `className` | `string` | `''` | Additional CSS classes |

---

### 4. Button Component

A versatile button component with multiple variants, sizes, and states.

#### Basic Usage

```tsx
import { Button } from './components/reusable'

<Button onClick={() => alert('Clicked!')}>
  Click Me
</Button>
```

#### Variants

```tsx
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="danger">Delete</Button>
<Button variant="success">Save</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
```

#### Sizes

```tsx
<Button size="small">Small</Button>
<Button size="medium">Medium</Button>
<Button size="large">Large</Button>
```

#### With Icons

```tsx
import { PlusIcon } from '@heroicons/react/24/outline'

<Button icon={<PlusIcon />} iconPosition="left">
  Add Item
</Button>

<Button icon={<ArrowRightIcon />} iconPosition="right">
  Next
</Button>
```

#### States

```tsx
// Disabled
<Button disabled>Disabled</Button>

// Loading
<Button loading>Processing...</Button>

// Full width
<Button fullWidth>Full Width</Button>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | **required** | Button content |
| `onClick` | `() => void` | - | Click handler |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Button type |
| `variant` | `'primary' \| 'secondary' \| 'danger' \| 'success' \| 'outline' \| 'ghost'` | `'primary'` | Visual variant |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Button size |
| `disabled` | `boolean` | `false` | Disable button |
| `loading` | `boolean` | `false` | Show loading spinner |
| `fullWidth` | `boolean` | `false` | Full width button |
| `icon` | `ReactNode` | - | Icon component |
| `iconPosition` | `'left' \| 'right'` | `'left'` | Icon position |
| `className` | `string` | `''` | Additional CSS classes |

---

## 🎨 Styling & Customization

### CSS Variables

You can customize colors by overriding CSS variables:

```css
:root {
  --primary-color: #6366f1;
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
}
```

### Custom Classes

All components accept a `className` prop for additional styling:

```tsx
<Card className="my-custom-card">Content</Card>
```

---

## 📱 Responsive Design

All components are fully responsive and work on:
- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)

---

## 💡 Usage Examples

### Complete Page Layout

```tsx
import { Navbar, Header, Card, Button } from './components/reusable'

function Dashboard() {
  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Settings', path: '/settings' },
  ]

  return (
    <>
      <Navbar items={navItems} logo="MyApp" />
      
      <Header
        title="Dashboard"
        subtitle="Welcome back!"
        userInfo={{ name: "John Doe" }}
        avatar="/avatar.jpg"
        onLogout={() => logout()}
      />

      <div className="container">
        <Card
          title="Statistics"
          hoverable
          footer={
            <Button variant="primary">View Details</Button>
          }
        >
          <p>Your stats here</p>
        </Card>
      </div>
    </>
  )
}
```

### Card Grid Layout

```tsx
<div className="grid">
  {items.map((item) => (
    <Card
      key={item.id}
      title={item.title}
      image={item.image}
      hoverable
      onClick={() => handleClick(item)}
      footer={
        <Button variant="primary" fullWidth>
          View
        </Button>
      }
    >
      {item.description}
    </Card>
  ))}
</div>
```

---

## 🐛 Troubleshooting

### Components not styling correctly?

Make sure you're importing the CSS files. They're automatically imported when you use the components, but if you're importing directly, make sure to include:

```tsx
import './components/reusable/Navbar.css'
```

### TypeScript errors?

All components are fully typed. Make sure you're importing types correctly:

```tsx
import type { NavbarProps, CardProps } from './components/reusable'
```

---

## 📝 Notes

- All components use React Router's `Link` for navigation (Navbar)
- Components are designed to work with any CSS framework or custom styles
- All components support dark mode through CSS variables
- Components are optimized for performance with minimal re-renders

---

## 🎯 Best Practices

1. **Use semantic HTML**: Components use proper semantic elements
2. **Accessibility**: All components include proper ARIA attributes
3. **Performance**: Use React.memo for frequently re-rendered components
4. **Consistency**: Stick to one variant per component type for consistency

---

## 📄 License

These components are part of your project and can be freely used and modified.

---

## 🤝 Contributing

Feel free to extend these components or add new ones to the reusable library!

---

**Happy Coding! 🚀**

