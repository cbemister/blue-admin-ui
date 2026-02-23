# CSS Utility Classes Reference Guide

This document provides a comprehensive reference for all utility classes available in the `css/styles.css` file. These utility classes are designed for single-purpose styling and can be used to quickly apply common styles without writing custom CSS.

## Table of Contents

1. [Spacing Utilities](#spacing-utilities)
2. [Typography Utilities](#typography-utilities)
3. [Layout Utilities](#layout-utilities)
4. [Color Utilities](#color-utilities)
5. [Border Utilities](#border-utilities)
6. [Responsive Design Utilities](#responsive-design-utilities)
7. [Most Commonly Used Classes](#most-commonly-used-classes)

---

## Spacing Utilities

### Bootstrap-Style Spacing (Responsive Editor Context)

**Format:** `.responsive-editor .{property}{sides}-{size}`

**Properties:**
- `m` - margin
- `p` - padding

**Sides:**
- `t` - top
- `b` - bottom
- `l` - left
- `r` - right
- `x` - left and right
- `y` - top and bottom
- (blank) - all sides

**Sizes:**
- `0` - 0
- `1` - 0.25rem
- `2` - 0.5rem
- `3` - 1rem
- `4` - 1.5rem
- `5` - 3rem
- `auto` - auto
- `n1` to `n5` - negative values

**Examples:**
```html
<div class="m-3">Margin 1rem on all sides</div>
<div class="px-4 py-2">Padding 1.5rem horizontal, 0.5rem vertical</div>
<div class="mb-0">No bottom margin</div>
<div class="mx-auto">Centered horizontally</div>
```

### Custom Spacing System (CSS Variables)

**Space Modifiers:** `.--s{size}` (sets --space variable)
- `.--s-9` to `.--s9` (smallest to largest)
- `.--s` (base size: 0.5rem)

**Usage with Custom Classes:**
```html
<div class="--s2 -p">Padding using --s2 space value</div>
<div class="--s1 -m">Margin using --s1 space value</div>
```

### Pixel-Perfect Spacing

**Margins:** `.-m{size}` where size = 0, 1-10, 15, 20, 25, 30, etc.
**Padding:** `.-p{size}` where size = 0, 1-10, 15, 20, 25, 30, etc.

**Directional:**
- `.-mt{size}`, `.-mb{size}`, `.-ml{size}`, `.-mr{size}`
- `.-pt{size}`, `.-pb{size}`, `.-pl{size}`, `.-pr{size}`

**Examples:**
```html
<div class=".-p10">10px padding all sides</div>
<div class=".-mt15 -mb20">15px top margin, 20px bottom margin</div>
```

---

## Typography Utilities

### Font Sizes

**CSS Variable System:** `.--fs{size}`
- `.--fs-9` to `.--fs9` (smallest to largest)
- `.--fs0` (base size: 0.875rem)

**Named Sizes:** `.-fs-{name}`
- `.-fs-xxs` (0.15rem)
- `.-fs-xs` (0.5rem)
- `.-fs-s` (0.75rem)
- `.-fs-sr` (0.9rem)
- `.-fs-lr` (1.1rem)
- `.-fs-l` (1.25rem)
- `.-fs-xl` (1.5rem)
- `.-fs-xxl` (2rem)
- `.-fs-xxxl` (2.25rem)

### Font Weights

**Classes:** `.-fw{weight}`
- `.-fw1` (100) to `.-fw9` (900)
- `.-bold` (bold)

### Text Alignment

**Bootstrap Style:**
- `.responsive-editor .text-left`
- `.responsive-editor .text-center`
- `.responsive-editor .text-right`
- `.responsive-editor .text-justify`

**Custom Style:**
- `.txt-left`
- `.txt-center`
- `.txt-right`

### Text Transform

- `.responsive-editor .text-lowercase`
- `.responsive-editor .text-uppercase`
- `.responsive-editor .text-capitalize`
- `.txt-upper`

### Text Colors

**Bootstrap Colors:**
- `.responsive-editor .text-primary` (#007bff)
- `.responsive-editor .text-secondary` (#6c757d)
- `.responsive-editor .text-success` (#28a745)
- `.responsive-editor .text-info` (#17a2b8)
- `.responsive-editor .text-warning` (#ffc107)
- `.responsive-editor .text-danger` (#dc3545)
- `.responsive-editor .text-light` (#f8f9fa)
- `.responsive-editor .text-dark` (#343a40)
- `.responsive-editor .text-white` (#fff)
- `.responsive-editor .text-muted` (#6c757d)

**Custom Colors:**
- `.txt-red` (#cc0000)
- `.txt-payment` (#ea0029)

**Examples:**
```html
<h1 class="--fs3 -fw7 txt-center">Large, bold, centered heading</h1>
<p class=".-fs-s txt-muted">Small, muted text</p>
<span class="txt-upper -fw6">UPPERCASE BOLD TEXT</span>
```

---

## Layout Utilities

### Display

**Bootstrap Style:**
- `.responsive-editor .d-none`
- `.responsive-editor .d-block`
- `.responsive-editor .d-inline`
- `.responsive-editor .d-inline-block`
- `.responsive-editor .d-flex`
- `.responsive-editor .d-inline-flex`
- `.responsive-editor .d-table`
- `.responsive-editor .d-table-row`
- `.responsive-editor .d-table-cell`

**Custom:**
- `.hidden` (display: none !important)
- `.inline-box` (display: inline-block)

### Flexbox

**Container Classes:**
- `.flex-box` - Basic flex container
- `.flex-column` - Flex direction column
- `.flex-row` - Flex direction row
- `.flex-wrap` - Flex wrap
- `.flex-reverse` - Flex direction row-reverse

**Justify Content:**
- `.flex-center` - justify-content: center
- `.flex-start` - justify-content: flex-start
- `.flex-end` - justify-content: flex-end
- `.flex-between` - justify-content: space-between
- `.flex-around` - justify-content: space-around
- `.flex-evenly` - justify-content: space-evenly

**Align Items:**
- `.align-center` - align-items: center
- `.align-start` - align-items: flex-start
- `.align-end` - align-items: flex-end
- `.align-baseline` - align-items: baseline

**Flex Children:**
- `.flex-auto > *` - flex: 1 1 auto
- `.flex-equal > *` - flex: 1 1
- `.shrink-grow` - flex: 1 1

### Positioning

**Bootstrap Style:**
- `.responsive-editor .position-static`
- `.responsive-editor .position-relative`
- `.responsive-editor .position-absolute`
- `.responsive-editor .position-fixed`
- `.responsive-editor .position-sticky`

**Custom:**
- `.-posrel` (position: relative)

### Width & Height

**Bootstrap Style:**
- `.responsive-editor .w-25`, `.w-50`, `.w-75`, `.w-100`, `.w-auto`
- `.responsive-editor .h-25`, `.h-50`, `.h-75`, `.h-100`, `.h-auto`

**Custom:**
- `.-w-full` (100vw)
- `.-w-100` (100%)
- `.-w-50` (50%)
- `.-w-33` (33.33%)
- `.-w-25` (25%)
- `.-w-50w` (50vw)

### Float & Clear

- `.responsive-editor .float-left`
- `.responsive-editor .float-right`
- `.responsive-editor .float-none`
- `.fleft` (float: left)
- `.clr` (clear: both)

**Examples:**
```html
<div class="flex-box flex-center align-center">
  <div class="flex-auto">Auto-sizing flex item</div>
  <div class="-w-25">25% width item</div>
</div>

<div class="d-flex justify-content-between">
  <span>Left</span>
  <span>Right</span>
</div>
```

---

## Color Utilities

### Background Colors

**Bootstrap Style:**
- `.responsive-editor .bg-primary` (#007bff)
- `.responsive-editor .bg-secondary` (#6c757d)
- `.responsive-editor .bg-success` (#28a745)
- `.responsive-editor .bg-info` (#17a2b8)
- `.responsive-editor .bg-warning` (#ffc107)
- `.responsive-editor .bg-danger` (#dc3545)
- `.responsive-editor .bg-light` (#f8f9fa)
- `.responsive-editor .bg-dark` (#343a40)
- `.responsive-editor .bg-white` (#fff)
- `.responsive-editor .bg-transparent`

**Custom Backgrounds:**
- `.-bg-white` (var(--white))
- `.-bg-gray` (var(--gray))
- `.-bg-dark-gray` (var(--dark-gray))
- `.-bg-black-gray` (var(--black-gray))
- `.-bg-black` (var(--black))
- `.-bg-light` (var(--light))
- `.-bg-light-gray` (var(--light-gray))
- `.-bg-none` (transparent)

### Social Media Brand Colors

**Background Classes:** `.social-media__container .bg-ogcolor-{platform}`
**Text Classes:** `.social-media__container .c-ogcolor-{platform}`
**SVG Classes:** `svg.ogcolor-{platform}`

**Platforms:**
- `facebook` (#3a5998)
- `twitter` (#00aced)
- `x-twitter` (#14171A)
- `linkedin` (#0077B5)
- `youtube` (#FF0000)
- `instagram` (#f23995)
- `tiktok` (#ff0050)
- `pinterest` (#E60023)
- `blogger` (#FF5722)

**Examples:**
```html
<div class="bg-primary text-white p-3">Primary colored box</div>
<div class="-bg-light -p15">Light background with custom padding</div>
<svg class="ogcolor-facebook"><!-- Facebook icon --></svg>
```

---

## Border Utilities

### Border Width

**Bootstrap Style:**
- `.responsive-editor .border` (1px solid)
- `.responsive-editor .border-0` (no border)
- `.responsive-editor .border-top`
- `.responsive-editor .border-right`
- `.responsive-editor .border-bottom`
- `.responsive-editor .border-left`
- `.responsive-editor .border-top-0`
- `.responsive-editor .border-right-0`
- `.responsive-editor .border-bottom-0`
- `.responsive-editor .border-left-0`

**Custom:**
- `.-b0` (border: none)
- `.-b` (border-width: 1px)
- `.-b2` (border-width: 2px)
- `.-bt` (border-top-width: 1px)
- `.-bb` (border-bottom-width: 1px)
- `.-bv` (border-top and bottom: 1px)
- `.-bh` (border-left and right: 1px)

### Border Colors

**Bootstrap Style:**
- `.responsive-editor .border-primary`
- `.responsive-editor .border-secondary`
- `.responsive-editor .border-success`
- `.responsive-editor .border-info`
- `.responsive-editor .border-warning`
- `.responsive-editor .border-danger`
- `.responsive-editor .border-light`
- `.responsive-editor .border-dark`
- `.responsive-editor .border-white`

### Border Radius

- `.-round` (border-radius: 0.3rem)

**Examples:**
```html
<div class="border border-primary -round p-3">Rounded primary border</div>
<div class="-b2 -bt">2px border with 1px top border</div>
```

---

## Responsive Design Utilities

All Bootstrap-style utilities support responsive breakpoints:

**Breakpoints:**
- `sm` - ≥576px
- `md` - ≥768px  
- `lg` - ≥992px
- `xl` - ≥1200px

**Format:** `.responsive-editor .{utility}-{breakpoint}-{value}`

**Examples:**
```html
<!-- Hide on mobile, show on tablet+ -->
<div class="d-none d-md-block">Visible on medium screens and up</div>

<!-- Different text alignment per breakpoint -->
<div class="text-center text-md-left">Centered on mobile, left on desktop</div>

<!-- Responsive spacing -->
<div class="p-2 p-md-4">Small padding on mobile, large on desktop</div>

<!-- Responsive flexbox -->
<div class="flex-column flex-md-row">Stack on mobile, row on desktop</div>
```

---

## Most Commonly Used Classes

### Essential Spacing
- `.m-0`, `.p-0` - Remove margin/padding
- `.mx-auto` - Center horizontally
- `.p-3`, `.m-3` - Standard spacing (1rem)
- `.-p10`, `.-m10` - 10px spacing

### Essential Layout
- `.d-flex` - Flex container
- `.flex-center` - Center content
- `.flex-between` - Space between items
- `.d-none`, `.hidden` - Hide elements
- `.-w-100` - Full width

### Essential Typography
- `.text-center` - Center text
- `.-fw7` - Bold text
- `.--fs1` - Larger text
- `.txt-upper` - Uppercase text

### Essential Colors
- `.bg-primary` - Primary background
- `.text-white` - White text
- `.text-muted` - Muted text color

### Essential Responsive
- `.d-none .d-md-block` - Hide on mobile
- `.text-center .text-md-left` - Responsive alignment
- `.p-2 .p-md-4` - Responsive spacing

**Quick Reference Example:**
```html
<div class="d-flex flex-center bg-primary text-white p-3 -round">
  <span class="--fs2 -fw7">Centered, large, bold text in primary box</span>
</div>
```

---

## Usage Tips

1. **Combine Systems**: You can mix Bootstrap-style and custom utilities
2. **Responsive First**: Use responsive variants for mobile-first design
3. **CSS Variables**: Custom spacing system (--s) provides consistent scaling
4. **Specificity**: Most utilities use `!important` for reliable application
5. **Context**: Bootstrap utilities require `.responsive-editor` context

## Advanced Utilities

### Layout Components (Custom System)

**Box Components:**
- `.box-lc` - Basic box with padding and outline
- `.bg-box` - Box with background and border
- `.glass-box` - Transparent box
- `.shadow-box` - Box with shadow
- `.inline-box` - Inline-block display

**Layout Patterns:**
- `.group-lc` - Group layout with spacing
- `.sidebar-lc` - Sidebar layout pattern
- `.switcher-lc` - Responsive switching layout

### Skeleton Loading

- `.skeleton` - Basic skeleton loader
- `.skeleton-txt` - Text skeleton with shimmer
- `.skeleton-slider` - Image skeleton with shimmer

### Form Utilities

- `.invalid > :is(input, select, textarea)` - Invalid form styling
- `.note-box` - General note container
- `.note-success` - Success message styling
- `.note-error` - Error message styling

### Special Effects

- `.-round` - Border radius
- `.txt-note` - Italic text style
- `.cert-txt-transform` - Certificate text transform

## Browser Support & Performance

- **CSS Variables**: Modern browser support required for custom spacing system
- **Flexbox**: Full support in all modern browsers
- **Performance**: Utility classes are optimized for minimal CSS output
- **Responsive**: Mobile-first approach with progressive enhancement

## Migration Guide

### From Custom CSS to Utilities

**Before:**
```css
.my-component {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  margin-bottom: 2rem;
  background-color: #007bff;
  color: white;
  border-radius: 0.3rem;
}
```

**After:**
```html
<div class="d-flex flex-center align-center p-3 mb-4 bg-primary text-white -round">
  <!-- content -->
</div>
```

### Combining Systems

You can mix different utility systems:
```html
<!-- Bootstrap + Custom spacing + Custom typography -->
<div class="d-flex bg-primary .-p15 --fs2">
  Mixed utility systems
</div>
```

## Troubleshooting

### Common Issues

1. **Utilities not applying**: Check if `.responsive-editor` context is needed
2. **Spacing inconsistencies**: Ensure consistent use of either Bootstrap or custom spacing
3. **Responsive not working**: Verify breakpoint syntax and order
4. **Specificity conflicts**: Utilities use `!important` but custom CSS might override

### Best Practices

1. **Consistency**: Choose one spacing system per project section
2. **Responsive Design**: Always test across breakpoints
3. **Performance**: Prefer utilities over custom CSS for common patterns
4. **Maintainability**: Document any custom utility combinations
5. **Accessibility**: Ensure color utilities maintain sufficient contrast

This comprehensive reference covers all major utility classes available in the CSS file. For edge cases or specific styling needs, refer to the full CSS file or create custom classes following the established patterns.
