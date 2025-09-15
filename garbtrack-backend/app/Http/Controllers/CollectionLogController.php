<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CollectionLog;
use Illuminate\Support\Facades\Auth;

class CollectionLogController extends Controller
{
    // Store new collection log
    public function store(Request $request)
    {
        $validated = $request->validate([
            'qr_code_data' => 'required|string', // Now stores zone_code directly
        ]);

        $collectorId = Auth::id();
        $zoneCode = $validated['qr_code_data']; // Use string directly

        $log = CollectionLog::create([
            'collector_id' => $collectorId,
            'zone_code' => $zoneCode,
            'collected_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Collection logged successfully!',
            'data' => $log
        ], 201);
    }

    // Collector view: only see own logs
    public function index()
    {
        $collectorId = Auth::id();

        $logs = CollectionLog::with('collector:id,name')
            ->where('collector_id', $collectorId)
            ->orderBy('collected_at', 'desc')
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'collector_name' => $log->collector->name ?? 'Unknown',
                    'zone_code' => $log->zone_code,
                    'collected_at' => $log->collected_at,
                ];
            });

        return response()->json($logs);
    }

    // Admin view: see all logs
    public function adminIndex()
    {
        $logs = CollectionLog::with('collector:id,name')
            ->orderBy('collected_at', 'desc')
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'collector_name' => $log->collector->name ?? 'Unknown',
                    'zone_code' => $log->zone_code,
                    'collected_at' => $log->collected_at,
                ];
            });

        return response()->json($logs);
    }
}
