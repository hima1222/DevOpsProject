import MenuItem from "../models/Menu.js";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

export const getMenu = async (req, res) => {
  try {
    const menuItems = await MenuItem.find({});
    const beverages = menuItems.filter(item => item.category === "beverage");
    const sweets = menuItems.filter(item => item.category === "sweet");
    res.json({ beverages, sweets });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const seedMenu = async (req, res) => {
  try {
    // Clear existing menu items to allow re-seeding
    await MenuItem.deleteMany({});

    const menuItems = [
      { id: 1, title: "Espresso", price: "2.50", img: `${FRONTEND_URL}/src/assets/coffeeMenu/espresso.jpg`, desc: "Bold and concentrated.", category: "beverage" },
      { id: 2, title: "Cappuccino", price: "3.50", img: `${FRONTEND_URL}/src/assets/coffeeMenu/cappuccino.jpg`, desc: "Silky milk and espresso.", category: "beverage" },
      { id: 3, title: "Vanilla Latte", price: "3.75", img: `${FRONTEND_URL}/src/assets/coffeeMenu/vanillaLatte.jpg`, desc: "Smooth latte with vanilla.", category: "beverage" },
      { id: 4, title: "Mocha", price: "4.00", img: `${FRONTEND_URL}/src/assets/coffeeMenu/mocha.jpg`, desc: "Rich chocolate and espresso.", category: "beverage" },
      { id: 5, title: "Americano", price: "2.75", img: `${FRONTEND_URL}/src/assets/coffeeMenu/americano.jpg`, desc: "Espresso with hot water.", category: "beverage" },
      { id: 6, title: "Macchiato", price: "3.25", img: `${FRONTEND_URL}/src/assets/coffeeMenu/macchiato.jpg`, desc: "Espresso with a dash of milk.", category: "beverage" },
      { id: 7, title: "Affogato", price: "3.75", img: `${FRONTEND_URL}/src/assets/coffeeMenu/affogato.jpg`, desc: "Espresso poured over vanilla ice cream.", category: "beverage" },
      { id: 8, title: "Cortado", price: "3.75", img: `${FRONTEND_URL}/src/assets/coffeeMenu/cortado.jpg`, desc: "Espresso with a dash of milk.", category: "beverage" },
      { id: 9, title: "Flat White", price: "3.75", img: `${FRONTEND_URL}/src/assets/coffeeMenu/flatWhite.jpg`, desc: "Smooth latte with a dash of milk.", category: "beverage" },
      { id: 10, title: "Frappuccino", price: "3.75", img: `${FRONTEND_URL}/src/assets/coffeeMenu/frappuccino.jpg`, desc: "Smooth Icey Coffee with Milk.", category: "beverage" },
      { id: 11, title: "Iced Americano", price: "3.75", img: `${FRONTEND_URL}/src/assets/coffeeMenu/icedAmericano.jpg`, desc: "Espresso with ice and water.", category: "beverage" },
      { id: 12, title: "Iced Latte", price: "3.75", img: `${FRONTEND_URL}/src/assets/coffeeMenu/icedLatte.jpg`, desc: "Smooth iced latte with vanilla.", category: "beverage" },
      { id: 13, title: "Iced Caramel Macchiato", price: "3.75", img: `${FRONTEND_URL}/src/assets/coffeeMenu/icedCaramelMacchiato.jpg`, desc: "Smooth iced latte with vanilla and caramel.", category: "beverage" },
      { id: 14, title: "Iced Mocha", price: "4.00", img: `${FRONTEND_URL}/src/assets/coffeeMenu/icedMocha.jpg`, desc: "Rich chocolate and espresso.", category: "beverage" },
      { id: 15, title: "Latte", price: "3.75", img: `${FRONTEND_URL}/src/assets/coffeeMenu/latte.jpg`, desc: "Smooth latte with vanilla.", category: "beverage" },
      { id: 100, title: "Chocolate Chip Cookie", price: "1.50", img: `${FRONTEND_URL}/src/assets/snackMenu/chocoChipCookies.jpg`, desc: "Classic treat with chocolate chips.", category: "sweet" },
      { id: 101, title: "Croissant", price: "2.00", img: `${FRONTEND_URL}/src/assets/snackMenu/croissants.jpg`, desc: "Buttery and flaky.", category: "sweet" },
      { id: 102, title: "Blueberry Muffin", price: "2.25", img: `${FRONTEND_URL}/src/assets/snackMenu/blueberryMuffins.jpg`, desc: "Fresh berries inside.", category: "sweet" },
      { id: 103, title: "Brownie", price: "2.50", img: `${FRONTEND_URL}/src/assets/snackMenu/brownies.jpg`, desc: "Rich and fudgy.", category: "sweet" },
      { id: 104, title: "Chocolate Cakes", price: "2.75", img: `${FRONTEND_URL}/src/assets/snackMenu/chocoCakes.jpg`, desc: "Cake flavored with melted chocolate.", category: "sweet" },
      { id: 105, title: "Cheesecake", price: "2.75", img: `${FRONTEND_URL}/src/assets/snackMenu/cheeseCake.jpg`, desc: "Creamy and delicious.", category: "sweet" },
      { id: 106, title: "Chocolate Muffin", price: "2.75", img: `${FRONTEND_URL}/src/assets/snackMenu/chocoMuffins.jpg`, desc: "Chocolate flavored muffin.", category: "sweet" },
      { id: 107, title: "Sandwich", price: "2.75", img: `${FRONTEND_URL}/src/assets/snackMenu/sandwiches.jpg`, desc: "Delicious sandwich with fresh ingredients.", category: "sweet" },
      { id: 108, title: "Scones", price: "2.75", img: `${FRONTEND_URL}/src/assets/snackMenu/scones.jpg`, desc: "Buttery and flaky.", category: "sweet" },
      { id: 109, title: "Toastie", price: "2.75", img: `${FRONTEND_URL}/src/assets/snackMenu/toastie.jpg`, desc: "Delicious toast with fresh ingredients.", category: "sweet" },
      { id: 110, title: "White Cakes", price: "2.75", img: `${FRONTEND_URL}/src/assets/snackMenu/whiteCakes.jpg`, desc: "Delicious white cake.", category: "sweet" },
      
    ];

    await MenuItem.insertMany(menuItems);
    res.json({ message: "Menu seeded successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
