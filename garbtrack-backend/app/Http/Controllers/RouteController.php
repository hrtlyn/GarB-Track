<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\RouteAssignment;
use App\Models\User;

class RouteController extends Controller
{
    /**
     * Collector: Fetch only this user's routes
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $routes = RouteAssignment::where('collector_id', $user->id)
                    ->orderBy('schedule_date', 'asc')
                    ->get();

        return response()->json($routes, 200);
    }

    /**
     * Admin: Assign a route
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'route_name'    => 'required|string',
            'schedule_date' => 'required|date',
            'instructions'  => 'required|string',
            'assign_all'    => 'nullable|boolean',
            'collector_id'  => 'nullable|exists:users,id',
        ]);

        // Assign to all collectors
        if (!empty($validated['assign_all']) && $validated['assign_all']) {
            $collectors = User::where('role', 'collector')->get();
            $createdRoutes = [];

            foreach ($collectors as $collector) {
                $createdRoutes[] = RouteAssignment::create([
                    'collector_id'   => $collector->id,
                    'route_name'     => $validated['route_name'],
                    'schedule_date'  => $validated['schedule_date'],
                    'instructions'   => $validated['instructions'],
                ]);
            }

            return response()->json([
                'message' => 'Route successfully assigned to all collectors',
                'routes'  => $createdRoutes
            ], 201);
        }

        // Assign to one collector
        if (empty($validated['collector_id'])) {
            return response()->json(['message' => 'collector_id is required'], 422);
        }

        $route = RouteAssignment::create([
            'collector_id'   => $validated['collector_id'],
            'route_name'     => $validated['route_name'],
            'schedule_date'  => $validated['schedule_date'],
            'instructions'   => $validated['instructions'],
        ]);

        return response()->json($route, 201);
    }

    /**
     * Admin: View all route assignments
     */
    public function history()
    {
        $routes = RouteAssignment::with('collector:id,name,email')
                    ->orderBy('schedule_date', 'desc')
                    ->get();

        return response()->json($routes, 200);
    }

    /**
     * Admin: Delete a route assignment
     */
    public function destroy($id)
    {
        $route = RouteAssignment::find($id);

        if (!$route) {
            return response()->json(['message' => 'Route assignment not found'], 404);
        }

        $route->delete();

        return response()->json(['message' => 'Route assignment deleted successfully'], 200);
    }

    /**
     * Admin: Update a route assignment
     */
    public function update(Request $request, $id)
    {
        $route = RouteAssignment::find($id);

        if (!$route) {
            return response()->json(['message' => 'Route assignment not found'], 404);
        }

        $validated = $request->validate([
            'route_name'    => 'required|string',
            'schedule_date' => 'required|date',
            'instructions'  => 'required|string',
        ]);

        $route->update([
            'route_name'    => $validated['route_name'],
            'schedule_date' => $validated['schedule_date'],
            'instructions'  => $validated['instructions'],
        ]);

        return response()->json([
            'message' => 'Route updated successfully',
            'route'   => $route
        ], 200);
    }
}
