<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SuperShop - Online Super Shop Management System</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Font Awesome Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; }
    </style>
</head>
<body class="bg-gray-50 text-gray-800">

    <!-- 1. NAVBAR SECTION -->
    <nav class="bg-white shadow-md sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-20 items-center">
                <!-- Logo -->
                <div class="flex items-center space-x-2">
                    <span class="bg-emerald-600 text-white p-2.5 rounded-xl text-xl font-bold">
                        <i class="fa-solid fa-cart-shopping"></i>
                    </span>
                    <span class="text-2xl font-extrabold text-gray-800">Super<span class="text-emerald-600">Shop</span></span>
                </div>

                <!-- Navigation Links -->
                <div class="hidden md:flex space-x-8 font-medium text-gray-600">
                    <a href="#features" class="hover:text-emerald-600 transition">Features</a>
                    <a href="#portals" class="hover:text-emerald-600 transition">Portals</a>
                    <a href="#categories" class="hover:text-emerald-600 transition">Categories</a>
                </div>

                <!-- Auth Buttons (Laravel Dynamic Authentication Links) -->
                <div class="flex items-center space-x-4">
                    @if (Route::has('login'))
                        @auth
                            <a href="{{ url('/dashboard') }}" class="bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-emerald-700 transition shadow-md">
                                <i class="fa-solid fa-gauge mr-1"></i> Dashboard
                            </a>
                        @else
                            <a href="{{ route('login') }}" class="text-gray-700 hover:text-emerald-600 font-semibold transition px-3 py-2">
                                Log in
                            </a>
                            @if (Route::has('register'))
                                <a href="{{ route('register') }}" class="bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-emerald-700 transition shadow-md">
                                    Register
                                </a>
                            @endif
                        @endauth
                    @endif
                </div>
            </div>
        </div>
    </nav>

    <!-- 2. HERO SECTION -->
    <section class="relative bg-gradient-to-r from-emerald-600 to-teal-800 text-white py-24">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
                <span class="bg-emerald-500/30 text-emerald-100 text-sm font-semibold px-4 py-1.5 rounded-full border border-emerald-400/30">
                    <i class="fa-solid fa-wand-magic-sparkles mr-1"></i> AI-Powered Super Shop Management
                </span>
                <h1 class="text-4xl md:text-5xl font-extrabold leading-tight mt-4">
                    Fresh Groceries & Essentials Delivered Fast
                </h1>
                <p class="mt-4 text-emerald-100 text-lg">
                    Shop your daily groceries and top brand items in just one click. Enjoy secure payments, active coupon discounts, and OTP-verified delivery!
                </p>
                <div class="mt-8 flex flex-wrap gap-4">
                    <a href="#portals" class="bg-white text-emerald-800 px-8 py-3.5 rounded-xl font-bold text-lg hover:bg-emerald-50 shadow-lg transition">
                        Start Shopping <i class="fa-solid fa-arrow-right ml-2"></i>
                    </a>
                </div>
            </div>
            <div class="relative text-center">
                <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&auto=format&fit=crop" 
                     alt="Supermarket Store" class="rounded-2xl shadow-2xl border-4 border-white/20 mx-auto max-w-full">
            </div>
        </div>
    </section>

    <!-- 3. ACTOR / PORTALS SECTION -->
    <section id="portals" class="py-20 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-16">
                <h2 class="text-3xl font-extrabold text-gray-900">System Access Portals</h2>
                <p class="text-gray-600 mt-2">Designed tailored management dashboards for every role</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <!-- Customer Card -->
                <div class="border border-gray-200 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 text-center group bg-white">
                    <div class="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <i class="fa-solid fa-user"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">Customer Portal</h3>
                    <p class="text-gray-600 text-sm leading-relaxed">
                        Browse categories, manage cart & wishlist, apply discount coupons, make online payments, and track order status in real time.
                    </p>
                </div>

                <!-- Admin Card -->
                <div class="border border-gray-200 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 text-center group bg-white">
                    <div class="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-6 group-hover:bg-purple-600 group-hover:text-white transition-all">
                        <i class="fa-solid fa-user-shield"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">Admin Dashboard</h3>
                    <p class="text-gray-600 text-sm leading-relaxed">
                        Manage products, categories, inventory stock, order dispatches, refund processing, coupon codes, and view sales reports.
                    </p>
                </div>

                <!-- Delivery Personnel Card -->
                <div class="border border-gray-200 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 text-center group bg-white">
                    <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        <i class="fa-solid fa-truck-fast"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">Delivery App</h3>
                    <p class="text-gray-600 text-sm leading-relaxed">
                        View assigned orders, verify delivery OTP codes, manage Cash-on-Delivery (COD) collections, and update status.
                    </p>
                </div>
            </div>
        </div>
    </section>

    <!-- 4. KEY FEATURES SECTION -->
    <section id="features" class="py-20 bg-gray-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-16">
                <h2 class="text-3xl font-extrabold text-gray-900">Key Features</h2>
                <p class="text-gray-600 mt-2">Smart solutions powering your modern supermarket system</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <i class="fa-solid fa-robot text-emerald-600 text-3xl mb-4"></i>
                    <h4 class="font-bold text-lg mb-2">AI Support Bot</h4>
                    <p class="text-gray-500 text-sm">24/7 intelligent automated customer support assistant.</p>
                </div>

                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <i class="fa-solid fa-shield-halved text-emerald-600 text-3xl mb-4"></i>
                    <h4 class="font-bold text-lg mb-2">OTP Verification</h4>
                    <p class="text-gray-500 text-sm">Secure doorstep delivery verification with OTP codes.</p>
                </div>

                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <i class="fa-solid fa-ticket text-emerald-600 text-3xl mb-4"></i>
                    <h4 class="font-bold text-lg mb-2">Coupons & Offers</h4>
                    <p class="text-gray-500 text-sm">Discount codes and promotional offers at checkout.</p>
                </div>

                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <i class="fa-solid fa-arrows-rotate text-emerald-600 text-3xl mb-4"></i>
                    <h4 class="font-bold text-lg mb-2">Refund Management</h4>
                    <p class="text-gray-500 text-sm">Hassle-free order return and refund request handling.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- 5. FOOTER SECTION -->
    <footer class="bg-gray-900 text-gray-400 py-10 border-t border-gray-800">
        <div class="max-w-7xl mx-auto px-4 text-center">
            <p class="text-sm">&copy; {{ date('Y') }} SuperShop - Online Super Shop Management System. All rights reserved.</p>
        </div>
    </footer>

</body>
</html>