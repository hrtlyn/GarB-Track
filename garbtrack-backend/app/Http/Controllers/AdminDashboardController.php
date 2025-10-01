<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Report;
use App\Models\Schedule;
use App\Models\CollectionLog;
use App\Models\Announcement;
use App\Models\RouteAssignment;
use Carbon\Carbon;

class AdminDashboardController extends Controller
{
    public function dashboardData()
    {
        $today = Carbon::today();

        // ------------------ CARDS ------------------
        $pendingReports = Report::where('status', 'pending')->count();
        $upcomingRoutes = Schedule::whereDate('date', '>=', $today)->count();
        $totalReports = Report::count();
        $reportsReviewedToday = Report::where('status', 'reviewed')
                                      ->whereDate('updated_at', $today)
                                      ->count();

        // ------------------ RECENT ACTIVITIES ------------------
        // Reports
        $recentReports = Report::orderBy('updated_at', 'desc')
                               ->take(5)
                               ->get()
                               ->map(fn($r) => [
                                   'user' => $r->name,
                                   'action' => $r->status === 'reviewed' ? 'reviewed a report' : 'submitted a report',
                                   'time' => $r->updated_at->format('h:i A'),
                                   'created_at' => $r->updated_at
                               ]);

        // Scheduled collections (Schedule model)
        $recentSchedules = Schedule::orderBy('updated_at', 'desc')
                                   ->take(5)
                                   ->get()
                                   ->map(fn($s) => [
                                       'user' => 'Admin',
                                       'action' => "scheduled a collection for {$s->zone} (schedule)",
                                       'time' => $s->updated_at->format('h:i A'),
                                       'created_at' => $s->updated_at
                                   ]);

        // Route assignments (Assign Route)
        $recentRouteAssignments = RouteAssignment::with('collector')
                                                 ->orderBy('updated_at', 'desc')
                                                 ->take(5)
                                                 ->get()
                                                 ->map(fn($r) => [
                                                     'user' => $r->collector->name ?? 'Admin',
                                                     'action' => "assigned a route for {$r->route_name}",
                                                     'time' => $r->updated_at->format('h:i A'),
                                                     'created_at' => $r->updated_at
                                                 ]);

        // Collection logs
        $recentCollections = CollectionLog::with('collector')
                                          ->orderBy('created_at', 'desc')
                                          ->take(5)
                                          ->get()
                                          ->map(fn($c) => [
                                              'user' => $c->collector->name ?? 'Collector',
                                              'action' => "completed a collection in {$c->zone_code}",
                                              'time' => $c->created_at->format('h:i A'),
                                              'created_at' => $c->created_at
                                          ]);

        // Announcements
        $recentAnnouncements = Announcement::orderBy('updated_at', 'desc')
                                           ->take(5)
                                           ->get()
                                           ->map(fn($a) => [
                                               'user' => $a->posted_by_name ?? 'Admin',
                                               'action' => 'posted an announcement',
                                               'time' => $a->updated_at->format('h:i A'),
                                               'created_at' => $a->updated_at
                                           ]);

        // Merge all recent activities & sort by newest
        $recentActivities = $recentReports
                            ->concat($recentRouteAssignments)
                            ->concat($recentSchedules)
                            ->concat($recentCollections)
                            ->concat($recentAnnouncements)
                            ->sortByDesc('created_at')
                            ->take(5)
                            ->values();

        // ------------------ REPORTS OVERVIEW ------------------
        $reportsPerZone = Report::select('zone')
                                ->selectRaw('count(*) as total')
                                ->groupBy('zone')
                                ->get();

        $reportsStatus = Report::select('status')
                               ->selectRaw('count(*) as total')
                               ->groupBy('status')
                               ->get();

        return response()->json([
            'pending_reports' => $pendingReports,
            'upcoming_routes' => $upcomingRoutes,
            'total_reports' => $totalReports,
            'reports_reviewed_today' => $reportsReviewedToday,
            'recent_activities' => $recentActivities,
            'reports_per_zone' => $reportsPerZone,
            'reports_status' => $reportsStatus,
        ]);
    }
}
