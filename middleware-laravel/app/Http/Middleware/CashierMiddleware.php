<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CashierMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        
        if ($request->user() && ($request->user()->role === 'cashier')) {
            return $next($request);
        }

        
        return response()->json([
            'message' => 'Unauthorized. This action is reserved for cashiers only.'
        ], 403);
    }
}