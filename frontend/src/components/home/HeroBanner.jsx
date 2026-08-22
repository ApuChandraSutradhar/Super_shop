import heroBg from "../../assets/images/hero-bg.jpg";
import salad from "../../assets/images/salad.png";
import cart from "../../assets/images/cart.png";
import { FiTruck, FiCheck, FiMenu } from "react-icons/fi";

export default function HeroBanner() {
  return (
    <div
      className="relative min-h-[560px] rounded-3xl overflow-hidden shadow-xl bg-cover bg-center"
      style={{
        backgroundImage: `url(${heroBg})`,
      }}
    >
      <div className="absolute inset-0 bg-green-900/80"></div>

      {/* Content */}
      <div className="relative z-10 h-full grid grid-cols-2">

        {/* Left Side */}
        <div className="flex flex-col justify-center pt-10 px-14">

          <div className="inline-flex items-center gap-2 bg-green-700 text-white rounded-full px-5 py-2 w-fit mb-6">
            <span className="w-3 h-3 rounded-full bg-green-300"></span>
            NOW DELIVERING IN 30 MIN
          </div>

          <h1 className="text-5xl font-extrabold text-white leading-tight">
            Fresh Grocery
          </h1>

          <h2 className="text-5xl font-extrabold text-green-400 mb-5">
            Delivered Fast
          </h2>

          <p className="text-gray-200 text-base leading-7 max-w-xl">
            Fresh products delivered directly to your doorstep every day.
            Farm-fresh quality guaranteed.
          </p>

          <div className="flex gap-5 mt-8">

            <button
  onClick={() => {
    document.getElementById("products")?.scrollIntoView({
      behavior: "smooth",
    });
  }}
  className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-8 py-4 font-semibold text-lg transition duration-300"
>
  Shop Now
</button>

            <button className="border border-white text-white rounded-full px-8 py-4 font-semibold text-lg hover:bg-white hover:text-green-700 transition">
              Explore Categories
            </button>

          </div>

          <div className="flex gap-8 mt-8 text-white">

            <div className="flex items-center gap-2">
              <FiTruck />
              Free Delivery
            </div>

            <div className="flex items-center gap-2">
              <FiCheck />
              100% Fresh
            </div>

            <div>
              ⭐ 4.9 Rated
            </div>

          </div>

        </div>

        {/* Right Side */}

        <div className="relative flex justify-center items-cente pt-8">

          {/* 50% Badge */}

          <div className="absolute top-8 left-24 w-24 h-24 rounded-full bg-orange-500 text-white flex flex-col items-center justify-center shadow-xl">
            <h2 className="text-3xl font-bold">
              50%
            </h2>

            <p className="text-sm">
              OFF
            </p>

          </div>

<div className="w-[360px] h-[360px] rounded-full bg-white shadow-2xl overflow-hidden flex items-center justify-center">

  <img
    src={cart}
    alt="Shopping Cart"
    className="w-[98%] h-[98%] object-cover rounded-full"
  />

</div>

          <div className="absolute bottom-2 left-8 bg-white rounded-2xl shadow-xl px-5 py-3 flex items-center gap-4 z-30">

            <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center text-white">
              <FiCheck size={24} />
            </div>

            <div>

              <h3 className="font-bold">
                Order Placed!
              </h3>

              <p className="text-gray-500">
                Arriving in 28 min
              </p>

            </div>

          </div>

          <div className="absolute bottom-4 right-4 bg-green-600 text-white rounded-full px-6 py-4 flex items-center gap-2 shadow-xlz-30">

            <FiTruck />

            Free Delivery

          </div>

        </div>

      </div>

    </div>
  );
}

