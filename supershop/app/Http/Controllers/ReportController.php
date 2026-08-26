<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ReportController extends Controller
{
    private const HISTORY_DAYS = 30;

    /** Build explainable demand estimates from delivered-order history. */
    public function getReports(): JsonResponse
    {
        try {
            // Keep reports revenue and completed-order figures identical to the dashboard.
            $completedOrders = $this->revenueOrders();
            $history = $this->productDailyHistory();

            return response()->json(['success' => true, 'data' => [
                'metrics' => [
                    'total_revenue' => (float) (clone $completedOrders)->sum('payable_amount'),
                    'total_completed_orders' => (int) (clone $completedOrders)->count(),
                    'active_customers' => (int) (clone $completedOrders)->distinct('customer_id')->count('customer_id'),
                ],
                'ai_predictions' => $this->predictions($history),
            ]]);
        } catch (\Throwable $exception) {
            Log::error('Unable to build admin reports.', ['exception' => $exception]);

            return response()->json(['success' => false, 'data' => $this->emptyReport()]);
        }
    }

    /**
     * Paid bKash/Nagad/Card orders plus delivered COD orders.
     * This intentionally mirrors AdminDashboardController::revenueOrders().
     */
    private function revenueOrders()
    {
        return DB::table('orders')->where(function ($query): void {
            $query->whereExists(function ($payment): void {
                $payment->selectRaw('1')->from('payments')
                    ->whereColumn('payments.order_id', 'orders.order_id')
                    ->whereIn(DB::raw('LOWER(payments.payment_method)'), ['bkash', 'nagad', 'card'])
                    ->whereRaw('LOWER(payments.payment_status) = ?', ['paid']);
            })->orWhere(function ($cod): void {
                $cod->whereRaw('LOWER(orders.order_status) = ?', ['delivered'])
                    ->whereExists(function ($payment): void {
                        $payment->selectRaw('1')->from('payments')
                            ->whereColumn('payments.order_id', 'orders.order_id')
                            ->whereRaw('LOWER(payments.payment_method) = ?', ['cod']);
                    });
            });
        });
    }

    /** @return Collection<int, object> */
    private function productDailyHistory(): Collection
    {
        return DB::table('order_items')
            ->join('orders', 'orders.order_id', '=', 'order_items.order_id')
            ->join('products', 'products.id', '=', 'order_items.product_id')
            ->whereRaw('LOWER(orders.order_status) = ?', ['delivered'])
            ->where('orders.created_at', '>=', now()->subDays(self::HISTORY_DAYS - 1)->startOfDay())
            ->selectRaw("products.id as product_id, products.name, COALESCE(NULLIF(products.category, ''), 'Others') as category, DATE(orders.created_at) as sale_date, SUM(COALESCE(order_items.quantity, 0)) as quantity")
            ->groupByRaw("products.id, products.name, products.category, DATE(orders.created_at)")
            ->orderBy('sale_date')
            ->get();
    }

    /** @param Collection<int, object> $history @return Collection<int, array<string, mixed>> */
    private function predictions(Collection $history): Collection
    {
        $start = now()->subDays(self::HISTORY_DAYS - 1)->startOfDay();

        return $history->groupBy('product_id')->map(function (Collection $rows) use ($start): array {
            $first = $rows->first();
            $daily = array_fill(0, self::HISTORY_DAYS, 0.0);
            $weekend = $weekday = 0.0;
            $weekendDates = $weekdayDates = [];

            foreach ($rows as $row) {
                $date = \Carbon\Carbon::parse($row->sale_date)->startOfDay();
                $index = $start->diffInDays($date, false);
                $quantity = (float) $row->quantity;
                if ($index >= 0 && $index < self::HISTORY_DAYS) {
                    $daily[$index] += $quantity;
                }
                if ($date->isoWeekday() >= 5) {
                    $weekend += $quantity;
                    $weekendDates[$date->toDateString()] = true;
                } else {
                    $weekday += $quantity;
                    $weekdayDates[$date->toDateString()] = true;
                }
            }

            $slope = $this->linearRegressionSlope($daily);
            $average = array_sum($daily) / self::HISTORY_DAYS;
            $growth = $average > 0 ? ($slope / $average) * 100 : 0.0;
            $weekendSpike = $weekend > 0 && ($weekend / max(count($weekendDates), 1)) >= (($weekday / max(count($weekdayDates), 1)) * 1.2);
            $reason = $weekendSpike ? 'Weekend demand spike' : ($slope > 0 ? 'Fast-moving stock recommendation' : 'Stable demand monitoring');

            return [
                'name' => $first->name ?: 'Unnamed product',
                'category' => $first->category ?: 'Others',
                'growth_percentage' => sprintf('%+.1f%%', $growth),
                'growth_value' => round($growth, 1),
                'insight_reason' => $reason,
                // Project from the centre of the 30-day observation window to the future periods.
                'predicted_next_week_demand' => max(0, (int) round(($average * 7) + ($slope * 122.5))),
                'predicted_next_month_demand' => max(0, (int) round(($average * 30) + ($slope * 900))),
                'units_sold_last_30_days' => (int) round(array_sum($daily)),
            ];
        })->sortByDesc('units_sold_last_30_days')->take(6)->values();
    }

    /** @param array<int, float> $values */
    private function linearRegressionSlope(array $values): float
    {
        $count = count($values);
        $sumX = $sumY = $sumXY = $sumXX = 0.0;
        foreach ($values as $x => $y) {
            $sumX += $x; $sumY += $y; $sumXY += $x * $y; $sumXX += $x * $x;
        }
        $denominator = ($count * $sumXX) - ($sumX * $sumX);

        return $denominator == 0.0 ? 0.0 : (($count * $sumXY) - ($sumX * $sumY)) / $denominator;
    }

    /** @return array<string, mixed> */
    private function emptyReport(): array
    {
        return ['metrics' => ['total_revenue' => 0.0, 'total_completed_orders' => 0, 'active_customers' => 0], 'ai_predictions' => []];
    }
}
