export const mockProducts = [
  {
    id: 1,
    slug: 'heavy-hoodie-01',
    name: 'HEAVY HOODIE 01',
    description: 'Constructed from 450gsm loopback cotton jersey. Oversized, boxy fit with dropped shoulders. Features a raw hem and double-layered hood. Built for endurance.',
    price: 120.00,
    images: ['/images/heavy_hoodie.png', '/images/black_fabric.png'],
    category: 'Staple',
    inStock: 50,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Black', hex: '#000000' }, { name: 'Concrete', hex: '#E0E0E0' }],
    fabric: '100% Cotton, 450GSM loopback jersey',
    care: 'Machine wash cold, air dry. Do not tumble dry.',
    fit: 'Oversized, boxy fit. Take your normal size.'
  },
  {
    id: 2,
    slug: 'utility-trackpants',
    name: 'UTILITY TRACKPANTS',
    description: 'Technical trackpants with articulated knees and multiple cargo pockets. Adjustable bungee cords at the hem for a customizable silhouette.',
    price: 85.00,
    images: ['/images/utility_trackpants.png'],
    category: 'Utility',
    inStock: 30,
    sizes: ['S', 'M', 'L'],
    colors: [{ name: 'Black', hex: '#000000' }],
    fabric: '100% Nylon with DWR coating',
    care: 'Hand wash cold. Line dry.',
    fit: 'Relaxed fit with tapered leg.'
  },
  {
    id: 3,
    slug: 'box-fit-tee',
    name: 'BOX FIT TEE',
    description: 'The archetype t-shirt. 250gsm heavyweight cotton. Wide body, cropped length, and a tight ribbed collar.',
    price: 65.00,
    images: ['/images/box_fit_tee.png'],
    category: 'Staple',
    inStock: 100,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'White', hex: '#FFFFFF' }, { name: 'Black', hex: '#000000' }],
    fabric: '100% Cotton, 250GSM',
    care: 'Machine wash cold, tumble dry low.',
    fit: 'Cropped, boxy fit.'
  }
];
