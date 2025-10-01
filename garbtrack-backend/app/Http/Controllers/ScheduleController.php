<?php
namespace App\Http\Controllers;

use App\Models\Schedule;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    public function index()
    {
        return response()->json(Schedule::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'zone' => 'required|string|max:255',
            'date' => 'required|date',
            'type' => 'required|string|max:255',
            'time' => 'required|date_format:H:i',
        ]);

        $schedule = Schedule::create($validated);
        return response()->json($schedule, 201);
    }

    public function show(Schedule $schedule)
    {
        return response()->json($schedule);
    }

    // 🔹 Add update method
    public function update(Request $request, Schedule $schedule)
    {
        $validated = $request->validate([
            'zone' => 'required|string|max:255',
            'date' => 'required|date',
            'type' => 'required|string|max:255',
            'time' => 'required|date_format:H:i',
        ]);

        $schedule->update($validated);

        return response()->json($schedule);
    }

    public function destroy(Schedule $schedule)
    {
        $schedule->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
