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
      'Delete asks where its products should go first, so products are never deleted with a subcategory.',
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
