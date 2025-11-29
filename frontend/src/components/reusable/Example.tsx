/**
 * Example usage of reusable components
 * This file demonstrates how to use all the reusable components together
 */

import { Navbar, Header, Card, Button } from './index'

export default function ReusableComponentsExample() {
  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Profile', path: '/profile' },
    { label: 'Settings', path: '/settings' },
  ]

  return (
    <div>
      {/* Navigation Bar */}
      <Navbar
        items={navItems}
        logo="MyApp"
        logoPath="/"
        variant="default"
      />

      {/* Header */}
      <Header
        title="Welcome to Dashboard"
        subtitle="Manage your tasks and projects"
        userInfo={{
          name: 'John Doe',
          email: 'john@example.com',
        }}
        avatar="/path/to/avatar.jpg"
        actions={
          <>
            <Button variant="outline" size="small">
              Filter
            </Button>
            <Button variant="primary" size="small">
              New Task
            </Button>
          </>
        }
        onLogout={() => console.log('Logout clicked')}
      />

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {/* Card Examples */}
          <Card
            title="Statistics"
            subtitle="Your performance metrics"
            hoverable
            footer={
              <>
                <Button variant="outline" size="small">
                  View Details
                </Button>
                <Button variant="primary" size="small">
                  Export
                </Button>
              </>
            }
          >
            <div>
              <p>Total Tasks: 25</p>
              <p>Completed: 18</p>
              <p>In Progress: 7</p>
            </div>
          </Card>

          <Card
            title="Recent Activity"
            image="/path/to/image.jpg"
            imageAlt="Activity"
            variant="elevated"
            hoverable
            onClick={() => console.log('Card clicked')}
          >
            <p>Your recent activities will appear here</p>
          </Card>

          <Card
            title="Quick Actions"
            variant="outlined"
            footer={
              <Button variant="primary" fullWidth>
                Get Started
              </Button>
            }
          >
            <ul>
              <li>Create new project</li>
              <li>Invite team members</li>
              <li>View reports</li>
            </ul>
          </Card>

          {/* Button Examples */}
          <Card title="Button Variants" variant="flat">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="success">Success</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
          </Card>

          <Card title="Button Sizes" variant="flat">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Button size="small">Small Button</Button>
              <Button size="medium">Medium Button</Button>
              <Button size="large">Large Button</Button>
            </div>
          </Card>

          <Card title="Button States" variant="flat">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Button>Normal</Button>
              <Button disabled>Disabled</Button>
              <Button loading>Loading...</Button>
              <Button fullWidth>Full Width</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

