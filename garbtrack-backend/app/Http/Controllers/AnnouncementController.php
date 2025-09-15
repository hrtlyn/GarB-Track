<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    public function index()
    {
        return Announcement::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'message' => 'required|string'
        ]);

        $announcement = Announcement::create($validated);
        return response()->json($announcement, 201);
    }

    public function update(Request $request, Announcement $announcement)
    {
        $validated = $request->validate([
            'message' => 'required|string'
        ]);

        $announcement->update($validated);
        return response()->json($announcement);
    }

    public function destroy(Announcement $announcement)
    {
        $announcement->delete();
        return response()->json(null, 204);
    }
}
