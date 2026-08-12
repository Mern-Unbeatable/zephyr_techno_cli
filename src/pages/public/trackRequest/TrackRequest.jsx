import React, { useState, useEffect } from "react";
import { Search, Package, Clock, CheckCircle, XCircle, Eye } from "lucide-react";
import Container from "../../../layout/Container";
import { useAuth } from "../../../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_BASE_URL || "https://api.zephyrtechnology.co.uk";

const STATUS_STYLES = {
  Submitted: "bg-blue-100 text-blue-800",
  Received: "bg-indigo-100 text-indigo-800",
  "Under Inspection": "bg-yellow-100 text-yellow-800",
  "Offer Made": "bg-purple-100 text-purple-800",
  Paid: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
};

const STATUS_ICONS = {
  Submitted: Clock,
  Received: Package,
  "Under Inspection": Eye,
  "Offer Made": CheckCircle,
  Paid: CheckCircle,
  Rejected: XCircle,
};

const TrackRequest = () => {
  const { user } = useAuth();

  const [email, setEmail] = useState("");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
      handleTrack(user.email);
    }
  }, [user?.email]);

  const handleTrack = async (emailValue) => {
    const targetEmail = emailValue || email;
    if (!targetEmail?.trim()) return;

    setLoading(true);
    setError("");
    setSearched(true);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/sell/track?email=${encodeURIComponent(targetEmail.trim())}`
      );
      const json = await res.json();

      if (!res.ok || json.success === false) {
        throw new Error(json.message || "Failed to fetch requests");
      }

      setRequests(json.data || []);
    } catch (err) {
      setError(err.message || "Something went wrong");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleTrack();
  };

  return (
    <div className="bg-[#FBFDFF] py-10 lg:py-16">
      <Container>
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-5xl font-bold text-[#171C1E] mb-4">
              Track My Request
            </h1>
            <p className="text-[#3D494C] text-base md:text-lg">
              Enter the email address you used when submitting your sell request.
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSubmit} className="mb-10">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="input-autofill-safe w-full bg-white border border-[#BDC9CC] rounded-lg py-4 pl-12 pr-5 text-[#171C1E] outline-none focus:border-custom focus:ring-1 focus:ring-custom transition-all"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-custom text-white font-semibold py-4 px-8 rounded-lg hover:brightness-110 transition-all shadow-md disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Searching..." : "Track"}
              </button>
            </div>
          </form>

          {/* Results */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm mb-6">
              {error}
            </div>
          )}

          {searched && !loading && requests.length === 0 && !error && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-10 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">
                No sell requests found for this email address.
              </p>
            </div>
          )}

          {requests.length > 0 && (
            <div className="space-y-4">
              <p className="text-sm text-[#6D797C]">
                {requests.length} request{requests.length > 1 ? "s" : ""} found
              </p>

              {requests.map((req, index) => {
                const StatusIcon = STATUS_ICONS[req.status] || Clock;
                return (
                  <div
                    key={index}
                    className="bg-white border border-[#BDC9CC] rounded-xl p-6 shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-[#171C1E]">
                            {req.deviceModelName || "Unknown Device"}
                          </p>
                          {req.storageOptionName && (
                            <span className="text-sm text-[#6D797C]">
                              {req.storageOptionName}
                            </span>
                          )}
                        </div>
                        {req.conditionName && (
                          <p className="text-xs text-[#6D797C]">
                            {req.conditionName}
                          </p>
                        )}
                        <p className="text-xs text-[#6D797C]">
                          Reference: <span className="font-medium text-[#171C1E]">{req.stringId}</span>
                        </p>
                        <p className="text-xs text-[#6D797C]">
                          Submitted: {new Date(req.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        {req.baseOfferPrice != null && (
                          <p className="text-lg font-bold text-custom">
                            £{req.baseOfferPrice}
                          </p>
                        )}
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[req.status] || "bg-gray-100 text-gray-600"}`}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          {req.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};

export default TrackRequest;
