---
name: FileConvert
colors:
  surface: '#f5faf8'
  surface-dim: '#d6dbd9'
  surface-bright: '#f5faf8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f5f2'
  surface-container: '#eaefed'
  surface-container-high: '#e4e9e7'
  surface-container-highest: '#dee4e1'
  on-surface: '#171d1c'
  on-surface-variant: '#3d4947'
  inverse-surface: '#2c3130'
  inverse-on-surface: '#edf2f0'
  outline: '#6d7a77'
  outline-variant: '#bcc9c6'
  surface-tint: '#006a61'
  primary: '#00685f'
  on-primary: '#ffffff'
  primary-container: '#008378'
  on-primary-container: '#f4fffc'
  inverse-primary: '#6bd8cb'
  secondary: '#006e2d'
  on-secondary: '#ffffff'
  secondary-container: '#7cf994'
  on-secondary-container: '#007230'
  tertiary: '#8d4b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#b15f00'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#89f5e7'
  primary-fixed-dim: '#6bd8cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#005049'
  secondary-fixed: '#7ffc97'
  secondary-fixed-dim: '#62df7d'
  on-secondary-fixed: '#002109'
  on-secondary-fixed-variant: '#005320'
  tertiary-fixed: '#ffdcc3'
  tertiary-fixed-dim: '#ffb77d'
  on-tertiary-fixed: '#2f1500'
  on-tertiary-fixed-variant: '#6e3900'
  background: '#f5faf8'
  on-background: '#171d1c'
  surface-variant: '#dee4e1'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style
The brand personality is professional, efficient, and high-end. It positions itself as a premium utility for professionals and students who value a clean, distraction-free environment for document management. Unlike the utilitarian and often cluttered interfaces of competitors, this design system focuses on a **Corporate Modern** aesthetic with a touch of **Soft Minimalism**. 

The UI evokes a sense of "digital calm" through generous whitespace and a sophisticated "Glass-on-Photo" approach. By integrating high-quality, desaturated productivity photography (office textures, architectural lines, or soft focus work setups) into the background layers, the product feels more like a lifestyle workspace than a basic tool.

## Colors
The palette is led by a sophisticated **Teal Green**, signifying both stability and freshness. 

- **Primary (Teal):** Used for main actions, active states, and focus indicators.
- **Success (Green):** Reserved for completed conversion states and confirmations.
- **Error (Red):** Used for file upload failures or system warnings.
- **Premium (Amber):** A high-contrast accent used exclusively for "Pro" features and badges to create a sense of value.
- **Neutral Surface:** A cool-toned light gray (#F7F9FB) serves as the canvas, preventing the clinical feel of pure white while allowing white cards to pop with subtle depth.

## Typography
The system utilizes **Inter** for its neutral, systematic, and highly legible characteristics. The type hierarchy is designed for clarity in tool-heavy environments. 

- **Display styles** use tight letter-spacing and bold weights to ground the landing pages and headers.
- **Body text** utilizes a generous line height (1.5 - 1.6) to ensure instructions are easy to digest.
- **Labels** are slightly tracked out to provide a professional, organized feel for metadata and file details.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy for content-heavy pages and a **Fluid** model for the conversion workspace. 

- **The Header:** Sticky with a backdrop blur (blur: 12px) to maintain visibility over high-quality background photos. Dropdowns use a 2-column layout for "Tools" to ensure SEO-rich categorization.
- **The Grid:** A 12-column system on desktop, collapsing to 4 columns on mobile. 
- **The Workspace:** Large, centered "Drop Zones" are given maximum breathing room, using the `stack-lg` unit to separate the tool from the instructional content below.
- **Footer:** A 5-column SEO-optimized grid with clear categorization of PDF, Image, and Document tools.

## Elevation & Depth
Depth is achieved through **Tonal Layering** and **Ambient Shadows**. 

1. **Background Layer:** High-quality photos with a 40% white overlay or desaturation to ensure text readability.
2. **Main Surface:** Solid white (#FFFFFF) with a soft, diffused shadow (0px 4px 20px rgba(0,0,0,0.05)) to separate tool cards from the background.
3. **Interactive Elements:** Buttons and hover-states increase shadow depth slightly to indicate "lift."
4. **Tooltips & Dropdowns:** Utilize a subtle teal-tinted border (1px, 10% opacity) alongside shadows to reinforce brand identity in the small details.

## Shapes
The design system employs a **Rounded** shape language to feel modern and approachable. 
- **Standard UI elements** (Inputs, Buttons, Cards) use a **12px (0.75rem)** radius.
- **Tool Icons** and large file preview containers use a larger **16px (1rem)** radius to appear friendlier.
- **Premium Badges** use a **Pill-shape** to distinguish them from standard functional buttons.

## Components

### Buttons
- **Primary:** Solid Teal (#0D9488) with white text. 12px rounded corners.
- **Secondary:** White background with a 1px Teal border.
- **Tertiary:** Ghost style, no border, teal text, light teal background on hover.

### Tool Cards (The Hero Component)
The core tool cards (e.g., "PDF to Word") should have a white background, a large icon at the top, and a subtle description. On hover, the card should lift slightly (shadow increase) and the icon should scale 5%.

### Input & File Uploaders
- **Dashed Drop Zones:** 2px dashed border in light gray, turning solid Teal on "drag-over."
- **Inputs:** 1px gray border (#D1D5DB), focused state uses a 2px Teal ring with 20% opacity.

### Chips & Badges
- **Premium Badge:** Amber background with dark amber text. Bold and pill-shaped.
- **File Type Chips:** Small, desaturated versions of their brand colors (e.g., Red for PDF, Blue for Docx) with 12px rounding.

### Lists
- Found in the SEO footer and dropdowns. Use a clean, no-bullet style with 8px vertical spacing and a subtle teal underline or text color shift on hover.