// The words of the admin help page. Kept together so they are easy to change.
export type HelpGuide = { id: string; title: string; steps: string[] };

export const HELP_GUIDES: HelpGuide[] = [
  {
    id: 'structure',
    title: 'How the catalog is organised',
    steps: [
      'There are three main categories: Furniture, Interiors and Gallery. Each is a page of your website.',
      'Each main category has subcategories, for example Interiors › Kitchen. These are the headings visitors see.',
      'Products sit inside a subcategory. Choose a main category in the menu, then a subcategory.',
    ],
  },
  {
    id: 'add',
    title: 'Adding a product',
    steps: [
      'Open the subcategory it belongs to, for example Interiors › Kitchen, and press "Add product". Its place is filled in for you.',
      'Drop photos or videos into the box, or click it to choose them. The first one is the cover; press "Make cover" on another to change it.',
      'Type the name, and optionally a description and price.',
      'Press Save. The product appears on your website straight away.',
    ],
  },
  {
    id: 'edit',
    title: 'Editing, moving or deleting a product',
    steps: [
      'Open its subcategory and find it, or search by name.',
      'Edit opens the product. Change anything, then press Save.',
      'Move puts it in another subcategory of the same main category.',
      'Delete removes it from your website after you confirm. This cannot be undone.',
    ],
  },
  {
    id: 'subcategories',
    title: 'Subcategories',
    steps: [
      'Open a main category and press "Add subcategory". Keep the name short, for example "Kitchen".',
      'Press Edit beside a subcategory to rename it.',
      'Delete: an empty subcategory is deleted after you confirm. A subcategory that has products needs its products moved to another subcategory first (the delete window offers to move them for you). Products are never deleted with a subcategory.',
      'An empty subcategory is hidden from the website menu until it has products.',
    ],
  },
  {
    id: 'gallery',
    title: 'Gallery photos and videos',
    steps: [
      'Open Gallery, then a subcategory such as Kitchen.',
      'Drop several photos or videos at once. Each one becomes its own gallery item; a failed file can be retried.',
    ],
  },
  {
    id: 'media',
    title: 'Photo and video tips',
    steps: [
      'Large phone photos are made smaller for you.',
      'Bright photos taken in landscape look best.',
      'Videos must be MP4 files of 50 MB or less. iPhone videos are often .mov files, so convert them to MP4 first.',
      'Overview and Media Library list any photo that no longer loads, with a link to fix it.',
    ],
  },
  {
    id: 'password',
    title: 'Password and automatic log out',
    steps: [
      'Settings › "Email me a reset link" sends a link to change your password. "Forgot password?" on the log-in page does the same.',
      'After 30 minutes without activity you are logged out to keep the account safe. You get a warning one minute before.',
      'If you leave a product with unsaved changes, you are asked before they are discarded.',
    ],
  },
];

// The guided tour: each step highlights a real element (data-tour="..."; the first listed that is on screen wins).
// page: where the step lives: any page, the main category page, a subcategory page, or the product form.
export type TourStep = { id: string; title: string; body: string; target: string[]; page: 'any' | 'category' | 'subcategory' | 'form' };
export const TOUR_STEPS: TourStep[] = [
  { id: 'category', page: 'any', target: ['nav-category'], title: 'Open a main category',
    body: 'Everything starts with a main category. Press Interiors or Furniture in the menu to see its subcategories.' },
  { id: 'subcategory', page: 'category', target: ['subcategory-row'], title: 'Choose a subcategory',
    body: 'A subcategory is a heading on your website, for example Kitchen. Press its name to open it and see its products.' },
  { id: 'add-subcategory', page: 'category', target: ['add-subcategory'], title: 'Add a subcategory',
    body: 'Need a new heading? Press "Add subcategory", type a short name and save. It appears on the website once it has a product.' },
  { id: 'add-product', page: 'subcategory', target: ['add-product'], title: 'Add a product',
    body: 'Inside a subcategory, press "Add product". The place it belongs to is already filled in for you.' },
  { id: 'details', page: 'form', target: ['product-photos'], title: 'Details, photos and videos',
    body: 'Drop photos or videos into this box, or click it to choose them. Then type the name below, and optionally a description and price.' },
  { id: 'cover', page: 'form', target: ['cover-tile', 'save-bar'], title: 'Choose the cover and save',
    body: 'The first photo is the cover shown on the website. Press "Make cover" on another photo to change it. When you are happy, press Save: the product appears on the website straight away.' },
  { id: 'edit', page: 'subcategory', target: ['product-search'], title: 'Find and edit a product',
    body: 'Type part of a name to find a product, then press Edit on its row, change what you need and press Save.' },
  { id: 'move-delete', page: 'subcategory', target: ['product-move', 'product-delete'], title: 'Move or delete a product',
    body: 'Move puts a product in another subcategory. Delete removes it from the website after you confirm, and cannot be undone.' },
  { id: 'delete-subcategory', page: 'category', target: ['subcategory-delete'], title: 'Deleting a subcategory safely',
    body: 'An empty subcategory is deleted after you confirm. If it has products, move them to another subcategory first (the window offers to do it for you). Products are never deleted together with a subcategory.' },
];
