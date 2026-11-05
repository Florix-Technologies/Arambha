// The words of the admin help: guides, first-login tour and field tips. Kept together so they are easy to change.
export type HelpGuide = { id: string; title: string; steps: string[] };
export type TourStep = { target: string | null; title: string; text: string };

export const HELP_GUIDES: HelpGuide[] = [
  {
    id: 'add',
    title: 'Adding an item',
    steps: [
      'Press "Add item".',
      'Choose where it should appear: Furniture, Interiors or Gallery.',
      'Choose a category, or make a new one.',
      'Add the main photo or video.',
      'Fill in the name, description and price, then add any extra photos.',
      'Check the preview and press Publish. You can then view it on the website or add another.',
      'If you leave halfway, your draft is saved in this browser.',
    ],
  },
  {
    id: 'edit',
    title: 'Editing an item',
    steps: [
      'Choose the category the item is in.',
      'Find the item and press Edit.',
      'The same steps open with your details filled in.',
      'Press Save when you are finished.',
    ],
  },
  {
    id: 'delete',
    title: 'Deleting an item',
    steps: [
      'Choose the category the item is in.',
      'Find the item and press Delete.',
      'Confirm that you want to delete it. This cannot be undone.',
    ],
  },
  {
    id: 'categories',
    title: 'Categories',
    steps: [
      'Categories group your items on the website.',
      'Add one with the "+ Add" button beside Categories, or while adding an item.',
      'You can rename a category at any time.',
      'A category that still has items cannot be deleted. Move or delete its items first.',
    ],
  },
  {
    id: 'media',
    title: 'Photo and video tips',
    steps: [
      'Photos are made smaller for you, so large phone photos are fine.',
      'Bright photos taken in landscape look best.',
      'Videos must be MP4 files of 50 MB or less.',
      'iPhone videos are often .mov files, so convert them to MP4 first.',
      'Videos play silently and on a loop on the website.',
    ],
  },
  {
    id: 'sections',
    title: 'Which section shows on which page',
    steps: [
      'Furniture items appear on the Furniture page.',
      'Interiors items appear on the Interior Solutions page.',
      'Gallery items appear on the Our Work page, without a price.',
      'Price is optional for Furniture and Interiors.',
    ],
  },
  {
    id: 'password',
    title: 'Resetting your password',
    steps: [
      'Press "Reset Password" while logged in, or use "Forgot password" on the login screen.',
      'An email arrives with a link.',
      'Open the link and choose a new password.',
    ],
  },
  {
    id: 'logout',
    title: 'The 30-minute auto-logout',
    steps: [
      'After 30 minutes without activity you are logged out, to keep the account safe.',
      'You get a warning one minute before, and you can choose to stay logged in.',
      'Your unsaved draft stays in this browser.',
    ],
  },
];

export const TOUR_STEPS: TourStep[] = [
  { target: null, title: 'Welcome!', text: 'This short tour shows you where everything is. It takes less than a minute.' },
  { target: 'collections', title: 'Choose a section', text: 'Furniture, Interiors and Gallery are the three sections of your website.' },
  { target: 'categories', title: 'Categories', text: 'Categories group your items. Pick one to see its items, or add a new one here.' },
  { target: 'add-item', title: 'Add an item', text: 'Press this to put something new on your website. We walk you through it step by step.' },
  { target: 'help', title: 'Help is always here', text: 'Stuck? Press Help at any time. You can restart this tour from there too.' },
];

export const WIZARD_TIPS = {
  where: 'This decides which page of your website shows the item.',
  category: 'A category is a group of similar items, such as "Kitchen". Visitors see these groups on the page.',
  mainMedia: 'This is the first thing visitors see on the card. Use a photo, or an MP4 video of 50 MB or less.',
  pasteLink: 'Only needed if your photo or video is already online somewhere else. Most of the time, just upload the file.',
  name: 'A short name visitors will read on the card, such as "Oak Dining Table".',
  description: 'One or two sentences about the item. This is optional.',
  price: 'Optional. Leave it empty if you would rather discuss the price with each customer.',
  extras: 'More photos that visitors can look through. Use the arrows to change the order.',
  preview: 'This is how the card looks to visitors. Go back to change anything.',
} as const;
