import React, { useState } from "react";
import { X } from "lucide-react";

const REPORT_REASONS = [
  { id: "inappropriate", label: "Inappropriate Content" },
  { id: "inaccurate", label: "Inaccurate Information" },
  { id: "offensive", label: "Offensive Language" },
  { id: "spam", label: "Spam" },
  { id: "copyright", label: "Copyright Violation" },
  { id: "other", label: "Other" },
];

export default function ReportModal({ isOpen, onClose, recipeName, onSubmit }) {
  const [selectedReason, setSelectedReason] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) {
      alert("Please select a reason for reporting");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        reason: selectedReason,
        description,
        recipeName,
        timestamp: new Date().toISOString(),
      });
      setSelectedReason("");
      setDescription("");
      onClose();
    } catch (error) {
      console.error("Failed to submit report:", error);
      alert("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Report Recipe</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Recipe Name Display */}
          {recipeName && (
            <div className="bg-orange-50 border border-orange-100 rounded-lg p-3">
              <p className="text-xs font-semibold text-orange-600 mb-1">
                Reporting Recipe:
              </p>
              <p className="text-sm font-bold text-gray-900 truncate">
                {recipeName}
              </p>
            </div>
          )}

          {/* Reason Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Reason for Report *
            </label>
            <div className="space-y-2">
              {REPORT_REASONS.map((reason) => (
                <label
                  key={reason.id}
                  className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name="report-reason"
                    value={reason.id}
                    checked={selectedReason === reason.id}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="w-4 h-4 text-[#F57600] cursor-pointer"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    {reason.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Additional Details (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide any additional information about your report..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F57600] focus:border-transparent resize-none"
              rows={4}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedReason}
            className="flex-1 px-4 py-2 bg-[#F57600] text-white rounded-lg font-semibold hover:bg-[#E56A00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </button>
        </div>
      </div>
    </div>
  );
}
