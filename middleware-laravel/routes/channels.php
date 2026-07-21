<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('admin.dashboard', function ($user) {
    return $user->tokenCan('admin') || (isset($user->role) && $user->role === 'admin');
});

Broadcast::channel('cashier.products', function ($user) {
    return $user->tokenCan('cashier') || (isset($user->role) && $user->role === 'cashier');
});
