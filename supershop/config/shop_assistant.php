<?php

return [
    // Customer-facing facts used by the assistant. Keep these aligned with checkout.
    'delivery' => [
        'inside_dhaka_fee' => 60,
        'outside_dhaka_fee' => 120,
        // Set a value such as "60-90 minutes" only when the shop has a real ETA.
        'eta' => null,
    ],
    'refund' => [
        'processing_days' => '3-7 business days',
        'shipping_deduction_percent' => 10,
    ],
];
