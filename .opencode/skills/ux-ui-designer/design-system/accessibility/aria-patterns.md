# WAI-ARIA Patterns

Reference for 15+ interactive components. Follow the [APG (ARIA Authoring Practices Guide)](https://www.w3.org/WAI/ARIA/apg/patterns/) as the authoritative source.

---

## Core ARIA Rules

1. **Use semantic HTML first.** ARIA supplements, never replaces.
2. **Never override native semantics** (don't add `role="button"` to `<button>`).
3. **Accessible name is required** on every interactive element.
4. **Not all ARIA is supported equally** — test with real assistive technology.

---

## Accordion

```tsx
<div>
  <h3>
    <button
      aria-expanded={open}
      aria-controls="panel-1"
      id="accordion-header-1"
    >
      Section Title
    </button>
  </h3>
  <div
    id="panel-1"
    role="region"
    aria-labelledby="accordion-header-1"
    hidden={!open}
  >
    Content
  </div>
</div>
```

**Keyboard:** Enter/Space toggle | Tab moves to next accordion | Arrow keys optional

---

## Alert / Toast

```tsx
// Assertive (error, warning) — interrupts screen reader immediately
<div role="alert">Error: Invalid email address.</div>

// Polite (info, success) — waits for current announcement to finish
<div role="status" aria-live="polite">Profile saved successfully.</div>
```

**Rules:** Inject into DOM dynamically — pre-rendered elements won't announce.

---

## Breadcrumb

```tsx
<nav aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Home</a></li>
    <li><a href="/settings">Settings</a></li>
    <li><a href="/settings/security" aria-current="page">Security</a></li>
  </ol>
</nav>
```

---

## Button (Toggle)

```tsx
<button
  type="button"
  aria-pressed={isActive}   // boolean or "mixed"
  aria-label="Bold"
>
  <BoldIcon aria-hidden="true" />
</button>
```

---

## Carousel / Slideshow

```tsx
<section aria-roledescription="carousel" aria-label="Featured products">
  <div aria-live="off" aria-atomic="false">
    <div
      role="group"
      aria-roledescription="slide"
      aria-label="1 of 5"
    >
      Slide content
    </div>
  </div>
  <button aria-label="Previous slide" onClick={prev}>‹</button>
  <button aria-label="Next slide" onClick={next}>›</button>
  <button aria-label="Pause auto-rotation" onClick={pause}>⏸</button>
</section>
```

---

## Checkbox (Group)

```tsx
<fieldset>
  <legend>Notification preferences</legend>
  <label>
    <input type="checkbox" name="email" /> Email
  </label>
  <label>
    <input type="checkbox" name="sms" /> SMS
  </label>
</fieldset>
```

**Indeterminate:**
```tsx
// JS only:
checkboxRef.current.indeterminate = true
// aria:
<input type="checkbox" aria-checked="mixed" />
```

---

## Combobox (Autocomplete)

```tsx
<div role="combobox" aria-expanded={open} aria-haspopup="listbox" aria-owns="listbox-id">
  <input
    type="text"
    aria-autocomplete="list"
    aria-controls="listbox-id"
    aria-activedescendant={activeItem ? `option-${activeItem}` : undefined}
  />
</div>
<ul id="listbox-id" role="listbox" aria-label="Suggestions">
  <li id="option-1" role="option" aria-selected={selected === 1}>Option 1</li>
</ul>
```

**Keyboard:** Arrow Down/Up navigate | Enter select | Escape close

---

## Dialog / Modal

```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"   // optional
  tabIndex={-1}   // to receive programmatic focus
>
  <h2 id="dialog-title">Confirm action</h2>
  <p id="dialog-description">This cannot be undone.</p>
  {/* content */}
  <button onClick={onClose}>Cancel</button>
  <button onClick={onConfirm}>Confirm</button>
</div>
```

**Focus management:** trap focus within dialog | Escape closes | restore focus to trigger on close.

---

## Disclosure (Show/Hide)

```tsx
<button
  type="button"
  aria-expanded={visible}
  aria-controls="disclosure-panel"
>
  Advanced options
</button>
<div id="disclosure-panel" hidden={!visible}>
  {/* content */}
</div>
```

---

## Link vs Button

```
Use <a href>   for navigation (changes URL or downloads)
Use <button>   for actions (submits form, opens modal, toggles state)
```

Never `<a>` without `href` — use `<button>` instead.

---

## Listbox

```tsx
<ul role="listbox" aria-label="Choose a color" aria-multiselectable={multi}>
  {options.map(opt => (
    <li
      key={opt.value}
      role="option"
      aria-selected={selected.includes(opt.value)}
      id={`opt-${opt.value}`}
      tabIndex={focused === opt.value ? 0 : -1}
    >
      {opt.label}
    </li>
  ))}
</ul>
```

**Keyboard:** Arrow keys navigate | Space selects | Shift+Arrow multi-select

---

## Menu / Menubar

```tsx
<ul role="menubar" aria-label="Editor tools">
  <li role="none">
    <button role="menuitem" aria-haspopup="menu" aria-expanded={fileOpen}>
      File
    </button>
    <ul role="menu" hidden={!fileOpen}>
      <li role="none"><button role="menuitem">New</button></li>
      <li role="separator" />
      <li role="none"><button role="menuitem">Save</button></li>
    </ul>
  </li>
</ul>
```

**Keyboard:** Arrow Right/Left moves between top items | Arrow Down/Up inside menu | Escape closes | Home/End first/last item

---

## Pagination

```tsx
<nav aria-label="Pagination">
  <a href="?page=1" aria-label="Previous page">‹</a>
  <a href="?page=1">1</a>
  <a href="?page=2" aria-current="page">2</a>
  <a href="?page=3">3</a>
  <a href="?page=3" aria-label="Next page">›</a>
</nav>
```

---

## Radio Group

```tsx
<fieldset>
  <legend>Preferred contact method</legend>
  <label><input type="radio" name="contact" value="email" /> Email</label>
  <label><input type="radio" name="contact" value="phone" /> Phone</label>
</fieldset>
```

**Keyboard:** Arrow keys move between options within group

---

## Slider

```tsx
<div
  role="slider"
  aria-valuemin={0}
  aria-valuemax={100}
  aria-valuenow={value}
  aria-valuetext={`${value}%`}  // for non-numeric meaning
  aria-label="Volume"
  tabIndex={0}
/>
```

**Keyboard:** Arrow Right/Up increase | Arrow Left/Down decrease | Home/End min/max | Page Up/Down large step

---

## Spinbutton (Number Input)

```tsx
<input
  type="number"
  role="spinbutton"
  aria-valuemin={0}
  aria-valuemax={100}
  aria-valuenow={value}
  aria-label="Quantity"
/>
```

---

## Switch (Toggle)

```tsx
<button
  type="button"
  role="switch"
  aria-checked={enabled}
  aria-label="Enable dark mode"
>
  <span aria-hidden="true">{enabled ? 'On' : 'Off'}</span>
</button>
```

**Keyboard:** Space toggles | Enter also activates

---

## Tabs

```tsx
<div>
  <div role="tablist" aria-label="Settings sections">
    {tabs.map(tab => (
      <button
        key={tab.id}
        role="tab"
        id={`tab-${tab.id}`}
        aria-selected={active === tab.id}
        aria-controls={`panel-${tab.id}`}
        tabIndex={active === tab.id ? 0 : -1}
      >
        {tab.label}
      </button>
    ))}
  </div>
  {tabs.map(tab => (
    <div
      key={tab.id}
      role="tabpanel"
      id={`panel-${tab.id}`}
      aria-labelledby={`tab-${tab.id}`}
      hidden={active !== tab.id}
      tabIndex={0}
    >
      {tab.content}
    </div>
  ))}
</div>
```

**Keyboard:** Left/Right Arrow moves between tabs (auto-activates or manual) | Tab moves to panel | Shift+Tab back to tab list

---

## Tree View

```tsx
<ul role="tree" aria-label="File explorer">
  <li role="treeitem" aria-expanded={expanded} aria-level={1}>
    <span>src/</span>
    <ul role="group">
      <li role="treeitem" aria-level={2}>
        <span>index.ts</span>
      </li>
    </ul>
  </li>
</ul>
```

**Keyboard:** Arrow Right expand/enter | Arrow Left collapse/up | Arrow Up/Down prev/next visible | Home/End first/last
