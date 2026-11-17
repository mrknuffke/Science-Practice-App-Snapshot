# Toast Notification System

## Overview
A lightweight, minimal toast notification system built with React Context API and Tailwind CSS.

## Features
- ✅ 4 toast types: success, error, info, warning
- ✅ Auto-dismiss after 4 seconds (customizable)
- ✅ Manual close button
- ✅ Slide-in animation from top-right
- ✅ Glassmorphism styling matching design system
- ✅ Accessible (ARIA labels, semantic HTML)
- ✅ Mobile-friendly

## Usage

### Basic Example

```tsx
import { useToast } from './hooks/useToast';

function MyComponent() {
  const toast = useToast();

  const handleSuccess = () => {
    toast.success('Quiz completed successfully!');
  };

  const handleError = () => {
    toast.error('Failed to load questions. Please try again.');
  };

  const handleInfo = () => {
    toast.info('Your progress has been saved automatically.');
  };

  const handleWarning = () => {
    toast.warning('Session will expire in 5 minutes.');
  };

  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
      <button onClick={handleInfo}>Show Info</button>
      <button onClick={handleWarning}>Show Warning</button>
    </div>
  );
}
```

### Custom Duration

```tsx
// Toast that stays for 8 seconds
toast.success('Important message!', 8000);

// Toast that stays for 2 seconds
toast.error('Quick error', 2000);
```

### Advanced Usage

```tsx
import { useToast } from './hooks/useToast';

function AdvancedComponent() {
  const toast = useToast();

  const handleAction = async () => {
    try {
      await someAsyncOperation();
      toast.success('Operation completed!');
    } catch (error) {
      toast.error(`Failed: ${error.message}`);
    }
  };

  return <button onClick={handleAction}>Perform Action</button>;
}
```

## API Reference

### `useToast()` Hook

Returns an object with the following methods:

#### `success(message: string, duration?: number)`
- Shows a success toast (green)
- **Default duration:** 4000ms (4 seconds)

#### `error(message: string, duration?: number)`
- Shows an error toast (red)
- **Default duration:** 4000ms

#### `info(message: string, duration?: number)`
- Shows an info toast (blue)
- **Default duration:** 4000ms

#### `warning(message: string, duration?: number)`
- Shows a warning toast (yellow)
- **Default duration:** 4000ms

#### `addToast(type: ToastType, message: string, duration?: number)`
- Generic method to show any toast type
- **Types:** 'success' | 'error' | 'info' | 'warning'

#### `removeToast(id: string)`
- Manually remove a toast by ID
- Usually not needed (auto-dismiss handles this)

## Architecture

### Components
- **`Toast.tsx`** - Individual toast component with icon, message, and close button
- **`ToastContainer.tsx`** - Container that positions and manages multiple toasts

### Context
- **`ToastContext.tsx`** - Global state management using React Context API
- **`ToastProvider`** - Wrapper component that provides toast functionality

### Hook
- **`useToast.ts`** - Custom hook for easy access to toast methods

## Styling

Toasts use your existing design system:
- **Colors:** Tailwind color palette (emerald, rose, amber, indigo)
- **Effects:** Glassmorphism (backdrop-blur, transparency)
- **Animations:** Tailwind animate utilities (slide-in, fade-in)
- **Typography:** Existing font system

## Accessibility

- ✅ ARIA `role="alert"` for screen readers
- ✅ `aria-live="polite"` for non-intrusive announcements
- ✅ `aria-label` on close buttons
- ✅ Keyboard-friendly (can be dismissed with close button)

## Common Use Cases

### Form Validation
```tsx
const handleSubmit = (data) => {
  if (!data.email) {
    toast.error('Email is required');
    return;
  }
  toast.success('Form submitted successfully!');
};
```

### API Calls
```tsx
const fetchData = async () => {
  try {
    const response = await api.getData();
    toast.success('Data loaded successfully');
  } catch (err) {
    toast.error('Failed to load data. Please try again.');
  }
};
```

### User Actions
```tsx
const handleCopy = () => {
  navigator.clipboard.writeText(text);
  toast.info('Copied to clipboard!');
};

const handleDelete = () => {
  deleteItem();
  toast.warning('Item deleted');
};
```

### AI Operations
```tsx
const generateQuiz = async () => {
  toast.info('Generating questions...');

  try {
    const questions = await getQuestions();
    toast.success(`Generated ${questions.length} questions!`);
  } catch (err) {
    toast.error('AI service unavailable. Please try again.');
  }
};
```

## Future Enhancements (Optional)

If needed, the system can be extended with:
- [ ] Action buttons (Undo, Retry, etc.)
- [ ] Progress bars for auto-dismiss countdown
- [ ] Toast queue limits (max 3-5 visible at once)
- [ ] Sound effects or haptic feedback
- [ ] Persistent toasts (duration: Infinity)
- [ ] Toast positioning (top-right, top-center, bottom-right, etc.)
- [ ] Custom icons or images
- [ ] Stacking vs inline layout options

---

**Created:** 2026-02-22
**Status:** Production-ready ✅
