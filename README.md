# Search Schedule Selector

A modern, interactive React component for selecting weekly schedules in split-lease arrangements. Built with TypeScript, styled-components, and Framer Motion.

![Component Preview](https://img.shields.io/badge/React-18.x-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue) ![License](https://img.shields.io/badge/license-MIT-green)

## Features

✅ **Click & Drag Selection** - Select individual days or drag across multiple days
✅ **Visual Feedback** - Smooth animations and hover effects using Framer Motion
✅ **Validation** - Real-time validation for 2-5 contiguous days
✅ **Error Handling** - Animated error popup with clear messaging
✅ **Accessibility** - ARIA labels, keyboard navigation, focus states
✅ **Responsive Design** - Adapts to mobile, tablet, and desktop screens
✅ **Modern Styling** - Gradient backgrounds, glassmorphism effects, smooth transitions
✅ **Type Safety** - Full TypeScript support

## Installation

```bash
npm install framer-motion styled-components
```

## Usage

### Basic Example

```tsx
import { SearchScheduleSelector } from './components/SearchScheduleSelector';

function App() {
  const handleSelectionChange = (days) => {
    console.log('Selected days:', days);
  };

  const handleError = (error) => {
    console.error('Selection error:', error);
  };

  return (
    <SearchScheduleSelector
      onSelectionChange={handleSelectionChange}
      onError={handleError}
    />
  );
}
```

### Advanced Example with Options

```tsx
import { SearchScheduleSelector } from './components/SearchScheduleSelector';

function App() {
  return (
    <SearchScheduleSelector
      minDays={3}
      maxDays={4}
      requireContiguous={true}
      initialSelection={[0, 1, 2]} // Monday, Tuesday, Wednesday
      onSelectionChange={(days) => {
        console.log('Selected:', days.map(d => d.fullName));
      }}
      onError={(error) => {
        alert(error);
      }}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onSelectionChange` | `(days: Day[]) => void` | - | Callback fired when selection changes |
| `onError` | `(error: string) => void` | - | Callback fired when validation error occurs |
| `listing` | `Listing` | - | Optional listing data to filter against |
| `className` | `string` | - | Custom CSS class name |
| `minDays` | `number` | `2` | Minimum number of days that can be selected |
| `maxDays` | `number` | `5` | Maximum number of days that can be selected |
| `requireContiguous` | `boolean` | `true` | Whether to require contiguous day selection |
| `initialSelection` | `number[]` | `[]` | Initial selected days (array of indices 0-6) |

## Types

### Day

```typescript
interface Day {
  id: string;
  singleLetter: string; // "M", "T", "W", etc.
  fullName: string;     // "Monday", "Tuesday", etc.
  index: number;        // 0-6
}
```

### Listing

```typescript
interface Listing {
  id: string;
  title?: string;
  availableDays?: number[];
}
```

## Validation Rules

The component enforces the following validation rules by default:

1. **Minimum Selection**: At least 2 days must be selected
2. **Maximum Selection**: No more than 5 days can be selected
3. **Contiguous Days**: Selected days must be consecutive (e.g., Mon-Tue-Wed, not Mon-Wed-Fri)

All validation rules are configurable via props.

## Interaction Methods

### Click Selection
- Click individual day cells to toggle selection
- Perfect for non-sequential selections (when `requireContiguous` is false)

### Drag Selection
- Click and hold on a day, then drag to adjacent days
- Automatically selects all days in the range
- Ideal for quickly selecting consecutive days

## Styling

The component uses styled-components for styling. You can customize the appearance by:

1. **CSS Classes**: Pass a `className` prop
2. **Styled Components**: Wrap in a styled container
3. **Theme Provider**: Use styled-components ThemeProvider

### Custom Styling Example

```tsx
import styled from 'styled-components';
import { SearchScheduleSelector } from './components/SearchScheduleSelector';

const CustomSelector = styled(SearchScheduleSelector)`
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  border-radius: 20px;
`;

function App() {
  return <CustomSelector />;
}
```

## Accessibility

The component is built with accessibility in mind:

- ✅ **ARIA Labels**: All interactive elements have descriptive labels
- ✅ **Keyboard Navigation**: Full keyboard support
- ✅ **Focus States**: Clear visual focus indicators
- ✅ **Screen Readers**: Semantic HTML and ARIA attributes
- ✅ **WCAG 2.1 AA**: Meets accessibility standards

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Credits

Created by Split Lease
Built with ❤️ using React, TypeScript, and Framer Motion

## Support

For issues and questions, please visit:
- GitHub Issues: [https://github.com/splitleasesharath/search-schedule-selector/issues](https://github.com/splitleasesharath/search-schedule-selector/issues)

## Changelog

### Version 1.0.0
- Initial release
- Basic day selection functionality
- Drag-to-select feature
- Validation and error handling
- Responsive design
- Accessibility features
