<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    // Fetch all reports
    public function index()
    {
        return response()->json(Report::orderBy('created_at', 'desc')->get());
    }

    // Store report (from resident form)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'reporter' => 'required|string|max:255',   // ✅ added reporter validation
            'zone' => 'required|string|max:255',
            'description' => 'required|string',
            'photo' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('reports', 'public');
        }

        $report = Report::create([
            'reporter' => $validated['reporter'],      // ✅ save reporter name
            'zone' => $validated['zone'],
            'description' => $validated['description'],
            'photo' => $photoPath,
            'status' => 'Pending',
        ]);

        return response()->json([
            'message' => 'Report submitted successfully',
            'report' => $report,
        ], 201);
    }

    // Update report (mark as reviewed)
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|string',
        ]);

        $report = Report::findOrFail($id);
        $report->status = $validated['status'];
        $report->save();

        return response()->json(['message' => 'Report updated successfully', 'report' => $report]);
    }

    // Delete report
    public function destroy($id)
    {
        $report = Report::findOrFail($id);
        $report->delete();

        return response()->json([
            'message' => 'Report deleted successfully'
        ]);
    }
}
