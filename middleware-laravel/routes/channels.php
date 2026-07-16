<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('admin.dashboard', function ($user) {
    return $user->tokenCan('admin') || (isset($user->role) && $user->role === 'admin');
});
