import React, { useState } from 'react';
import { SupportTicket, ChatMessage } from '../types';

interface SupportViewProps {
  tickets: SupportTicket[];
  onSendMessage: (ticketId: string, messageText: string) => void;
  onResolveTicket: (ticketId: string) => void;
  onInstantCreditDispute: (ticketId: string, amount: number) => void;
}

export const SupportView: React.FC<SupportViewProps> = ({
  tickets,
  onSendMessage,
  onResolveTicket,
  onInstantCreditDispute
}) => {
  const [selectedTicketId, setSelectedTicketId] = useState<string>(tickets[0]?.id || '');
  const [replyText, setReplyText] = useState<string>('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0] || null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;
    onSendMessage(selectedTicket.id, replyText);
    setReplyText('');
  };

  const cannedReplies = [
    'Credited to your wallet balance now.',
    'UTR verified with HDFC node. Please refresh your wallet.',
    'Please check if bank debited the amount or reversed it.',
    'Ticket marked resolved. Best of luck with your wagers!'
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* Left 4 Cols: Tickets List */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E2E8F8] shadow-xs overflow-hidden">
          <div className="p-3 sm:p-4 border-b border-[#E2E8F8] flex items-center justify-between">
            <h3 className="font-display font-bold text-xs sm:text-sm text-[#151C27]">
              DISPUTES & INQUIRIES ({tickets.length})
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFDAD6] text-[#BA1A1A]">
              Live Desk
            </span>
          </div>

          <div className="divide-y divide-[#E2E8F8] max-h-[300px] lg:max-h-[700px] overflow-y-auto">
            {tickets.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#6E7881]">No support tickets yet. Tickets submitted via API will appear here.</div>
            ) : (
              tickets.map((ticket) => {
              const isSelected = ticket.id === selectedTicketId;
              const isOpen = ticket.status === 'OPEN';
              const isInProgress = ticket.status === 'IN_PROGRESS';

              return (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicketId(ticket.id)}
                  className={`p-3 sm:p-4 cursor-pointer transition-all hover:bg-[#F0F3FF]/60 ${
                    isSelected ? 'bg-[#F0F3FF] border-l-3 sm:border-l-4 border-[#0EA5E9]' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {ticket.playerAvatar ? (
                        <img
                          src={ticket.playerAvatar}
                          alt={ticket.playerName}
                          referrerPolicy="no-referrer"
                          className="w-7 h-7 rounded-full object-cover border border-[#BEC8D2] shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-[#E7EEFE] text-[#006591] font-bold text-[11px] flex items-center justify-center font-display shrink-0">
                          {ticket.playerName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-[11px] sm:text-xs text-[#151C27]">
                          {ticket.playerName}
                        </div>
                        <div className="text-[9px] sm:text-[10px] text-[#6E7881] font-code-tabular">
                          {ticket.ticketId}
                        </div>
                      </div>
                    </div>

                    <span className="text-[9px] sm:text-[10px] text-[#6E7881] font-medium">
                      {ticket.timeAgo}
                    </span>
                  </div>

                  <p className="mt-1.5 text-[11px] font-medium text-[#3E4850] line-clamp-1">
                    {ticket.subject}
                  </p>

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[9px] sm:text-[10px] font-bold text-[#006591]">
                      {ticket.vipLevel}
                    </span>
                    {isOpen ? (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#FFDAD6] text-[#BA1A1A]">
                        OPEN
                      </span>
                    ) : isInProgress ? (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#E7EEFE] text-[#006591]">
                        IN PROGRESS
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#6FFBBE]/40 text-[#006C49]">
                        RESOLVED
                      </span>
                    )}
                  </div>
                </div>
              );
            })
            )}
          </div>
        </div>

        {/* Right 8 Cols: Live Ticket Conversation & Reconciliation */}
        {!selectedTicket ? (
          <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E2E8F8] shadow-xs flex items-center justify-center min-h-[400px] p-8 text-center text-xs text-[#6E7881]">
            Select a ticket or wait for new tickets to arrive from the server.
          </div>
        ) : (
          <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E2E8F8] shadow-xs flex flex-col min-h-[500px] lg:min-h-[700px]">
            {/* Header with Player Info & Actions */}
            <div className="p-3 sm:p-4 border-b border-[#E2E8F8] flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                {selectedTicket.playerAvatar ? (
                  <img
                    src={selectedTicket.playerAvatar}
                    alt={selectedTicket.playerName}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-[#0EA5E9] shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#E7EEFE] text-[#006591] font-bold text-xs sm:text-sm flex items-center justify-center font-display shrink-0">
                    {selectedTicket.playerName.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-display font-bold text-xs sm:text-sm text-[#151C27]">
                      {selectedTicket.playerName}
                    </h3>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#FFD700]/30 text-[#856404]">
                      {selectedTicket.vipLevel}
                    </span>
                  </div>
                  <div className="text-[10px] sm:text-xs text-[#6E7881]">
                    Wallet: <span className="font-bold text-[#006C49]">₹{selectedTicket.walletBalance.toLocaleString()}</span> • {selectedTicket.playerPhone}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {selectedTicket.status !== 'RESOLVED' && (
                  <button
                    onClick={() => onResolveTicket(selectedTicket.id)}
                    className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[11px] font-bold bg-[#6FFBBE]/40 text-[#006C49] hover:bg-[#6FFBBE] transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-xs sm:text-sm">check</span>
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>

            {/* Reconciliation Banner Card if present */}
            {selectedTicket.disputedAmount && (
              <div className="m-3 sm:m-4 p-3 rounded-xl bg-gradient-to-r from-[#F0F3FF] to-[#E7EEFE]/50 border border-[#C9E6FF] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                <div className="space-y-0.5 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#0EA5E9] text-white">
                      Dispute Recon
                    </span>
                    <span className="font-display font-bold text-xs text-[#151C27]">
                      Amount: ₹{selectedTicket.disputedAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#6E7881]">
                    Gateway: <span className="font-semibold text-[#151C27]">{selectedTicket.gateway}</span> • Ref UTR: <span className="font-code-tabular font-bold text-[#006591]">{selectedTicket.disputedUtr}</span>
                  </div>
                  <div className="text-[10px] text-[#006C49] font-medium">
                    Status: {selectedTicket.disputedStatus}
                  </div>
                </div>

                <button
                  onClick={() =>
                    onInstantCreditDispute(
                      selectedTicket.id,
                      selectedTicket.disputedAmount || 0
                    )
                  }
                  className="px-3 py-1.5 bg-[#006C49] hover:bg-[#005237] text-white font-bold text-[11px] rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">verified</span>
                  Instant Credit ₹{selectedTicket.disputedAmount.toLocaleString()} & Resolve
                </button>
              </div>
            )}

            {/* Chat Thread */}
            <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3">
              {selectedTicket.messages.map((msg) => {
                const isAgent = msg.sender === 'agent';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] font-bold text-[#6E7881]">
                        {msg.senderName}
                      </span>
                      <span className="text-[9px] text-[#BEC8D2] font-code-tabular">
                        {msg.time}
                      </span>
                    </div>

                    <div
                      className={`max-w-xs sm:max-w-md p-2.5 sm:p-3 rounded-2xl text-[11px] leading-relaxed ${
                        isAgent
                          ? 'bg-[#006591] text-white rounded-tr-xs'
                          : 'bg-[#F0F3FF] text-[#151C27] border border-[#E2E8F8] rounded-tl-xs'
                      }`}
                    >
                      <p>{msg.text}</p>

                      {msg.attachmentImg && (
                        <div className="mt-2 pt-1.5 border-t border-black/10">
                          <img
                            src={msg.attachmentImg}
                            alt="Dispute Attachment"
                            referrerPolicy="no-referrer"
                            onClick={() => setPreviewImage(msg.attachmentImg || null)}
                            className="rounded-lg max-h-36 sm:max-h-48 w-auto object-cover border border-black/15 cursor-pointer hover:opacity-90 transition-opacity"
                          />
                          <span className="text-[9px] text-[#6E7881] mt-0.5 block">
                            Click to view full receipt
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Canned replies */}
            <div className="p-2 sm:p-3 border-t border-[#E2E8F8] bg-[#F9F9FF] flex flex-wrap gap-1.5">
              <span className="text-[9px] font-bold text-[#6E7881] self-center">
                Quick Fill:
              </span>
              {cannedReplies.map((reply, idx) => (
                <button
                  key={idx}
                  onClick={() => setReplyText(reply)}
                  className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white hover:bg-[#E7EEFE] text-[#3E4850] border border-[#E2E8F8] transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSend} className="p-2.5 sm:p-4 border-t border-[#E2E8F8] flex items-center gap-2">
              <input
                type="text"
                placeholder={`Type reply to ${selectedTicket.playerName}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 px-3 py-1.5 sm:py-2 bg-[#F0F3FF] text-[11px] text-[#151C27] rounded-xl border border-transparent focus:border-[#0EA5E9] focus:bg-white outline-none"
              />
              <button
                type="submit"
                className="px-3 py-1.5 sm:py-2 bg-[#0EA5E9] hover:bg-[#0284c7] text-white font-bold text-[11px] rounded-xl shadow-xs flex items-center gap-1 transition-colors"
              >
                <span>Send</span>
                <span className="material-symbols-outlined text-xs">send</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Image preview modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 backdrop-blur-xs"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-lg w-full bg-white rounded-2xl overflow-hidden shadow-2xl p-2">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
            <img
              src={previewImage}
              alt="Receipt Preview"
              referrerPolicy="no-referrer"
              className="w-full max-h-[80vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
