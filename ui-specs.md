# DevbrainAI UI Design System & Specifications

## 1. Design System Foundation

### 1.1 Color Palette

#### Primary Colors
- **Primary Blue**: #4F46E5 (Indigo-600) - Main brand color, CTAs, active states
- **Primary Blue Light**: #6366F1 (Indigo-500) - Hover states, secondary actions
- **Primary Blue Dark**: #3730A3 (Indigo-700) - Pressed states, text links

#### Secondary Colors
- **Accent Purple**: #8B5CF6 (Violet-500) - AI interactions, special features
- **Accent Green**: #10B981 (Emerald-500) - Success states, completed items
- **Accent Orange**: #F59E0B (Amber-500) - Warnings, in-progress items
- **Accent Red**: #EF4444 (Red-500) - Errors, critical alerts

#### Neutral Colors
- **Text Primary**: #111827 (Gray-900) - Main text, headings
- **Text Secondary**: #6B7280 (Gray-500) - Secondary text, captions
- **Text Tertiary**: #9CA3AF (Gray-400) - Placeholder text, disabled states
- **Background Primary**: #FFFFFF - Main backgrounds, cards
- **Background Secondary**: #F9FAFB (Gray-50) - Section backgrounds
- **Background Tertiary**: #F3F4F6 (Gray-100) - Input backgrounds
- **Border Light**: #E5E7EB (Gray-200) - Subtle borders, dividers
- **Border Medium**: #D1D5DB (Gray-300) - Form inputs, card borders

#### Semantic Colors
- **Success**: #10B981 with backgrounds #D1FAE5
- **Warning**: #F59E0B with backgrounds #FEF3C7
- **Error**: #EF4444 with backgrounds #FEE2E2
- **Info**: #3B82F6 with backgrounds #DBEAFE

### 1.2 Typography

#### Font Stack
- **Primary**: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
- **Code**: 'JetBrains Mono', 'SF Mono', Monaco, 'Cascadia Code', monospace

#### Type Scale
- **Heading 1**: 3rem (48px) / Line height 1.2 / Font weight 700
- **Heading 2**: 2.25rem (36px) / Line height 1.25 / Font weight 700
- **Heading 3**: 1.875rem (30px) / Line height 1.3 / Font weight 600
- **Heading 4**: 1.5rem (24px) / Line height 1.375 / Font weight 600
- **Heading 5**: 1.25rem (20px) / Line height 1.4 / Font weight 600
- **Body Large**: 1.125rem (18px) / Line height 1.6 / Font weight 400
- **Body**: 1rem (16px) / Line height 1.5 / Font weight 400
- **Body Small**: 0.875rem (14px) / Line height 1.45 / Font weight 400
- **Caption**: 0.75rem (12px) / Line height 1.4 / Font weight 500

### 1.3 Spacing System

#### Base Unit: 4px
- **xs**: 4px (1 unit)
- **sm**: 8px (2 units)
- **md**: 16px (4 units)
- **lg**: 24px (6 units)
- **xl**: 32px (8 units)
- **2xl**: 48px (12 units)
- **3xl**: 64px (16 units)

### 1.4 Border Radius
- **None**: 0px
- **Small**: 4px - Small elements, badges
- **Medium**: 8px - Buttons, inputs, cards
- **Large**: 12px - Large cards, modals
- **XL**: 16px - Major containers
- **Full**: 9999px - Pills, avatars

### 1.5 Shadows
- **Small**: 0 1px 2px rgba(0, 0, 0, 0.05)
- **Medium**: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)
- **Large**: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)
- **XL**: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)

## 2. Component Library

### 2.1 Button Components

