import carrotImg from "../assets/images/carrot.jpg";

const trendingProducts = [
  {
    id: 101,
    name: "Fresh Red Apple (1kg)",
    category: "Fruits",
    image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80",
    price: 220,
    oldPrice: 280,
    rating: 4.8,
    review: 120,
    discount: 21,
  },
  {
    id: 102,
    name: "Fresh Strawberry (250g)",
    category: "Fruits",
    image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=600&q=80",
    price: 350,
    oldPrice: 400,
    rating: 4.9,
    review: 110,
    discount: 12,
  },
  {
    id: 103,
    name: "Green Broccoli (1pc)",
    category: "Vegetables",
    image: "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=600&q=80",
    price: 120,
    oldPrice: 150,
    rating: 4.7,
    review: 30,
    discount: 20,
  },
  {
    id: 104,
    name: "Fresh Carrot (1kg)",
    category: "Vegetables",
    image: carrotImg,
    price: 80,
    oldPrice: 100,
    rating: 4.8,
    review: 45,
    discount: 20,
  },
];

export default trendingProducts;