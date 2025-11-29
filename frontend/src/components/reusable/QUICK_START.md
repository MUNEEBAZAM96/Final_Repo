# ⚡ Quick Start Guide

## 📁 Folder Structure

```
frontend/src/components/reusable/
├── Navbar.tsx          # Navigation bar component
├── Navbar.css          # Navbar styles
├── Header.tsx          # Top header component
├── Header.css          # Header styles
├── Card.tsx            # Card component
├── Card.css            # Card styles
├── Button.tsx          # Button component
├── Button.css          # Button styles
├── index.ts            # Export file (import from here!)
├── Example.tsx         # Usage examples
├── README.md           # Full documentation
└── QUICK_START.md      # This file
```

---

## 🚀 3-Minute Setup

### Step 1: Import Components

```tsx
import { Navbar, Header, Card, Button } from './components/reusable'
```

### Step 2: Use in Your Component

```tsx
function MyPage() {
  return (
    <>
      {/* Navigation */}
      <Navbar
        items={[
          { label: 'Home', path: '/' },
          { label: 'About', path: '/about' },
        ]}
        logo="MyApp"
      />

      {/* Header */}
      <Header
        title="My Page"
        subtitle="Welcome!"
      />

      {/* Content */}
      <Card title="Hello World">
        <p>This is a card!</p>
        <Button variant="primary">Click Me</Button>
      </Card>
    </>
  )
}
```

---

## 📋 Common Patterns

### Pattern 1: Dashboard Layout

```tsx
<Navbar items={navItems} logo="App" />
<Header title="Dashboard" userInfo={{ name: "User" }} />
<div className="grid">
  <Card title="Card 1">Content</Card>
  <Card title="Card 2">Content</Card>
</div>
```

### Pattern 2: Profile Page

```tsx
<Header
  title="Profile"
  avatar="/avatar.jpg"
  userInfo={{ name: "John", email: "john@example.com" }}
/>
<Card title="Edit Profile" footer={<Button>Save</Button>}>
  Form content here
</Card>
```

### Pattern 3: List/Grid View

```tsx
{items.map(item => (
  <Card
    key={item.id}
    title={item.title}
    image={item.image}
    hoverable
    onClick={() => handleClick(item)}
  >
    {item.description}
  </Card>
))}
```

---

## 🎨 Quick Customization

### Change Colors

Add to your CSS:

```css
:root {
  --primary-color: #your-color;
}
```

### Add Custom Styles

```tsx
<Card className="my-custom-class">Content</Card>
```

---

## 📚 Full Documentation

See `README.md` for complete documentation with all props and examples.

---

## 💡 Pro Tips

1. **Import from index.ts** - Cleaner imports
2. **Use variants** - Different styles for different contexts
3. **Combine components** - They work great together
4. **Check Example.tsx** - See real usage examples

---

**Ready to build! 🎉**