#### Primary Button
- **Background**: Primary Blue (#4F46E5)
- **Text Color**: White
- **Padding**: 12px 24px
- **Border Radius**: 8px
- **Font Weight**: 600
- **States**:
  - Hover: Background #6366F1
  - Active: Background #3730A3
  - Disabled: Background #D1D5DB, Text #9CA3AF
  - Loading: Spinner animation with reduced opacity

#### Secondary Button
- **Background**: White
- **Border**: 1px solid #D1D5DB
- **Text Color**: #374151
- **States**:
  - Hover: Background #F9FAFB, Border #9CA3AF
  - Active: Background #F3F4F6
  - Disabled: Background #F9FAFB, Text #9CA3AF, Border #E5E7EB

#### Ghost Button
- **Background**: Transparent
- **Text Color**: Primary Blue
- **States**:
  - Hover: Background #F0F4FF
  - Active: Background #E6EDFF

#### Icon Button
- **Size**: 40x40px
- **Border Radius**: 8px
- **Icon Size**: 20px
- **States**: Same hover/active pattern as ghost buttons

### 2.2 Input Components

#### Text Input
- **Height**: 44px
- **Padding**: 12px 16px
- **Border**: 1px solid #D1D5DB
- **Border Radius**: 8px
- **Background**: White
- **States**:
  - Focus: Border Primary Blue, Box Shadow 0 0 0 3px rgba(79, 70, 229, 0.1)
  - Error: Border Red, Box Shadow with red tint
  - Disabled: Background #F3F4F6, Text #9CA3AF

#### Textarea
- **Minimum Height**: 120px
- **Resize**: Vertical only
- **Line Height**: 1.5

#### Select Dropdown
- **Dropdown Arrow**: Custom SVG icon
- **Max Height**: 240px with scroll
- **Option Padding**: 12px 16px
- **Option Hover**: Background #F9FAFB

### 2.3 Card Components

#### Standard Card
- **Background**: White
- **Border**: 1px solid #E5E7EB
- **Border Radius**: 12px
- **Padding**: 24px
- **Shadow**: Medium shadow
- **Hover State**: Slight shadow increase, subtle scale (1.02)

#### Interactive Card
- **Cursor**: Pointer
- **Transition**: All properties 200ms ease
- **Hover**: Shadow Large, Transform scale(1.02)
- **Active**: Transform scale(0.98)

#### Status Card (for progress tracking)
- **Border Left**: 4px solid (color based on status)
- **Status Colors**:
  - Complete: Green (#10B981)
  - In Progress: Orange (#F59E0B)
  - Planned: Gray (#6B7280)
  - At Risk: Red (#EF4444)

### 2.4 Chat Interface Components

#### Message Bubble
- **AI Messages**:
  - Background: #F9FAFB
  - Border Radius: 16px 16px 16px 4px
  - Padding: 16px 20px
  - Max Width: 75% of container
- **User Messages**:
  - Background: Primary Blue
  - Text Color: White
  - Border Radius: 16px 16px 4px 16px
  - Align: Right
  - Max Width: 75% of container

#### Typing Indicator
- **Animation**: Three dots bouncing
- **Color**: #6B7280
- **Duration**: 1.4s infinite

#### Message Input
- **Height**: Auto-expanding (min 44px, max 120px)
- **Border**: 2px solid #E5E7EB
- **Border Radius**: 24px
- **Padding**: 12px 50px 12px 20px
- **Send Button**: Positioned absolute right, Primary Blue icon

### 2.5 Data Visualization Components

#### Progress Bar
- **Height**: 8px
- **Background**: #E5E7EB
- **Fill**: Primary Blue
- **Border Radius**: 4px
- **Animation**: Smooth width transition 300ms ease

#### Status Badge
- **Padding**: 4px 12px
- **Font Size**: 12px
- **Font Weight**: 600
- **Border Radius**: Full
- **Colors**:
  - Success: Green background with dark green text
  - Warning: Orange background with dark orange text
  - Error: Red background with white text
  - Info: Blue background with white text

#### Chart Container
- **Background**: White
- **Border**: 1px solid #E5E7EB
- **Border Radius**: 12px
- **Padding**: 24px
- **Min Height**: 300px

### 2.6 Modal & Overlay Components

#### Modal Backdrop
- **Background**: rgba(0, 0, 0, 0.5)
- **Z-Index**: 50
- **Animation**: Fade in 200ms ease

#### Modal Container
- **Background**: White
- **Border Radius**: 16px
- **Max Width**: 500px (small), 800px (large)
- **Padding**: 32px
- **Shadow**: XL shadow
- **Animation**: Scale in from 0.95 with fade

#### Toast Notification
- **Position**: Fixed top-right
- **Width**: 360px
- **Padding**: 16px 20px
- **Border Radius**: 8px
- **Shadow**: Large shadow
- **Animation**: Slide in from right, auto-dismiss after 5s

## 3. Screen Designs

### 3.1 Landing Page

#### Hero Section
- **Layout**: Centered content with gradient background
- **Gradient**: Linear from #F0F4FF to #E6EDFF
- **Heading**: "Transform Ideas into MVPs with AI"
- **Subheading**: Body Large text explaining core value proposition
- **CTA**: Large Primary Button "Start Building"
- **Visual**: Animated conversation preview mockup

#### Feature Showcase
- **Layout**: 3-column grid on desktop, stacked on mobile
- **Cards**: Interactive cards with icons and descriptions
- **Icons**: Custom illustrated icons in brand colors
- **Hover Effects**: Subtle lift and shadow increase

#### Pricing Section
- **Layout**: 3 pricing cards side by side
- **Highlight**: Pro plan with special border and badge
- **Cards**: Enhanced card styling with feature lists
- **CTAs**: Plan-specific button styling

### 3.2 Conversational Interface

#### Main Chat View
- **Layout**: Full height with header, messages, and input
- **Header**: 
  - Project title and status
  - Multi-AI perspective toggle
  - Export/share buttons
- **Messages Area**:
  - Auto-scroll to bottom
  - Virtualized for performance
  - Message timestamps
  - AI avatar and typing indicators
- **Sidebar**: Collapsible visual intelligence panel
  - Market bubble charts
  - User journey maps
  - Feature impact analysis
  - Real-time updates

#### Visual Intelligence Panel
- **Width**: 400px (collapsible to 60px icon bar)
- **Background**: White with subtle border
- **Sections**:
  - Market Opportunity Chart
  - Competitive Positioning Matrix
  - Feature Priority List
  - Progress Visualization
- **Interactions**: Click to expand, hover for details
- **Responsive**: Overlay modal on mobile

#### Multi-AI Perspective Switcher
- **Design**: Tabbed interface with AI avatars
- **Active State**: Highlighted tab with underline
- **Comparison Mode**: Split view showing different perspectives
- **Quick Switch**: Keyboard shortcuts (Cmd+1, Cmd+2, etc.)

### 3.3 Dashboard Interfaces

#### Founder Dashboard
- **Layout**: Grid-based with responsive breakpoints
- **Header**: Welcome message, quick stats, notifications
- **Cards**:
  - Active Projects (with progress bars)
  - Recent Conversations
  - Context Library Access
  - Team Activity Feed
- **Navigation**: Sidebar with main sections
- **Stats**: Key metrics with trend indicators

#### Developer Progress View
- **Layout**: Developer-focused layout with code metrics
- **Sections**:
  - Current Sprint Progress
  - Code Quality Metrics
  - Recent Commits Activity
  - Feature Completion Status
- **Integration Status**: MCP connection indicators
- **Quick Actions**: Export context, sync progress, request review

#### Team Collaboration Workspace
- **Layout**: Multi-panel layout for team overview
- **Team Members**: Avatar list with online status
- **Activity Timeline**: Real-time updates from all team members
- **Project Overview**: High-level progress and health indicators
- **Communication**: Integrated chat or comment system

### 3.4 Context Library UI

#### Pack Browsing Grid
- **Layout**: Responsive grid (4 cols desktop, 2 mobile)
- **Pack Cards**: 
  - Preview image/icon
  - Title and description
  - Rating and download count
  - Tech stack tags
  - Quick preview button
- **Filters**: 
  - Tech stack
  - Category
  - Rating
  - Recency
- **Search**: Prominent search bar with auto-suggest

#### Pack Detail Page
- **Layout**: Two-column layout (details + preview)
- **Hero Section**: Large preview, title, rating, download button
- **Details Tabs**:
  - Overview (description, included files)
  - Requirements (tech stack, dependencies)
  - Setup Guide (step-by-step instructions)
  - Reviews (user feedback and ratings)
- **Installation**: Code snippets with copy buttons

#### Search and Filter Interface
- **Search Bar**: Prominent with advanced search toggle
- **Filters Sidebar**: Collapsible with clear all option
- **Results**: Grid or list view toggle
- **Sorting**: Dropdown with relevance, rating, downloads, date
- **Empty States**: Helpful messaging with suggested actions

### 3.5 Forms and Authentication

#### Login/Signup Forms
- **Design**: Clean, centered form with minimal fields
- **Social Auth**: Google, GitHub OAuth buttons
- **Layout**: Single column, proper spacing
- **Validation**: Real-time with helpful error messages
- **Loading States**: Button loading spinners

#### Project Creation Form
- **Steps**: Multi-step wizard with progress indicator
- **Fields**: 
  - Project name and description
  - Initial idea/requirements
  - Team settings
  - Integration preferences
- **Validation**: Step-by-step validation with clear feedback
- **Preview**: Live preview of generated project card

#### Settings and Preferences
- **Layout**: Tabbed interface with clear sections
- **Sections**:
  - Profile settings
  - Notification preferences
  - Integration settings
  - Billing and subscription
- **Save States**: Auto-save indicators and manual save buttons

### 3.6 Mobile Responsive Design

#### Mobile Navigation
- **Pattern**: Bottom tab bar for main sections
- **Hamburger Menu**: Secondary navigation and settings
- **Responsive Breakpoints**:
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px

#### Mobile Chat Interface
- **Layout**: Full screen with minimal header
- **Input**: Sticky bottom with auto-resize
- **Visual Panel**: Swipe-up overlay modal
- **Gestures**: Swipe to navigate, pull to refresh

#### Touch-Optimized Controls
- **Button Size**: Minimum 44px touch targets
- **Spacing**: Increased spacing between interactive elements
- **Feedback**: Visual feedback for all touch interactions

## 4. Component States and Interactions

### 4.1 Loading States

#### Skeleton Screens
- **Design**: Gray placeholder blocks matching content structure
- **Animation**: Subtle shimmer effect moving left to right
- **Duration**: 1.5s loop
- **Usage**: Initial page loads, content updates

#### Spinner Loading
- **Design**: Circular spinner in brand colors
- **Size**: 16px (small), 24px (medium), 32px (large)
- **Usage**: Button loading, inline content updates

#### Progress Loading
- **Design**: Animated progress bar with percentage
- **Usage**: File uploads, context generation, exports

### 4.2 Error States

#### Error Messages
- **Color**: Error red with appropriate background
- **Icon**: Alert triangle or exclamation
- **Actions**: Retry button, contact support link
- **Positioning**: Contextual to failed action

#### Form Validation
- **Inline**: Error message below invalid field
- **Color**: Red text and border
- **Icon**: X mark in input field
- **Timing**: On blur or submit attempt

#### Empty States
- **Illustration**: Simple, friendly illustrations
- **Message**: Helpful explanation of why content is empty
- **Action**: Clear next step (create, import, etc.)

### 4.3 Success Confirmations

#### Toast Notifications
- **Design**: Green background with check icon
- **Duration**: 5 seconds auto-dismiss
- **Position**: Top-right of viewport
- **Action**: Optional undo or view button

#### Inline Success
- **Design**: Green check icon with success message
- **Usage**: Form submissions, save confirmations
- **Duration**: Brief display then fade out

## 5. Animation and Transition Guidelines

### 5.1 Transition Timings
- **Fast**: 150ms - Hover states, small UI changes
- **Standard**: 300ms - Page transitions, modal open/close
- **Slow**: 500ms - Complex animations, page loads

### 5.2 Easing Functions
- **Ease Out**: For entrances and appearances
- **Ease In**: For exits and disappearances  
- **Ease In Out**: For movements and transformations

### 5.3 Micro-interactions
- **Button Press**: Scale down 0.95 on active
- **Card Hover**: Lift with shadow increase
- **Loading**: Subtle pulse or shimmer
- **Success**: Brief scale up then return to normal

## 6. Accessibility Specifications

### 6.1 Color Contrast
- **AA Compliance**: Minimum 4.5:1 ratio for normal text
- **AAA Compliance**: 7:1 ratio for important text
- **Large Text**: 3:1 minimum ratio for 18pt+ text

### 6.2 Focus Management
- **Focus Rings**: 3px outline in primary blue with transparency
- **Tab Order**: Logical order matching visual layout
- **Skip Links**: Hidden links to main content
- **Focus Trapping**: In modals and overlays

### 6.3 Screen Reader Support
- **Alt Text**: Descriptive alt text for all images
- **ARIA Labels**: Proper labeling for interactive elements
- **Semantic HTML**: Use appropriate HTML elements
- **Live Regions**: For dynamic content updates

### 6.4 Keyboard Navigation
- **All Interactive Elements**: Keyboard accessible
- **Shortcuts**: Common shortcuts (Esc to close, Enter to submit)
- **Visual Indicators**: Clear focus indicators
- **Tab Trapping**: Proper modal focus management

## 7. Responsive Design Breakpoints

### 7.1 Breakpoint System
- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px - 1439px
- **Large Desktop**: 1440px+

### 7.2 Layout Patterns
- **Mobile**: Single column, stacked elements
- **Tablet**: Two columns, collapsible sidebars
- **Desktop**: Multi-column, fixed sidebars
- **Large**: Wider max-widths, more content per row

### 7.3 Component Adaptations
- **Navigation**: Hamburger menu → tabs → sidebar
- **Cards**: Single column → grid → larger grid
- **Forms**: Single column → two column where appropriate
- **Charts**: Simplified → full detail → enhanced detail

## 8. Implementation Guidelines

### 8.1 CSS Framework Approach
- **Utility-First**: Tailwind CSS compatible design tokens
- **Component Classes**: Reusable component styles
- **Custom Properties**: CSS variables for theming

### 8.2 Asset Requirements
- **Icons**: SVG icon library (Heroicons-style)
- **Illustrations**: Custom brand illustrations for empty states
- **Images**: Optimized images with proper alt text
- **Fonts**: Web font loading with fallbacks

### 8.3 Performance Considerations
- **Image Optimization**: WebP format with fallbacks
- **Code Splitting**: Lazy load non-critical components
- **Animation Performance**: GPU-accelerated animations
- **Bundle Size**: Optimize for fast loading

## 9. Design Handoff Specifications

### 9.1 Developer Assets
- **Design Files**: Figma files with specs and assets
- **Icon Library**: SVG sprite or individual files
- **Color Tokens**: CSS custom properties
- **Component Library**: Storybook or similar documentation

### 9.2 Quality Assurance
- **Cross-Browser**: Chrome, Firefox, Safari, Edge
- **Device Testing**: iOS and Android devices
- **Accessibility Testing**: Screen reader and keyboard testing
- **Performance Testing**: Lighthouse audits

### 9.3 Maintenance
- **Design System Updates**: Versioned releases
- **Component Updates**: Backward compatibility
- **Documentation**: Keep specs updated with changes
- **User Feedback**: Incorporate usability findings

---

## Summary

This UI design system provides comprehensive specifications for DevbrainAI's visual design, ensuring consistent, accessible, and professional user experiences across all platforms. The design emphasizes clarity, modern aesthetics, and usability while supporting the complex features of AI-powered conversation, real-time visualization, and team collaboration.

Key design principles:
- **Clarity**: Clear hierarchy and readable typography
- **Consistency**: Unified design system across all interfaces
- **Accessibility**: WCAG AA compliance and inclusive design
- **Performance**: Optimized for fast loading and smooth interactions
- **Scalability**: Flexible system that grows with the product

The design successfully balances professional credibility with approachable usability, making AI-powered business consulting feel accessible to founders while providing developers with the technical clarity they need.