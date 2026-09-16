import React, { useState } from 'react';
import { NoticeItem } from '../types';

interface NoticesViewProps {
  notices: NoticeItem[];
  onAddNotice: (notice: NoticeItem) => void;
  onDeleteNotice: (id: string) => void;
  onTogglePin: (id: string) => void;
}

export const NoticesView: React.FC<NoticesViewProps> = ({
  notices,
  onAddNotice,
  onDeleteNotice,
  onTogglePin
}) => {
  // Form state
  const [title, setTitle] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [channel, setChannel] = useState<string>('All Players (Global)');
  const [priority, setPriority] = useState<'normal' | 'high' | 'critical'>('normal');
  const [isPopup, setIsPopup] = useState<boolean>(true);
  const [isPush, setIsPush] = useState<boolean>(true);
  const [isPinned, setIsPinned] = useState<boolean>(false);
  const [publishSuccess, setPublishSuccess] = useState<boolean>(false);

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    const newNotice: NoticeItem = {
      id: Date.now().toString(),
      noticeId: `#NTC-${String(Date.now()).slice(-4)}`,
      title,
      body,
      status: 'published',
      isPinned,
      isCritical: priority === 'critical',
      channelTag: `Channel: ${channel}`,
      devicesCount: undefined,
      viewsCount: 0,
      timestamp: 'Just now',
      popupActive: isPopup,
      pushSent: isPush
    };

    onAddNotice(newNotice);
    setTitle('');
    setBody('');
    setPublishSuccess(true);
    setTimeout(() => setPublishSuccess(false), 3000);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* Left 5 Cols: Compose Notice */}
        <div className="lg:col-span-5 bg-white rounded-xl sm:rounded-2xl border border-[#E2E8F8] shadow-xs p-3.5 sm:p-5 space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2 pb-2.5 border-b border-[#E2E8F8]">
            <span className="p-1.5 rounded-lg bg-[#E7EEFE] text-[#006591]">
              <span className="material-symbols-outlined text-base sm:text-lg">campaign</span>
            </span>
            <div>
              <h3 className="font-display font-bold text-xs sm:text-sm text-[#151C27]">
                COMPOSE NEW BROADCAST
              </h3>
              <p className="text-[10px] sm:text-[11px] text-[#6E7881]">
                Target in-app popups, alerts & notices
              </p>
            </div>
          </div>

          {publishSuccess && (
            <div className="p-2.5 rounded-lg bg-[#6FFBBE]/30 text-[#006C49] text-[11px] font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              Broadcast published & pushed to active devices!
            </div>
          )}

          <form onSubmit={handlePublish} className="space-y-3">
            {/* Title */}
            <div>
              <label className="block text-[11px] font-bold text-[#3E4850] mb-1">
                Announcement Title
              </label>
              <input
                type="text"
                placeholder="e.g. Scheduled Banking Window"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 bg-[#F0F3FF] text-xs font-semibold text-[#151C27] rounded-xl border border-transparent focus:border-[#0EA5E9] focus:bg-white outline-none"
              />
            </div>

            {/* Target Audience & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-[#3E4850] mb-1">
                  Audience Channel
                </label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  className="w-full px-2 py-1.5 bg-[#F0F3FF] text-[11px] font-semibold text-[#151C27] rounded-xl border-none outline-none"
                >
                  <option value="All Players (Global)">All Players (Global)</option>
                  <option value="VIP Players Only">VIP Players Only</option>
                  <option value="Kalyan Market Bidders">Kalyan Bidders</option>
                  <option value="Payments & Cashier">Payments & Cashier</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#3E4850] mb-1">
                  Severity Level
                </label>
                <select
                  value={priority}
                  onChange={(e: any) => setPriority(e.target.value)}
                  className="w-full px-2 py-1.5 bg-[#F0F3FF] text-[11px] font-semibold text-[#151C27] rounded-xl border-none outline-none"
                >
                  <option value="normal">Normal (Info)</option>
                  <option value="high">High Priority</option>
                  <option value="critical">Critical / Alert</option>
                </select>
              </div>
            </div>

            {/* Body */}
            <div>
              <label className="block text-[11px] font-bold text-[#3E4850] mb-1">
                Announcement Message
              </label>
              <textarea
                rows={4}
                placeholder="Compose announcement body text clearly for players..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                className="w-full p-2.5 bg-[#F0F3FF] text-[11px] text-[#151C27] rounded-xl border border-transparent focus:border-[#0EA5E9] focus:bg-white outline-none resize-none"
              />
            </div>

            {/* Delivery Toggles */}
            <div className="p-2.5 rounded-xl bg-[#F9F9FF] border border-[#E2E8F8] space-y-2 text-[11px]">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-[#3E4850] font-medium">
                  Force Modal Popup on App Launch
                </span>
                <input
                  type="checkbox"
                  checked={isPopup}
                  onChange={(e) => setIsPopup(e.target.checked)}
                  className="rounded text-[#0EA5E9] focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-[#3E4850] font-medium">
                  Send Mobile Push Notification
                </span>
                <input
                  type="checkbox"
                  checked={isPush}
                  onChange={(e) => setIsPush(e.target.checked)}
                  className="rounded text-[#0EA5E9] focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-[#3E4850] font-medium">
                  Pin to Notice Board Header
                </span>
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded text-[#0EA5E9] focus:ring-0"
                />
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-[#0EA5E9] hover:bg-[#0284c7] text-white font-bold text-[11px] rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">send</span>
              Publish Live Broadcast
            </button>
          </form>
        </div>

        {/* Right 7 Cols: Active Notice Board */}
        <div className="lg:col-span-7 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-xs sm:text-sm text-[#151C27]">
              ACTIVE NOTICE BOARD ({notices.length})
            </h3>
            <span className="text-[10px] sm:text-[11px] text-[#6E7881]">
              Live updates visible across player clients
            </span>
          </div>

          <div className="space-y-3">
            {notices.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#E2E8F8] p-8 text-center text-xs text-[#6E7881]">No notices yet. Create your first broadcast – it will be delivered via API.</div>
            ) : (
              notices.map((notice) => (
              <div
                key={notice.id}
                className={`bg-white rounded-xl sm:rounded-2xl border p-3.5 sm:p-4 shadow-xs transition-all relative ${
                  notice.isPinned
                    ? 'border-[#0EA5E9] bg-gradient-to-br from-white to-[#F0F3FF]/40'
                    : notice.isCritical
                    ? 'border-[#FFDAD6] bg-gradient-to-br from-white to-[#FFDAD6]/20'
                    : 'border-[#E2E8F8]'
                }`}
              >
                {/* Header row with badges */}
                <div className="flex flex-wrap items-center justify-between gap-1.5 pb-1.5">
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="font-code-tabular text-[11px] font-bold text-[#006591]">
                      {notice.noticeId}
                    </span>

                    {notice.isPinned && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#E7EEFE] text-[#006591] flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[11px]">keep</span>
                        PINNED
                      </span>
                    )}

                    {notice.isCritical && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#FFDAD6] text-[#BA1A1A]">
                        CRITICAL
                      </span>
                    )}

                    {notice.status === 'published' ? (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#6FFBBE]/40 text-[#006C49]">
                        PUBLISHED
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#E2E8F8] text-[#565E74]">
                        DRAFT
                      </span>
                    )}

                    {notice.channelTag && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-medium bg-[#F0F3FF] text-[#3E4850]">
                        {notice.channelTag}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onTogglePin(notice.id)}
                      className={`p-1 rounded-lg text-xs transition-colors ${
                        notice.isPinned
                          ? 'text-[#0EA5E9] bg-[#E7EEFE]'
                          : 'text-[#6E7881] hover:bg-[#F0F3FF]'
                      }`}
                      title={notice.isPinned ? 'Unpin' : 'Pin to Top'}
                    >
                      <span className="material-symbols-outlined text-sm">keep</span>
                    </button>
                    <button
                      onClick={() => onDeleteNotice(notice.id)}
                      className="p-1 rounded-lg text-[#6E7881] hover:text-[#BA1A1A] hover:bg-[#FFDAD6]/30 transition-colors"
                      title="Delete Notice"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </div>

                {/* Title and body */}
                <h4 className="font-display font-bold text-xs sm:text-sm text-[#151C27] mt-1">
                  {notice.title}
                </h4>
                <p className="text-[11px] sm:text-xs text-[#3E4850] mt-1 leading-relaxed">
                  {notice.body}
                </p>

                {/* Footer metadata */}
                <div className="mt-2.5 pt-2 border-t border-[#E2E8F8] flex flex-wrap items-center justify-between text-[10px] text-[#6E7881] gap-1.5">
                  <div className="flex items-center gap-2">
                    {typeof notice.devicesCount === 'number' && (
                      <span>{notice.devicesCount.toLocaleString()} devices</span>
                    )}
                    {typeof notice.viewsCount === 'number' && notice.viewsCount > 0 && (
                      <span>{typeof notice.devicesCount === 'number' ? '• ' : ''}{notice.viewsCount.toLocaleString()} views</span>
                    )}
                    {typeof notice.devicesCount !== 'number' && typeof notice.viewsCount !== 'number' && (
                      <span>Live from server</span>
                    )}
                  </div>
                  <div>{notice.timestamp}</div>
                </div>
              </div>
            ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
