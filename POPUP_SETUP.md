# 📱 Inquiry Popup - Implementation Guide

## ✅ What's Been Added

A popup component that appears on **ALL pages** of your Arambha app:

- ✅ Appears 8 seconds after page loads
- ✅ Repeats every 30 seconds if dismissed
- ✅ Blurred background (backdrop blur effect)
- ✅ Close button (X icon)
- ✅ WhatsApp integration
- ✅ Fully responsive (mobile, tablet, desktop)
- ✅ Smooth animations (framer-motion)

---

## 📁 Files Created

| File | Purpose |
|------|---------|
| `components/layout/InquiryPopup.tsx` | Popup component logic |
| `components/layout/InquiryPopup.module.css` | Popup styling |

### Modified File
| File | What Changed |
|------|--------------|
| `app/layout.tsx` | Added `<InquiryPopup />` to RootLayout |

---

## 🎨 How It Looks

```
┌─────────────────────────────────────┐
│  [Image]  │  Ready to Transform?  │
│  (400px)  │  Expert consultation  │
│           │  • Custom designs     │
│           │  • Quality execution  │
│           │  [WhatsApp Button]    │
│           │  "No pressure..."     │
└─────────────────────────────────────┘
```

---

## 🛠️ How to Customize

### 1️⃣ **Change WhatsApp Number**

Edit `components/layout/InquiryPopup.tsx`:

```tsx
// Line with href - change the phone number
href="https://wa.me/919999999999?text=..."
//                          ↑↑↑↑↑↑↑↑↑↑
//                      Change this number
```

Replace `919999999999` with your WhatsApp number (country code + number, no +).

---

### 2️⃣ **Change Popup Times**

Edit `components/layout/InquiryPopup.tsx`:

```tsx
// First popup appears after this many milliseconds
firstTimer = setTimeout(() => {
  setIsOpen(true);
  setHasOpenedOnce(true);
}, 8000);  // ← 8000ms = 8 seconds

// Repeat popup every this many milliseconds
repeatTimer = setInterval(() => {
  setIsOpen(true);
}, 30000);  // ← 30000ms = 30 seconds
```

---

### 3️⃣ **Change Title/Description**

Edit `components/layout/InquiryPopup.tsx`:

```tsx
<h2 className={styles.title}>
  Ready to Transform Your Space?  // ← Change title
</h2>

<p className={styles.description}>
  Get expert guidance from our design team...  // ← Change description
</p>
```

---

### 4️⃣ **Change Popup Image**

The popup looks for an image at `/public/popup-image.jpg`.

**To add an image:**
1. Add an image file to `/public/` folder (e.g., `popup.jpg`)
2. Edit `components/layout/InquiryPopup.tsx`:

```tsx
<img
  src="/popup-image.jpg"  // ← Change filename here
  alt="Get in touch with Arambha"
/>
```

If no image exists, it will show a gray background instead (gracefully handles missing image).

---

### 5️⃣ **Change Colors**

Edit `components/layout/InquiryPopup.module.css`:

```css
/* Background overlay darkness */
.overlay {
  background: rgba(0, 0, 0, 0.5);  /* Change second number (0.5 = 50%) */
}

/* WhatsApp button color */
.whatsappButton {
  background: #25D366;  /* Green - change to any color */
}

/* Title color */
.title {
  color: #222;  /* Dark gray - change hex code */
}
```

---

### 6️⃣ **Change Popup Size**

Edit `components/layout/InquiryPopup.module.css`:

```css
.popup {
  max-width: 700px;  /* ← Change max width */
}

.contentSection {
  padding: 2.5rem;  /* ← Change padding/spacing */
}

.title {
  font-size: 1.75rem;  /* ← Change title size */
}
```

---

## 🎯 Current Settings

| Setting | Value |
|---------|-------|
| **First appearance** | 8 seconds |
| **Repeat interval** | 30 seconds |
| **Background blur** | 4px |
| **WhatsApp number** | 919999999999 |
| **Max popup width** | 700px |
| **Mobile breakpoint** | 768px |

---

## 📱 Responsive Behavior

| Device | Layout |
|--------|--------|
| **Desktop** | Image (left 50%) + Content (right 50%) |
| **Tablet** | Image (left 50%) + Content (right 50%) |
| **Mobile** | Image (full) + Content (full) - stacked |

---

## 🚀 Testing

1. Start your dev server:
```bash
npm run dev
```

2. Go to any page (e.g., http://localhost:3000)

3. Wait 8 seconds → Popup appears

4. Close popup (click X)

5. Wait 30 seconds → Popup appears again

6. Click "Chat on WhatsApp" → Opens WhatsApp

---

## 🔧 Advanced Customization

### Change Feature Icons

Edit `components/layout/InquiryPopup.tsx`:

```tsx
<div className={styles.feature}>
  <span className={styles.icon}>✓</span>  // ← Change icon (✓, ✨, 🎯, etc.)
  <p>Expert consultation</p>
</div>
```

---

### Change Animation Speed

Edit `components/layout/InquiryPopup.tsx`:

```tsx
<motion.div
  transition={{ duration: 0.4, type: "spring", stiffness: 300 }}
  //          ↑ Change 0.4 for smoother/faster animation
></motion.div>
```

---

### Disable Popup Temporarily

In `components/layout/InquiryPopup.tsx`, change the condition:

```tsx
if (!hasOpenedOnce && false) {  // ← Add "false &&" to disable
```

---

## 📍 Where It Appears

The popup appears on:
- ✅ Home page (`/`)
- ✅ Furniture page (`/furniture`)
- ✅ Interiors page (`/interiors`)
- ✅ Services page (`/services`)
- ✅ Contact page (`/contact`)
- ✅ Gallery page (`/gallery`)
- ✅ Admin page (`/admin`)
- ✅ ALL pages (because it's in the root layout)

---

## ❌ Common Issues

### Popup not appearing?
→ Check browser console (F12) for errors  
→ Verify times are in milliseconds (8000 = 8 sec)

### WhatsApp button not working?
→ Check WhatsApp number format (no + sign needed)  
→ Make sure it's a valid number with country code

### Image not showing?
→ Verify image exists in `/public/` folder  
→ Check filename matches exactly (case-sensitive)

### Popup appears too often?
→ Increase the interval in milliseconds  
→ (30000 = 30 sec, 60000 = 60 sec)

---

## 💡 Pro Tips

1. **Use a professional image** - Add a nice design/interior photo to `/public/popup-image.jpg`

2. **Match your branding** - Change colors and fonts to match your site

3. **Personalize message** - Make it specific to what you're offering

4. **Update WhatsApp number** - Add your actual WhatsApp business number

5. **Test on mobile** - Use DevTools (F12) to test responsive behavior

---

## 📞 WhatsApp Integration

The button currently sends:
```
"Hello Arambha! I want to discuss my design project. Can you help me?"
```

To change the pre-filled message, edit the `href`:

```tsx
href="https://wa.me/919999999999?text=YOUR%20CUSTOM%20MESSAGE%20HERE"
```

**URL encode special characters:**
- Space = `%20`
- Newline = `%0A`
- Apostrophe = `%27`

---

## ✨ Summary

Your Arambha app now has:
- ✅ Automatic inquiry popup on all pages
- ✅ Fully customizable timing & content
- ✅ WhatsApp integration
- ✅ Beautiful, responsive design
- ✅ Smooth animations
- ✅ Professional appearance

**Next: Add your popup image to `/public/popup-image.jpg` for better UX!** 📸
