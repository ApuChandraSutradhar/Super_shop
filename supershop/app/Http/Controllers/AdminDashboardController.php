<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class AdminDashboardController extends Controller
{
    /** @return Builder<Order> */
    private function revenueOrders(): Builder
    {
        return Order::query()->where(function (Builder $query): void {
            $query->where(fn (Builder $online) => $online->whereHas('payment', fn (Builder $payment) => $payment
                ->whereIn(DB::raw('LOWER(payment_method)'), ['bkash', 'nagad', 'card'])
                ->whereRaw('LOWER(payment_status) = ?', ['paid'])))
                ->orWhere(fn (Builder $cod) => $cod
                    ->whereRaw('LOWER(order_status) = ?', ['delivered'])
                    ->whereHas('payment', fn (Builder $payment) => $payment->whereRaw('LOWER(payment_method) = ?', ['cod'])));
        });
    }

    public function index(): JsonResponse
    {
        try {
            return response()->json(['success' => true, 'data' => $this->dashboardData()]);
        } catch (\Throwable $exception) {
            Log::error('Unable to build the admin dashboard.', ['exception' => $exception]);

            return response()->json(['success' => true, 'data' => $this->emptyDashboardData()]);
        }
    }

    /** @return array<string, mixed> */
    private function dashboardData(): array
    {
        $now = now();
        $monthStart = $now->copy()->startOfMonth();
        $previousMonthStart = $monthStart->copy()->subMonth();
        $weekStart = $now->copy()->startOfWeek();
        $previousWeekStart = $weekStart->copy()->subWeek();
        $revenue = $this->revenueOrders();
        $currentMonthRevenue = $this->safely(fn (): float => (float) (clone $revenue)->whereBetween('created_at', [$monthStart, $now])->sum('payable_amount'), 0.0, 'current month revenue');
        $previousMonthRevenue = $this->safely(fn (): float => (float) (clone $revenue)->whereBetween('created_at', [$previousMonthStart, $monthStart->copy()->subSecond()])->sum('payable_amount'), 0.0, 'previous month revenue');
        $currentWeekOrders = $this->safely(fn (): int => Order::whereBetween('created_at', [$weekStart, $now])->count(), 0, 'current week orders');
        $previousWeekOrders = $this->safely(fn (): int => Order::whereBetween('created_at', [$previousWeekStart, $weekStart->copy()->subSecond()])->count(), 0, 'previous week orders');

        $months = collect(range(6, 0))->map(function (int $monthsAgo) use ($now): array {
            $start = $now->copy()->subMonths($monthsAgo)->startOfMonth();
            $orders = $this->revenueOrders()->whereBetween('created_at', [$start, $start->copy()->endOfMonth()]);

            return ['month' => $start->format('M'), 'revenue' => $this->safely(fn (): float => (float) (clone $orders)->sum('payable_amount'), 0.0, 'monthly revenue'), 'sales' => $this->safely(fn (): float => (float) (clone $orders)->sum('total_amount'), 0.0, 'monthly sales'), 'orders' => $this->safely(fn (): int => Order::whereBetween('created_at', [$start, $start->copy()->endOfMonth()])->count(), 0, 'monthly orders')];
        });
        $categorySales = $this->safely(fn () => DB::table('order_items')->join('products', 'products.id', '=', 'order_items.product_id')->join('orders', 'orders.order_id', '=', 'order_items.order_id')->join('payments', 'payments.order_id', '=', 'orders.order_id')
            ->where(fn ($query) => $query->where(fn ($online) => $online->whereIn(DB::raw('LOWER(payments.payment_method)'), ['bkash', 'nagad', 'card'])->whereRaw('LOWER(payments.payment_status) = ?', ['paid']))->orWhere(fn ($cod) => $cod->whereRaw('LOWER(payments.payment_method) = ?', ['cod'])->whereRaw('LOWER(orders.order_status) = ?', ['delivered'])))
            ->selectRaw("COALESCE(NULLIF(products.category, ''), 'Others') as name, SUM(COALESCE(order_items.subtotal, 0)) as amount")
            // Group by the underlying column: this is compatible with MySQL's ONLY_FULL_GROUP_BY mode.
            ->groupBy('products.category')
            ->orderByDesc('amount')
            ->get(), collect(), 'category sales')
            ->groupBy('name')
            ->map(fn ($categories, string $name) => (object) ['name' => $name, 'amount' => (float) $categories->sum('amount')])
            ->sortByDesc('amount')
            ->values();
        $categoryTotal = (float) $categorySales->sum('amount');
        $colors = ['#10b981', '#f97316', '#3b82f6', '#ef4444', '#a855f7', '#14b8a6'];
        $pendingCash = $this->safely(function () {
            if (! Schema::hasTable('deliveries') || ! Schema::hasColumn('deliveries', 'settlement_status')) {
                return collect();
            }

            return DB::table('deliveries')->join('orders', 'orders.order_id', '=', 'deliveries.order_id')->join('payments', 'payments.order_id', '=', 'orders.order_id')->leftJoin('users', 'users.id', '=', 'deliveries.delivery_person_id')
            ->whereRaw('LOWER(orders.order_status) = ?', ['delivered'])->whereRaw('UPPER(payments.payment_method) = ?', ['COD'])->where('deliveries.settlement_status', 'pending')
            ->selectRaw("COALESCE(NULLIF(users.name, ''), 'Unassigned rider') as rider_name, SUM(COALESCE(deliveries.cash_collected, 0)) as amount")
            ->groupBy('users.name')
            ->orderByDesc('amount')
            ->get();
        }, collect(), 'pending COD cash')
            ->groupBy('rider_name')
            ->map(fn ($riders, string $name) => (object) ['rider_name' => $name, 'amount' => (float) $riders->sum('amount')])
            ->sortByDesc('amount')
            ->values();

        return [
            'stats' => ['total_revenue' => $this->safely(fn (): float => (float) (clone $revenue)->sum('payable_amount'), 0.0, 'total revenue'), 'revenue_growth' => $this->growth($currentMonthRevenue, $previousMonthRevenue), 'total_orders' => $this->safely(fn (): int => Order::count(), 0, 'total orders'), 'orders_growth' => $this->growth($currentWeekOrders, $previousWeekOrders), 'active_customers' => $this->safely(fn (): int => User::where('role', 'customer')->count(), 0, 'active customers'), 'products_listed' => $this->safely(fn (): int => Product::count(), 0, 'products listed')],
            'sales_revenue' => $months->map(fn (array $item) => collect($item)->except('orders')->all())->values(),
            'monthly_orders' => $months->map(fn (array $item) => ['month' => $item['month'], 'orders' => $item['orders']])->values(),
            'category_sales' => $categorySales->values()->map(fn ($category, int $index) => ['name' => $category->name, 'value' => $categoryTotal > 0 ? round(((float) $category->amount / $categoryTotal) * 100, 1) : 0, 'amount' => (float) $category->amount, 'color' => $colors[$index % count($colors)]]),
            'recent_orders' => $this->safely(fn () => Order::latest('order_id')->limit(5)->get(['order_id', 'order_number', 'order_status', 'payable_amount', 'created_at']), collect(), 'recent orders'),
            'low_stock_products' => $this->safely(fn () => Product::whereNotNull('stock')->where('stock', '<=', 20)->orderBy('stock')->limit(5)->get(['id', 'name', 'stock']), collect(), 'low stock products'),
            'pending_cod_cash' => ['total' => (float) $pendingCash->sum('amount'), 'riders' => $pendingCash],
        ];
    }

    /** @return array<string, mixed> */
    private function emptyDashboardData(): array
    {
        $months = collect(range(6, 0))->map(fn (int $monthsAgo) => now()->subMonths($monthsAgo)->format('M'));

        return [
            'stats' => ['total_revenue' => 0, 'revenue_growth' => 0, 'total_orders' => 0, 'orders_growth' => 0, 'active_customers' => 0, 'products_listed' => 0],
            'sales_revenue' => $months->map(fn (string $month) => ['month' => $month, 'revenue' => 0, 'sales' => 0])->values(),
            'monthly_orders' => $months->map(fn (string $month) => ['month' => $month, 'orders' => 0])->values(),
            'category_sales' => [], 'recent_orders' => [], 'low_stock_products' => [], 'pending_cod_cash' => ['total' => 0, 'riders' => []],
        ];
    }

    private function growth(float|int $current, float|int $previous): float
    {
        return $previous > 0 ? round((($current - $previous) / $previous) * 100, 1) : ($current > 0 ? 100 : 0);
    }

    /** Execute an independent metric without letting an optional dashboard widget fail the endpoint. */
    private function safely(callable $callback, mixed $fallback, string $metric): mixed
    {
        try {
            return $callback();
        } catch (\Throwable $exception) {
            Log::warning('Admin dashboard metric unavailable.', ['metric' => $metric, 'exception' => $exception->getMessage()]);

            return $fallback;
        }
    }
}
