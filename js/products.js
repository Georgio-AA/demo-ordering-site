export const CATEGORIES = ['Chips & Crisps', 'Cookies & Bars', 'Soft Drinks', 'Juices', 'Water', 'Energy & Sports'];

export const PRODUCTS = [
  ['chips-sea-salt', 'Sea Salt Kettle Chips', 'Chips & Crisps', 'Crunchy kettle chips lightly seasoned with sea salt.', 'bag 150 g', 12, 2.5, 24, true],
  ['chips-paprika', 'Smoky Paprika Chips', 'Chips & Crisps', 'Crisp potato slices with a warm paprika seasoning.', 'bag 150 g', 12, 2.75, 26, false],
  ['crisps-corn', 'Golden Corn Crisps', 'Chips & Crisps', 'Light corn crisps with a satisfying savoury crunch.', 'bag 120 g', 12, 2.25, 22, false],
  ['cookies-oat', 'Oat & Honey Cookies', 'Cookies & Bars', 'Golden oat cookies with a gentle honey sweetness.', 'pack 180 g', 12, 3.25, 32, true],
  ['cookies-cocoa', 'Cocoa Crunch Cookies', 'Cookies & Bars', 'Crumbly cocoa cookies studded with chocolate chips.', 'pack 180 g', 12, 3.5, 34, false],
  ['bar-berry', 'Berry Oat Bar', 'Cookies & Bars', 'A chewy oat bar filled with fruity berry flavour.', 'bar 45 g', 24, 1.5, 28, false],
  ['soda-cola', 'Classic Cola', 'Soft Drinks', 'A sparkling cola with a mellow caramel flavour.', 'can 330 ml', 24, 1.5, 27, false],
  ['soda-orange', 'Orange Fizz', 'Soft Drinks', 'A bubbly orange drink with a bright citrus taste.', 'can 330 ml', 24, 1.5, 27, false],
  ['soda-ginger', 'Ginger Spark', 'Soft Drinks', 'A fizzy ginger drink with a gently spicy finish.', 'can 330 ml', 24, 1.75, 32, false],
  ['juice-apple', 'Orchard Apple Juice', 'Juices', 'A smooth apple juice with a crisp fruity taste.', 'bottle 250 ml', 12, 2, 19, true],
  ['juice-orange', 'Sunrise Orange Juice', 'Juices', 'A refreshing orange juice with a lively citrus flavour.', 'bottle 250 ml', 12, 2.25, 21, false],
  ['juice-mango', 'Mango Blend', 'Juices', 'A tropical mango juice blend with a smooth finish.', 'bottle 250 ml', 12, 2.5, 24, false],
  ['water-still', 'Clear Still Water', 'Water', 'Simple still water for everyday refreshment.', 'bottle 500 ml', 24, 1, 16, false],
  ['water-lemon', 'Sparkling Lemon Water', 'Water', 'Sparkling water with a light twist of lemon.', 'can 330 ml', 24, 1.5, 26, true],
  ['energy-citrus', 'Citrus Energy Drink', 'Energy & Sports', 'A sparkling energy drink with a zesty citrus flavour.', 'can 250 ml', 24, 2.5, 46, false],
  ['sports-berry', 'Berry Sports Drink', 'Energy & Sports', 'A berry flavoured sports drink for a refreshing break.', 'bottle 500 ml', 12, 2.25, 22, false],
].map(([id, name, category, description, unit, caseSize, retailPrice, wholesalePrice, featured]) => ({ id, name, category, description, unit, caseSize, retailPrice, wholesalePrice, image: `assets/img/${id}.svg`, featured }));
