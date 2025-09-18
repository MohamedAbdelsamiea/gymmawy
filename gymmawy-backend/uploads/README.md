# Uploads Folder Structure

This directory contains all uploaded files organized by type and access level.

## Folder Structure

```
uploads/
├── content/                    # Public content (accessible to all users)
│   ├── plans/                  # Subscription plan images
│   ├── products/               # Product images (supplements, equipment, etc.)
│   ├── programmes/             # Fitness programme images
│   ├── transformations/        # Before/after transformation photos
│   ├── videos/                 # Public videos (tutorials, demos, etc.)
│   └── documents/              # Public documents (brochures, guides, etc.)
├── payment-proofs/             # Private payment verification documents (admin access only)
└── temp/                       # Temporary files (processing, etc.)
```

## Usage Guidelines

### Content Folder (`uploads/content/`) - PUBLIC
- **Purpose**: Public content accessible to all users
- **Access**: No authentication required
- **Categories**:
  - **`plans/`** - Subscription plan images, pricing displays
  - **`products/`** - Product images (supplements, equipment, merchandise)
  - **`programmes/`** - Fitness programme images, workout plans
  - **`transformations/`** - Before/after photos, success stories
  - **`videos/`** - Tutorial videos, workout demos, promotional content
  - **`documents/`** - Brochures, guides, policies, forms

### Payment Proofs Folder (`uploads/payment-proofs/`) - PRIVATE
- **Purpose**: Payment verification documents
- **Access**: Admin authentication required
- **Use Cases**:
  - Payment screenshots
  - Bank transfer receipts
  - Payment confirmation documents
  - Refund documentation

### Temp Folder (`uploads/temp/`) - SYSTEM
- **Purpose**: Temporary files during processing
- **Access**: System only
- **Use Cases**:
  - Files being processed
  - Temporary uploads
  - Cache files

## File Naming Convention

All files are renamed using UUIDs to prevent conflicts:
- Images: `{uuid}.webp` (converted to WebP format)
- Documents: `{uuid}.{original_extension}`
- Videos: `{uuid}.{original_extension}`

## URL Structure

Files are served via the following URL patterns:
- Content: `/uploads/content/{category}/{filename}`
- Payment Proofs: `/uploads/payment-proofs/{filename}` (admin only)
- Temp: `/uploads/temp/{filename}` (system only)

## Upload Routes

### Public Content Uploads
- `/api/uploads/public/images?category=plans` → `uploads/content/plans/`
- `/api/uploads/public/images?category=products` → `uploads/content/products/`
- `/api/uploads/public/images?category=programmes` → `uploads/content/programmes/`
- `/api/uploads/public/images?category=transformations` → `uploads/content/transformations/`
- `/api/uploads/public/videos` → `uploads/content/videos/`
- `/api/uploads/public/documents?category=documents` → `uploads/content/documents/`

### Private Payment Proof Uploads
- `/api/uploads/payment-proof` → `uploads/payment-proofs/`

## Security

- **Content files** are publicly accessible (no authentication required)
- **Payment proof files** are private (require admin authentication)
- **Temp files** are system-only

## Examples for Gym Application

### Plans Category
- `basic-plan-image.webp`
- `premium-plan-banner.webp`
- `family-plan-pricing.webp`

### Products Category
- `protein-powder.webp`
- `gym-equipment.webp`
- `supplement-bottles.webp`

### Programmes Category
- `weight-loss-program.webp`
- `muscle-building-plan.webp`
- `cardio-workout.webp`

### Transformations Category
- `before-after-1.webp`
- `success-story-2.webp`
- `member-testimonial.webp`

### Videos Category
- `workout-tutorial.mp4`
- `nutrition-guide.mp4`
- `gym-tour.mp4`

## Maintenance

- Old files (30+ days) are automatically cleaned up
- Orphaned files are removed during cleanup
- File size limits: 10MB for images, 50MB for videos