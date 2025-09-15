<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Report;             // assuming you have a Report model
use App\Models\RouteAssignment;    // using your existing model

class AdminDashboardController extends Controller
{
    public function dashboardData()
    {
        // Count pending reports
        $pendingReports = Report::where('status', 'pending')->count();

        // Count future scheduled routes
        $upcomingRoutes = RouteAssignment::where('schedule_date', '>=', now())->count();

        return response()->json([
            'pending_reports' => $pendingReports,
            'upcoming_routes' => $upcomingRoutes,
        ]);
    }
}
