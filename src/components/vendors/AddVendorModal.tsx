import React, { useState } from 'react';
import { X, Building2, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { VendorRecord, VendorType, SupportedService } from '../../types/vendor';

interface AddVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddVendor: (newVendor: VendorRecord) => void;
}

const AVAILABLE_SERVICES: SupportedService[] = [
  'Cash Pickup',
  'Wallet Funding',
  'Customer Withdrawal',
  'Walk-In Transaction',
  'Agent-to-Agent Liquidity',
];

export const AddVendorModal: React.FC<AddVendorModalProps> = ({
  isOpen,
  onClose,
  onAddVendor,
}) => {
  const [vendorName, setVendorName] = useState('');
  const [vendorType, setVendorType] = useState<VendorType>('Mobile Money');
  const [integrationMode, setIntegrationMode] = useState('Direct REST API');
  const [selectedServices, setSelectedServices] = useState<SupportedService[]>([
    'Cash Pickup',
  ]);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleToggleService = (srv: SupportedService) => {
    if (selectedServices.includes(srv)) {
      if (selectedServices.length === 1) {
        setError('At least one supported service must be selected.');
        return;
      }
      setSelectedServices(selectedServices.filter((s) => s !== srv));
    } else {
      setSelectedServices([...selectedServices, srv]);
      setError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName.trim()) {
      setError('Vendor Name is required.');
      return;
    }

    const initials = vendorName
      .split(' ')
      .map((w) => w[0]?.toUpperCase() || '')
      .join('')
      .slice(0, 3) || 'VND';

    const newRecord: VendorRecord = {
      id: `TB-VND-${initials}-${Math.floor(100 + Math.random() * 900)}`,
      name: vendorName.trim(),
      type: vendorType,
      services: selectedServices,
      integrationMode,
      status: 'Pending Integration',
      lastUpdated: 'Just now',
      lastUpdatedTimestamp: Date.now(),
      logo: vendorType === 'Mobile Money' ? '/assets/vendors/mtn.svg' : '/assets/vendors/zanaco.svg',
      historicalTransactionsCount: 0,
    };

    onAddVendor(newRecord);
    onClose();
  };

  return (
    <div
      id="add-vendor-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
    >
      <div
        id="add-vendor-modal"
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-teal-50 text-[#0D93AA]">
              <Building2 size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Add New Vendor</h3>
              <p className="text-xs text-slate-500">
                Register a new gateway provider for TellerBud
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Vendor Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Vendor Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={vendorName}
              onChange={(e) => {
                setVendorName(e.target.value);
                setError(null);
              }}
              placeholder="e.g. Standard Chartered Bank"
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA]"
              autoFocus
            />
          </div>

          {/* Vendor Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Vendor Type
              </label>
              <select
                value={vendorType}
                onChange={(e) => setVendorType(e.target.value as VendorType)}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA]"
              >
                <option value="Mobile Money">Mobile Money</option>
                <option value="Bank">Bank</option>
              </select>
            </div>

            {/* Integration Mode */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Integration Mode
              </label>
              <select
                value={integrationMode}
                onChange={(e) => setIntegrationMode(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA]"
              >
                <option value="Direct REST API">Direct REST API</option>
                <option value="Merchant REST API">Merchant REST API</option>
                <option value="Bank Integration">Bank Integration</option>
                <option value="Manual Settlement">Manual Settlement</option>
              </select>
            </div>
          </div>

          {/* Supported Services */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Supported Services
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_SERVICES.map((srv) => {
                const isSelected = selectedServices.includes(srv);
                return (
                  <button
                    key={srv}
                    type="button"
                    onClick={() => handleToggleService(srv)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50 border-[#0D93AA] text-[#0D93AA] font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {isSelected && <CheckCircle2 size={12} />}
                    <span>{srv}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0b8094] rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Plus size={14} />
              <span>Register Vendor</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
