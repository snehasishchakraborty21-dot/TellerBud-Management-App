import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, ShieldAlert } from 'lucide-react';
import { adminService } from '../services/mockAdminService';
import { CashFloatRequest, CashFloatStatus } from '../types/admin';
import { CashFloatDetailSummary } from '../components/cash-float/CashFloatDetailSummary';
import { CashFloatRequestInfoCard } from '../components/cash-float/CashFloatRequestInfoCard';
import { CashFloatAgentCard } from '../components/cash-float/CashFloatAgentCard';
import { CashFloatBusinessCard } from '../components/cash-float/CashFloatBusinessCard';
import { CashFloatAgentNoteCard } from '../components/cash-float/CashFloatAgentNoteCard';
import { CashFloatManualFulfilmentCard } from '../components/cash-float/CashFloatManualFulfilmentCard';
import { CashFloatStatusHistoryCard } from '../components/cash-float/CashFloatStatusHistoryCard';
import {
  CashFloatActionPanel,
  CashFloatModalAction,
} from '../components/cash-float/CashFloatActionPanel';
import { CashFloatActionModal } from '../components/cash-float/CashFloatActionModal';
import { ToastNotification } from '../components/shared/ToastNotification';
import { useAuth } from '../context/AuthContext';

export const CashFloatRequestDetailPage: React.FC = () => {
  const { reference } = useParams<{ reference: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [request, setRequest] = useState<CashFloatRequest | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);

  // Modal & Action state
  const [activeModal, setActiveModal] = useState<CashFloatModalAction | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadRequestData = useCallback(async () => {
    if (!reference) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    try {
      const data = await adminService.getCashFloatRequestByReference(reference);
      if (!data) {
        setNotFound(true);
        setRequest(null);
      } else {
        setNotFound(false);
        setRequest(data);
      }
    } catch (err) {
      console.error('Failed to load cash / float request details:', err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [reference]);

  useEffect(() => {
    loadRequestData();
    const unsubscribe = adminService.subscribe(loadRequestData);
    return () => unsubscribe();
  }, [loadRequestData]);

  const isBusinessOwner = currentUser?.role === 'business_owner';
  const isOtherBusiness =
    isBusinessOwner &&
    request &&
    currentUser?.businessName &&
    request.businessName.toLowerCase() !== currentUser.businessName.toLowerCase();

  // Handle Back Navigation preserving history and queues
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      const fallbackPath = isBusinessOwner
        ? '/business-owner/operations/cash-float-requests'
        : '/super-admin/operations/cash-float-requests';
      navigate(fallbackPath);
    }
  };

  // Open Modal handler
  const handleInitiateAction = (action: CashFloatModalAction) => {
    if (isOtherBusiness) return;
    setModalError(null);
    setActiveModal(action);
  };

  // Submit Modal Action handler
  const handleConfirmAction = async (payload?: {
    reason?: string;
    manualReference?: string;
    internalNote?: string;
  }) => {
    if (!request || !activeModal || isProcessing || isOtherBusiness) return;

    setIsProcessing(true);
    setModalError(null);

    let targetStatus: CashFloatStatus;
    let successToastText: string;

    switch (activeModal) {
      case 'Approve':
        targetStatus = 'Approved';
        successToastText = 'Request Approved';
        break;
      case 'Mark Processing':
        targetStatus = 'Processing';
        successToastText = 'Request marked as Processing';
        break;
      case 'Mark Fulfilled':
        targetStatus = 'Fulfilled';
        successToastText = 'Request Fulfilled';
        break;
      case 'Reject':
        targetStatus = 'Rejected';
        successToastText = 'Request Rejected';
        break;
    }

    try {
      const actorName = currentUser?.fullName || (isBusinessOwner ? 'Business Owner' : 'TellerBud Admin');
      const response = await adminService.updateCashFloatStatus(
        request.reference,
        targetStatus,
        actorName,
        payload
      );

      if (response.success) {
        setRequest(response.request);
        setActiveModal(null);
        setToastMessage(successToastText);
      } else {
        setModalError(response.error || 'Unable to update request. Try again.');
      }
    } catch (err) {
      console.error('Error executing status update:', err);
      setModalError('Unable to update request. Try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-6xl mx-auto animate-pulse">
        <div className="h-6 w-56 bg-gray-200 rounded" />
        <div className="h-20 bg-gray-200 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="h-48 bg-gray-200 rounded-xl" />
            <div className="h-36 bg-gray-200 rounded-xl" />
            <div className="h-36 bg-gray-200 rounded-xl" />
            <div className="h-48 bg-gray-200 rounded-xl" />
          </div>
          <div className="lg:col-span-4 h-64 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (notFound || !request) {
    return (
      <div className="p-6 space-y-6 max-w-4xl mx-auto py-10">
        <div>
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0D93AA] hover:text-[#0b8296] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 rounded-md px-1 py-0.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Cash / Float Requests</span>
          </button>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-8 text-center shadow-sm max-w-md mx-auto">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#102025] mb-2">
            Cash / Float request not found.
          </h2>
          <p className="text-xs text-gray-500 mb-6">
            {reference
              ? `The reference "${reference}" does not exist in the system.`
              : 'No request reference was provided.'}
          </p>
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-2 bg-[#0D93AA] text-white text-xs font-semibold rounded-lg hover:bg-[#0b8296] transition-colors cursor-pointer"
          >
            Return to Queue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto pb-12">
      {/* 1. Back Action */}
      <div>
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#0D93AA] hover:text-[#0b8296] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 rounded-md px-1 py-0.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Cash / Float Requests</span>
        </button>
      </div>

      {/* 2. Top Request Summary Card */}
      <CashFloatDetailSummary request={request} />

      {/* Cross-business warning if accessed improperly */}
      {isOtherBusiness && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-xs text-amber-800">
          <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <span>
            This Cash / Float request belongs to <strong>{request.businessName}</strong>. You are currently logged in as <strong>{currentUser?.businessName}</strong>. Actions are restricted.
          </span>
        </div>
      )}

      {/* 3. Main Area: Left Details Column & Right Actions Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (approx 68%) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: Request Information */}
          <CashFloatRequestInfoCard request={request} />

          {/* Section 2: Agent */}
          <CashFloatAgentCard request={request} />

          {/* Section 3: Associated Business */}
          <CashFloatBusinessCard request={request} />

          {/* Section 4: Agent Note */}
          {request.notes && <CashFloatAgentNoteCard note={request.notes} />}

          {/* Section 5: Manual Fulfilment (when status is Fulfilled) */}
          {request.status === 'Fulfilled' && (
            <CashFloatManualFulfilmentCard request={request} />
          )}

          {/* Section 6: Status History */}
          <CashFloatStatusHistoryCard history={request.history || []} />
        </div>

        {/* Right Column (approx 32%) */}
        <div className="lg:col-span-4 sticky top-20">
          <CashFloatActionPanel
            status={request.status}
            onInitiateAction={handleInitiateAction}
            disabled={isProcessing || Boolean(isOtherBusiness)}
            title={isBusinessOwner ? 'Business Owner Actions' : 'Business Owner Actions (TellerBud Admin Monitoring)'}
          />
        </div>
      </div>

      {/* Confirmation Modal */}
      <CashFloatActionModal
        actionType={activeModal}
        request={request}
        isOpen={Boolean(activeModal)}
        isProcessing={isProcessing}
        errorMessage={modalError}
        onClose={() => {
          if (!isProcessing) {
            setActiveModal(null);
            setModalError(null);
          }
        }}
        onConfirm={handleConfirmAction}
      />

      {/* Toast Notification */}
      <ToastNotification
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
};
